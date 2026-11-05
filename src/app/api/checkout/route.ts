import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { unwrapRow } from "@/lib/embedded";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeCurrency, toMinorUnits } from "@/lib/currency";
import { minimumChargeMajor } from "@/lib/fx.server";

export const dynamic = "force-dynamic";

/**
 * Starts a Stripe Checkout session for an order.
 *
 * The amount and currency are read from the order's LOCKED local charge
 * (set authoritatively at acceptance), never from the client. There is no
 * Stripe Connect, destination charge, transfer or application fee.
 */
export async function POST(request: Request) {
  let orderId: unknown;
  try {
    const body = await request.json();
    orderId = body?.orderId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof orderId !== "string" || orderId.length === 0) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Price authority lives on the accepted proposal, not on a client-writable
  // copy. Verify order ownership + that the order is still awaiting payment.
  let order: {
    id: string;
    price: number;
    currency: string | null;
    base_amount: number | null;
    base_currency: string | null;
    charge_amount: number | null;
    charge_currency: string | null;
    status: string;
    proposal_id: string | null;
    student_id: string;
    helper_id: string | null;
    created_at: string;
  };
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, price, currency, base_amount, base_currency, charge_amount, charge_currency, status, proposal_id, student_id, helper_id, created_at",
      )
      .eq("id", orderId)
      .single();
    if (error || !data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    order = data;
  } catch (err) {
    console.error("checkout: order fetch failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  if (order.student_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "payment_pending") {
    return NextResponse.json({ error: "This order is not awaiting payment." }, { status: 409 });
  }

  if (!order.proposal_id || !order.helper_id) {
    return NextResponse.json(
      { error: "This order is missing proposal or helper details." },
      { status: 409 },
    );
  }

  // Never let a proposal be paid twice: refuse if a paid payment already exists.
  const { data: existingPayment } = await adminClient
    .from("payments")
    .select("id")
    .eq("order_id", order.id)
    .eq("status", "paid")
    .maybeSingle();
  if (existingPayment) {
    return NextResponse.json({ error: "This order has already been paid." }, { status: 409 });
  }

  // The accepted proposal is the single authority for the amount.
  let proposal: {
    id: string;
    price: number;
    status: string;
    expires_at: string | null;
    request_id: string;
    helper_id: string;
    description: string | null;
    request: { title: string }[] | { title: string } | null;
  } | null;
  try {
    const { data, error } = await adminClient
      .from("proposals")
      .select(
        "id, price, status, expires_at, request_id, helper_id, description, request:requests(title)",
      )
      .eq("id", order.proposal_id)
      .single();
    if (error) {
      console.error("checkout: proposal fetch failed", error);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
    proposal = data;
  } catch (err) {
    console.error("checkout: unexpected failure loading proposal", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  if (
    !proposal ||
    proposal.id !== order.proposal_id ||
    proposal.helper_id !== order.helper_id ||
    proposal.status !== "accepted"
  ) {
    return NextResponse.json(
      { error: "This proposal is no longer valid for payment." },
      { status: 409 },
    );
  }

  // A declined/expired proposal must never be paid.
  if (proposal.expires_at && new Date(proposal.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This offer has expired. Please ask the helper for a new quote." },
      { status: 409 },
    );
  }

  // The helper's quoted amount is frozen on the order; a mismatch with the
  // accepted proposal means the proposal was edited after acceptance.
  const acceptedPrice = Number(order.price);
  const quotedPrice = Number(proposal.price);
  if (
    !Number.isFinite(acceptedPrice) ||
    !Number.isFinite(quotedPrice) ||
    acceptedPrice !== quotedPrice
  ) {
    console.error("checkout: proposal drifted from accepted order", {
      orderId: order.id,
      proposalId: proposal.id,
      orderPrice: order.price,
      proposalPrice: proposal.price,
    });
    return NextResponse.json(
      { error: "This offer has changed since you accepted it. Please review and try again." },
      { status: 409 },
    );
  }

  const origin = new URL(request.url).origin;
  const requestTitle = unwrapRow<{ title: string }>(proposal.request)?.title ?? null;
  const title = requestTitle || "Acadivo Order";

  // Charge the LOCKED local amount, falling back to the base quote for legacy
  // orders that predate the charge columns.
  const chargeCurrency = normalizeCurrency(order.charge_currency ?? order.currency);
  const chargeAmount =
    order.charge_amount !== null && Number.isFinite(Number(order.charge_amount))
      ? Number(order.charge_amount)
      : quotedPrice;

  const minimum = minimumChargeMajor(chargeCurrency);
  if (!Number.isFinite(chargeAmount) || chargeAmount < minimum) {
    console.error("checkout: amount below Stripe minimum", {
      orderId: order.id,
      chargeCurrency,
      chargeAmount,
      minimum,
    });
    return NextResponse.json(
      { error: `The amount is below the minimum we can charge in ${chargeCurrency}.` },
      { status: 409 },
    );
  }

  const unitAmount = toMinorUnits(chargeAmount, chargeCurrency);
  if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
    console.error("checkout: non-positive amount computed", {
      orderId: order.id,
      chargeCurrency,
      chargeAmount,
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const paymentDeadline = Math.floor(new Date(order.created_at).getTime() / 1000) + 24 * 60 * 60;
  const earliestAllowedExpiry = Math.floor(Date.now() / 1000) + 30 * 60;
  if (!Number.isFinite(paymentDeadline) || paymentDeadline < earliestAllowedExpiry) {
    return NextResponse.json(
      { error: "The payment window has expired. Please ask the helper for a new proposal." },
      { status: 409 },
    );
  }

  // Reuse an existing open Checkout Session when the student clicks Pay more
  // than once. Reusing the same session keeps this order's tracking row (and
  // Stripe's session) singular; stale attempts are expired instead of left open.
  let trackedSessionIds: string[];
  try {
    trackedSessionIds = await listTrackedCheckoutSessions(order.id);
  } catch (err) {
    console.error("checkout: unable to read tracked checkout sessions", {
      orderId: order.id,
      error: err,
    });
    return NextResponse.json(
      {
        error:
          "We couldn't secure your checkout session, so no payment was taken. Please try again in a moment.",
      },
      { status: 503 },
    );
  }

  const sessionsToExpire: string[] = [];
  let reusableSession: Stripe.Checkout.Session | null = null;

  for (const sessionId of trackedSessionIds) {
    let existing: Stripe.Checkout.Session;
    try {
      existing = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      if (isMissingStripeResource(err)) {
        await deleteTrackedCheckoutSession(sessionId);
        continue;
      }
      console.error("checkout: unable to inspect a previous checkout session", {
        orderId: order.id,
        sessionId,
        error: err,
      });
      return NextResponse.json(
        {
          error:
            "We couldn't safely reset your previous checkout attempt, so no payment was taken. Please try again in a moment.",
        },
        { status: 503 },
      );
    }

    if (
      existing.mode === "payment" &&
      existing.payment_status === "paid" &&
      existing.client_reference_id === order.id
    ) {
      return NextResponse.json(
        {
          error:
            "This order has already been paid. We're confirming your payment — refresh in a moment.",
        },
        { status: 409 },
      );
    }

    const matchesCurrentCharge =
      existing.metadata?.order_id === order.id &&
      existing.client_reference_id === order.id &&
      existing.amount_total === unitAmount &&
      existing.currency?.toLowerCase() === chargeCurrency.toLowerCase();
    const hasEnoughTimeLeft =
      typeof existing.expires_at === "number" &&
      existing.expires_at * 1000 > Date.now() + 5 * 60 * 1000;

    if (
      existing.status === "open" &&
      existing.payment_status === "unpaid" &&
      matchesCurrentCharge &&
      hasEnoughTimeLeft &&
      existing.url
    ) {
      if (!reusableSession) {
        reusableSession = existing;
        continue;
      }
    }

    if (existing.status === "open") {
      sessionsToExpire.push(existing.id);
    } else {
      // Expired or completed-but-unpaid sessions cannot be reused.
      await deleteTrackedCheckoutSession(existing.id);
    }
  }

  for (const sessionId of sessionsToExpire) {
    try {
      await stripe.checkout.sessions.expire(sessionId);
    } catch (err) {
      console.error("checkout: unable to expire a previous checkout session", {
        orderId: order.id,
        sessionId,
        error: err,
      });
      return NextResponse.json(
        {
          error:
            "We couldn't safely reset your previous checkout attempt, so no payment was taken. Please try again in a moment.",
        },
        { status: 503 },
      );
    }
    await deleteTrackedCheckoutSession(sessionId);
  }

  if (reusableSession?.url) {
    return NextResponse.json({ sessionId: reusableSession.id, url: reusableSession.url });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: paymentDeadline,
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      client_reference_id: order.id,
      line_items: [
        {
          price_data: {
            currency: chargeCurrency.toLowerCase(),
            product_data: {
              name: title,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: order.id,
      },
      payment_intent_data: {
        metadata: {
          order_id: order.id,
        },
      },
      success_url: `${origin}/orders/${order.id}/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/orders/${order.id}/payment`,
    });

    const { error: trackingError } = await adminClient
      .from("order_checkout_sessions")
      .insert({ session_id: session.id, order_id: order.id });
    if (trackingError) {
      console.error("checkout: session tracking failed; expiring the untracked session", {
        orderId: order.id,
        sessionId: session.id,
        error: trackingError,
      });
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (expireError) {
        console.error("checkout: unable to expire the untracked session", {
          orderId: order.id,
          sessionId: session.id,
          error: expireError,
        });
      }
      return NextResponse.json(
        {
          error:
            "We couldn't finish securing your checkout session, so no payment was taken. Please try again in a moment.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("checkout: stripe session creation failed", { orderId: order.id, error: err });
    return NextResponse.json(
      { error: "We couldn't start checkout, so no payment was taken. Please try again." },
      { status: 503 },
    );
  }
}

async function listTrackedCheckoutSessions(orderId: string): Promise<string[]> {
  const { data, error } = await adminClient
    .from("order_checkout_sessions")
    .select("session_id")
    .eq("order_id", orderId);
  if (error) throw error;
  return (data ?? []).map((row) => row.session_id as string);
}

async function deleteTrackedCheckoutSession(sessionId: string): Promise<void> {
  const { error } = await adminClient
    .from("order_checkout_sessions")
    .delete()
    .eq("session_id", sessionId);
  if (error) {
    console.error("checkout: unable to delete a stale tracking row", { sessionId, error });
  }
}

function isMissingStripeResource(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "resource_missing"
  );
}
