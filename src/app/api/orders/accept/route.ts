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

  // The RPC rechecks the proposal price and creates the order while holding
  // request/proposal row locks. A quote revised in parallel cannot be accepted
  // at a stale amount.
  const { data: acceptedOrderId, error: acceptError } = await adminClient.rpc(
    "accept_proposal_with_charge",
    {
      p_proposal_id: proposal.id,
      p_student_id: user.id,
      p_expected_price: baseAmount,
      p_expected_currency: baseCurrency,
      p_charge_currency: charge.currency,
      p_charge_amount: charge.amount,
    },
  );

  if (acceptError) {
    if (acceptError.code === "23505") {
      const { data: existingOrder } = await adminClient
        .from("orders")
        .select("id, student_id")
        .eq("proposal_id", proposal.id)
        .maybeSingle();
      if (existingOrder?.student_id === user.id) {
        return NextResponse.json({ orderId: existingOrder.id });
      }
      return NextResponse.json(
        { error: "This proposal has already been accepted." },
        { status: 409 },
      );
    }
    if (acceptError.code === "P0001") {
      return NextResponse.json({ error: acceptError.message }, { status: 409 });
    }
    console.error("accept: proposal acceptance failed", acceptError);
    return NextResponse.json(
      { error: "Could not accept this proposal. Please try again." },
      { status: 500 },
    );
  }
  if (typeof acceptedOrderId !== "string") {
    console.error("accept: proposal acceptance returned no order id");
    return NextResponse.json({ error: "Could not confirm the accepted order." }, { status: 500 });
  }

  // Run after the response so the email fan-out never slows the student's
  // redirect to the payment screen.
  after(() =>
    notifyOrderActivity(acceptedOrderId, () => ({
      type: "payment",
      message: "A proposal was accepted — an order is ready for payment.",
      link: `/orders/${acceptedOrderId}`,
      emailSubject: "Proposal accepted — payment is next",
      emailBody:
        "A proposal for this request was just accepted and an order has been created. The student now needs to complete payment for the work to begin.",
      emailLinkLabel: "Open the order",
      audience: ["student", "helper", "admin"],
      inAppRoles: ["helper", "admin"],
      actorId: user.id,
    })),
  );

  return NextResponse.json({ orderId: acceptedOrderId });
}
