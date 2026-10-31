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

  let unpaidOrderId: string | null = null;
  if (proposal.status === "accepted") {
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .select("id, status, created_at")
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
    unpaidOrderId = order.id;

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

    let sessionIds = (sessions ?? []).map(({ session_id }) => session_id);
    if (sessionsError) {
      console.warn(
        "proposal decline: session tracking unavailable; searching Stripe sessions",
        sessionsError,
      );
      sessionIds = [];
      let startingAfter: string | undefined;
      const created = Math.floor(new Date(order.created_at).getTime() / 1000);
      if (!Number.isFinite(created)) {
        return NextResponse.json(
          { error: "Unable to safely cancel checkout. Please contact support." },
          { status: 500 },
        );
      }

      try {
        let hasMore = true;
        while (hasMore) {
          const batch = await stripe.checkout.sessions.list({
            created: { gte: created },
            limit: 100,
            ...(startingAfter ? { starting_after: startingAfter } : {}),
          });
          sessionIds.push(
            ...batch.data
              .filter((session) => session.metadata?.order_id === order.id)
              .map((session) => session.id),
          );
          hasMore = batch.has_more;
          startingAfter = batch.data.at(-1)?.id;
          if (hasMore && !startingAfter) {
            throw new Error("Stripe returned an incomplete checkout session page.");
          }
        }
      } catch (error) {
        console.error("proposal decline: Stripe session search failed", error);
        return NextResponse.json(
          { error: "Unable to safely cancel checkout. Please try again." },
          { status: 503 },
        );
      }
    }

    for (const sessionId of sessionIds) {
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

  if (proposal.status === "pending") {
    const { data: declinedProposal, error: declineError } = await supabase
      .from("proposals")
      .update({ status: "declined" })
      .eq("id", proposal.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (declineError) {
      console.error("proposal decline: database operation failed", declineError);
      return NextResponse.json(
        { error: "This proposal could not be declined. Refresh and try again." },
        { status: 409 },
      );
    }
    if (!declinedProposal) {
      return NextResponse.json(
        { error: "This proposal has already been resolved. Refresh and try again." },
        { status: 409 },
      );
    }

    const { count, error: countError } = await supabase
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("request_id", proposal.request_id)
      .eq("status", "pending");
    if (countError) {
      console.error("proposal decline: pending proposal lookup failed", countError);
      return NextResponse.json(
        { error: "Proposal declined, but the request status could not be updated." },
        { status: 500 },
      );
    }
    if (count === 0) {
      const { error: requestUpdateError } = await supabase
        .from("requests")
        .update({ status: "requested" })
        .eq("id", proposal.request_id)
        .eq("status", "proposal_sent");
      if (requestUpdateError) {
        console.error("proposal decline: request status update failed", requestUpdateError);
        return NextResponse.json(
          { error: "Proposal declined, but the request status could not be updated." },
          { status: 500 },
        );
      }
    }
  } else {
    const { error: declineError } = await supabase.rpc("decline_unpaid_proposal", {
      p_proposal_id: proposal.id,
      p_request_id: proposal.request_id,
    });
    if (declineError) {
      if (declineError.code !== "PGRST202" || !unpaidOrderId) {
        console.error("proposal decline: database operation failed", declineError);
        return NextResponse.json(
          {
            error:
              "This unpaid accepted proposal could not be declined. Apply the latest database migration and try again.",
          },
          { status: 409 },
        );
      }

      console.warn("proposal decline: database function unavailable; using guarded fallback");
      const { data: declinedProposal, error: updateError } = await adminClient
        .from("proposals")
        .update({ status: "declined" })
        .eq("id", proposal.id)
        .eq("status", "accepted")
        .select("id")
        .maybeSingle();
      if (updateError || !declinedProposal) {
        console.error("proposal decline: fallback proposal update failed", updateError);
        return NextResponse.json(
          { error: "This proposal could not be declined. Refresh and try again." },
          { status: 409 },
        );
      }

      const { data: deletedOrder, error: deleteError } = await adminClient
        .from("orders")
        .delete()
        .eq("id", unpaidOrderId)
        .eq("status", "payment_pending")
        .select("id")
        .maybeSingle();
      if (deleteError || !deletedOrder) {
        console.error("proposal decline: fallback order cancellation failed", deleteError);
        const { error: restoreError } = await adminClient
          .from("proposals")
          .update({ status: "accepted" })
          .eq("id", proposal.id)
          .eq("status", "declined");
        if (restoreError) {
          console.error("proposal decline: fallback proposal restore failed", restoreError);
        }
        return NextResponse.json(
          { error: "This unpaid order could not be cancelled. Refresh and try again." },
          { status: 409 },
        );
      }

      const { count, error: countError } = await adminClient
        .from("proposals")
        .select("id", { count: "exact", head: true })
        .eq("request_id", proposal.request_id)
        .eq("status", "pending");
      if (countError) {
        console.error("proposal decline: fallback pending proposal lookup failed", countError);
        return NextResponse.json(
          { error: "Proposal declined, but the request status could not be updated." },
          { status: 500 },
        );
      }

      const { error: requestUpdateError } = await adminClient
        .from("requests")
        .update({ status: count ? "proposal_sent" : "requested" })
        .eq("id", proposal.request_id)
        .eq("status", "accepted");
      if (requestUpdateError) {
        console.error(
          "proposal decline: fallback request status update failed",
          requestUpdateError,
        );
        return NextResponse.json(
          { error: "Proposal declined, but the request status could not be updated." },
          { status: 500 },
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
