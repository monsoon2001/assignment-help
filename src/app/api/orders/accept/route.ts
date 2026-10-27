import { NextResponse, after } from "next/server";
import { unwrapRow } from "@/lib/embedded";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { resolveLocalCharge } from "@/lib/charge.server";
import { normalizeCurrency } from "@/lib/currency";
import { notifyOrderActivity } from "@/lib/notify.server";

export const dynamic = "force-dynamic";

/**
 * Accepts a helper's proposal on behalf of the signed-in student and creates the
 * order with the student's LOCAL charge currency/amount locked in.
 *
 * The client never supplies the price, currency or charge — all authority is
 * re-read from the DB and the charge is derived server-side from the student's
 * saved location, so a tampered request cannot change what is charged.
 */
export async function POST(request: Request) {
  let proposalId: unknown;
  let requestId: unknown;
  try {
    const body = await request.json();
    proposalId = body?.proposal_id;
    requestId = body?.request_id;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof proposalId !== "string" || proposalId.length === 0) {
    return NextResponse.json({ error: "Missing proposal id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to accept a proposal." },
      { status: 401 },
    );
  }

  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select(
      "id, helper_id, price, currency, status, request_id, request:requests(id, student_id, status, deadline)",
    )
    .eq("id", proposalId)
    .maybeSingle();

  if (proposalError || !proposal) {
    return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  }

  const req = unwrapRow<{
    id: string;
    student_id: string;
    status: string;
    deadline: string | null;
  }>(proposal.request);
  if (!req) {
    return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  }
  if (proposal.status !== "pending") {
    return NextResponse.json(
      { error: "This proposal can no longer be accepted." },
      { status: 409 },
    );
  }
  if (req.student_id !== user.id) {
    return NextResponse.json(
      { error: "You can only accept proposals on your own requests." },
      { status: 403 },
    );
  }
  if (typeof requestId === "string" && req.id !== requestId) {
    return NextResponse.json({ error: "Proposal does not match this request." }, { status: 409 });
  }
  if (req.status !== "requested" && req.status !== "proposal_sent") {
    return NextResponse.json({ error: "This request has already been resolved." }, { status: 409 });
  }

  const baseAmount = Number(proposal.price);
  const baseCurrency = normalizeCurrency(proposal.currency);

  // The student's saved location decides the charge currency.
  const { data: profile } = await supabase
    .from("users")
    .select("country")
    .eq("id", user.id)
    .maybeSingle();

  const charge = await resolveLocalCharge(baseAmount, baseCurrency, profile?.country ?? null);
  if (!charge) {
    return NextResponse.json(
      {
        error: "We couldn't determine the price in your local currency. Please try again shortly.",
      },
      { status: 409 },
    );
  }

  // Insert with the service role: the financial columns are computed here from
  // the proposal and the student's local currency, never from client input, so
  // the client-facing orders INSERT policy is intentionally removed (see the
  // harden_order_insert migration).
  const now = new Date().toISOString();
  const { data: order, error: insertError } = await adminClient
    .from("orders")
    .insert({
      proposal_id: proposal.id,
      student_id: user.id,
      helper_id: proposal.helper_id,
      status: "payment_pending",
      price: baseAmount,
      currency: baseCurrency,
      base_currency: baseCurrency,
      base_amount: baseAmount,
      charge_currency: charge.currency,
      charge_amount: charge.amount,
      charge_locked_at: now,
      deadline: req.deadline ?? null,
    })
    .select("id")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "This proposal has already been accepted." },
        { status: 409 },
      );
    }
    console.error("accept: order insert failed", insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { error: requestError } = await supabase
    .from("requests")
    .update({ status: "accepted" })
    .eq("id", req.id);
  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 500 });
  }

  const { error: proposalUpdateError } = await supabase
    .from("proposals")
    .update({ status: "accepted" })
    .eq("id", proposal.id);
  if (proposalUpdateError) {
    return NextResponse.json({ error: proposalUpdateError.message }, { status: 500 });
  }

  // Run after the response so the email fan-out never slows the student's
  // redirect to the payment screen.
  after(() =>
    notifyOrderActivity(order.id, () => ({
      type: "payment",
      message: "A proposal was accepted — an order is ready for payment.",
      link: `/orders/${order.id}`,
      emailSubject: "Proposal accepted — payment is next",
      emailBody:
        "A proposal for this request was just accepted and an order has been created. The student now needs to complete payment for the work to begin.",
      emailLinkLabel: "Open the order",
      audience: ["student", "helper", "admin"],
      inAppRoles: ["helper", "admin"],
      actorId: user.id,
    })),
  );

  return NextResponse.json({ orderId: order.id });
}
