import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { proposal_id?: unknown; request_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const proposalId = body.proposal_id;
  const requestId = body.request_id;
  if (
    typeof proposalId !== "string" ||
    proposalId.length === 0 ||
    typeof requestId !== "string" ||
    requestId.length === 0
  ) {
    return NextResponse.json({ error: "Missing proposal or request id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to decline a proposal." },
      { status: 401 },
    );
  }

  const { data: proposal, error: proposalError } = await adminClient
    .from("proposals")
    .select("id, status, request_id")
    .eq("id", proposalId)
    .maybeSingle();
  if (proposalError) {
    console.error("proposal decline: proposal lookup failed", proposalError);
    return NextResponse.json(
      { error: "Unable to decline this proposal right now." },
      { status: 500 },
    );
  }
  if (!proposal || proposal.request_id !== requestId) {
    return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  }

  const { data: ownerRequest, error: requestError } = await adminClient
    .from("requests")
    .select("id, student_id")
    .eq("id", requestId)
    .maybeSingle();
  if (requestError) {
    console.error("proposal decline: request lookup failed", requestError);
    return NextResponse.json(
      { error: "Unable to decline this proposal right now." },
      { status: 500 },
    );
  }
  if (!ownerRequest || ownerRequest.student_id !== user.id) {
    return NextResponse.json(
      { error: "You can only decline proposals on your own requests." },
      { status: 403 },
    );
  }
  if (proposal.status === "declined") {
    return NextResponse.json({ ok: true });
  }
  if (proposal.status !== "pending" && proposal.status !== "accepted") {
    return NextResponse.json(
      { error: "This proposal has already been resolved." },
      { status: 409 },
    );
  }

  if (proposal.status === "accepted") {
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id, status")
      .eq("proposal_id", proposal.id)
      .maybeSingle();
    if (orderError) {
      console.error("proposal decline: order lookup failed", orderError);
      return NextResponse.json(
        { error: "Unable to decline this proposal right now." },
        { status: 500 },
      );
    }
    if (!order || order.status !== "payment_pending") {
      return NextResponse.json(
        { error: "This proposal can no longer be declined." },
        { status: 409 },
      );
    }

    const { data: paidPayment, error: paymentError } = await adminClient
      .from("payments")
      .select("id")
      .eq("order_id", order.id)
      .eq("status", "paid")
      .maybeSingle();
    if (paymentError) {
      console.error("proposal decline: payment lookup failed", paymentError);
      return NextResponse.json(
        { error: "Unable to decline this proposal right now." },
        { status: 500 },
      );
    }
    if (paidPayment) {
      return NextResponse.json({ error: "This proposal has already been paid." }, { status: 409 });
    }

    const { data: sessions, error: sessionsError } = await adminClient
      .from("order_checkout_sessions")
      .select("session_id")
      .eq("order_id", order.id);
    if (sessionsError) {
      console.error("proposal decline: checkout session lookup failed", sessionsError);
      return NextResponse.json(
        { error: "Unable to safely cancel checkout. Please try again." },
        { status: 500 },
      );
    }

    for (const { session_id: sessionId } of sessions ?? []) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.status === "complete") {
          return NextResponse.json(
            { error: "Payment is processing. Refresh the page before declining." },
            { status: 409 },
          );
        }
        if (session.status === "open") {
          await stripe.checkout.sessions.expire(sessionId);
        }
      } catch (error) {
        console.error("proposal decline: failed to expire checkout session", {
          sessionId,
          error,
        });
        return NextResponse.json(
          { error: "Unable to safely cancel checkout. Please try again." },
          { status: 409 },
        );
      }
    }
  }

  const { error: declineError } = await supabase.rpc("decline_unpaid_proposal", {
    p_proposal_id: proposal.id,
    p_request_id: proposal.request_id,
  });
  if (declineError) {
    console.error("proposal decline: database operation failed", declineError);
    return NextResponse.json(
      { error: "This proposal could not be declined. Refresh and try again." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
