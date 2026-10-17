import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminClient } from "@/lib/supabase/admin";
import { normalizeCurrency } from "@/lib/currency";
import { rateBetween } from "@/lib/fx.server";
import { notifyOrderActivity } from "@/lib/notify.server";

export const dynamic = "force-dynamic";

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Record a processed Stripe event id. Returns false when the event was already
 * seen, so a replayed delivery cannot double-count.
 */
async function claimEvent(eventId: string, eventType: string): Promise<boolean> {
  const { data, error } = await adminClient
    .from("processed_stripe_events")
    .insert({ event_id: eventId, event_type: eventType })
    .select("event_id")
    .maybeSingle();

  if (error) {
    // 23505 = duplicate key → already processed.
    if (error.code === "23505") return false;
    console.error("webhook: failed to claim event", error);
    throw error;
  }
  return Boolean(data);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Signature is verified against the RAW body.
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const claimed = await claimEvent(event.id, event.type);
    if (!claimed) {
      // Replay of an event we already handled.
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object);
    } else if (event.type === "charge.refunded") {
      await handleChargeRefunded(event.data.object);
    } else if (event.type === "charge.dispute.created") {
      await handleDisputeCreated(event.data.object);
    } else if (event.type === "payment_intent.succeeded") {
      await handlePaymentIntentSucceeded(event.data.object);
    } else if (event.type === "charge.succeeded") {
      await handleChargeSucceeded(event.data.object);
    }
  } catch (err) {
    console.error("webhook: handler failure", err);
    // Release the event so Stripe's retry can process it again.
    await adminClient
      .from("processed_stripe_events")
      .delete()
      .eq("event_id", event.id);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Only a confirmed one-time card payment may unlock an order.
  if (session.mode !== "payment" || session.payment_status !== "paid") {
    return;
  }

  const intentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.error("webhook: checkout.session.completed missing order_id metadata");
    return;
  }

  if (session.client_reference_id && session.client_reference_id !== orderId) {
    console.error("webhook: client_reference_id mismatch", {
      orderId,
      clientReferenceId: session.client_reference_id,
    });
    return;
  }

  // The order carries the authoritative base + locked charge.
  const { data: orderRow } = await adminClient
    .from("orders")
    .select("base_amount, base_currency, charge_currency, charge_amount")
    .eq("id", orderId)
    .maybeSingle();

  // Pull the real Stripe fee + net from the charge's balance transaction, and
  // the receipt URL from the charge.
  let receiptUrl: string | null = null;
  let stripeFeeCad: number | null = null;
  let balanceTransactionId: string | null = null;

  if (intentId) {
    const info = await fetchStripeFee(intentId);
    receiptUrl = info.receiptUrl;
    stripeFeeCad = info.stripeFeeCad;
    balanceTransactionId = info.balanceTransactionId;
  }

  const chargeCurrency = normalizeCurrency(
    orderRow?.charge_currency ?? session.currency ?? "cad"
  );
  const chargeAmount = round2(
    Number(orderRow?.charge_amount ?? (Number(session.amount_total ?? 0) / 100))
  );

  // Convert the real charge to the internal CAD ledger.
  let chargeToCadRate: number | null = chargeCurrency === "CAD" ? 1 : null;
  if (chargeCurrency !== "CAD") {
    chargeToCadRate = await rateBetween(chargeCurrency, "CAD");
  }
  const grossCad = round2(
    chargeCurrency === "CAD"
      ? chargeAmount
      : chargeToCadRate === null
        ? 0
        : chargeAmount * chargeToCadRate
  );

  // What the platform pays the helper's base quote would be in CAD; the
  // difference is the platform's absorbed FX/processing buffer. Admin-only.
  const baseAmount = Number(orderRow?.base_amount ?? chargeAmount);
  const baseCurrency = normalizeCurrency(orderRow?.base_currency ?? chargeCurrency);
  let baseCad = grossCad;
  if (baseCurrency !== "CAD") {
    const baseRate = await rateBetween(baseCurrency, "CAD");
    baseCad = baseRate === null ? grossCad : round2(baseAmount * baseRate);
  } else {
    baseCad = round2(baseAmount);
  }
  const platformFeeCad = round2(grossCad - baseCad);

  const netCad = round2(grossCad - (stripeFeeCad ?? 0));

  // Record the payment FIRST: the order transition trigger requires a `paid`
  // payment row to exist before an order may leave payment_pending.
  const { error: paymentError } = await adminClient.from("payments").upsert(
    {
      order_id: orderId,
      amount: grossCad,
      currency: "CAD",
      gross_cad: grossCad,
      stripe_fee_cad: stripeFeeCad,
      net_cad: netCad,
      charge_currency: chargeCurrency,
      charge_amount: chargeAmount,
      charge_to_cad_rate: chargeToCadRate,
      platform_fee_cad: platformFeeCad,
      helper_payout_status: "unpaid",
      stripe_payment_intent_id: intentId,
      stripe_balance_transaction_id: balanceTransactionId,
      receipt_url: receiptUrl,
      customer_email:
        typeof session.customer_email === "string" ? session.customer_email : null,
      status: "paid",
    },
    { onConflict: "stripe_payment_intent_id", ignoreDuplicates: true }
  );

  if (paymentError) {
    console.error("webhook: payment upsert failed", paymentError);
    throw paymentError;
  }

  // The initial fee lookup can race the balance transaction (it may not be
  // settled when the checkout event lands), and a duplicate delivery is ignored
  // by the upsert above. Backfill the fee/net on the existing row when missing.
  if (intentId) {
    await backfillPaymentFee(intentId);
  }

  // The webhook is the ONLY writer that transitions an order to in_progress.
  // The status filter makes double delivery harmless.
  const { error: orderError } = await adminClient
    .from("orders")
    .update({ status: "in_progress" })
    .eq("id", orderId)
    .eq("status", "payment_pending");

  if (orderError) {
    console.error("webhook: order update failed", orderError);
    throw orderError;
  }

  revalidatePath(`/orders/${orderId}`, "page");
  revalidatePath(`/orders/${orderId}/confirmed`, "page");

  after(() =>
    notifyOrderActivity(orderId, () => ({
      type: "payment",
      message: "Payment confirmed — your order is now in progress.",
      link: `/orders/${orderId}`,
      emailSubject: "Payment confirmed — work has started",
      emailBody:
        "We received your payment and the helper can begin. You'll get another email as soon as work is delivered.",
      emailLinkLabel: "Open the order",
      audience: ["student", "helper", "admin"],
      inAppRoles: ["admin"],
    }))
  );
}

/**
 * Reads the receipt URL and the real Stripe fee (converted to CAD) from a
 * payment intent's latest charge + balance transaction. Best-effort: any lookup
 * failure yields nulls so the caller still records the payment.
 */
async function fetchStripeFee(intentId: string): Promise<{
  receiptUrl: string | null;
  stripeFeeCad: number | null;
  balanceTransactionId: string | null;
}> {
  let receiptUrl: string | null = null;
  let stripeFeeCad: number | null = null;
  let balanceTransactionId: string | null = null;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(intentId, {
      expand: ["latest_charge.balance_transaction"],
    });
    const charge = paymentIntent.latest_charge;
    if (charge && typeof charge !== "string") {
      receiptUrl = charge.receipt_url ?? null;
      const bt = charge.balance_transaction;
      if (bt && typeof bt !== "string") {
        balanceTransactionId = bt.id;
        const fee = round2(bt.fee / 100);
        const feeCurrency = normalizeCurrency(bt.currency);
        if (feeCurrency === "CAD") {
          stripeFeeCad = fee;
        } else {
          const rate = await rateBetween(feeCurrency, "CAD");
          stripeFeeCad = rate === null ? null : round2(fee * rate);
        }
      }
    }
  } catch (err) {
    console.error("webhook: failed to fetch charge/balance transaction", err);
  }

  return { receiptUrl, stripeFeeCad, balanceTransactionId };
}

/**
 * Fills in the Stripe fee / net / receipt on an already-recorded payment when
 * they are still missing — e.g. the balance transaction had not settled when
 * the checkout webhook first ran, or the row was inserted by an earlier event.
 */
async function backfillPaymentFee(intentId: string): Promise<void> {
  const { data: payment } = await adminClient
    .from("payments")
    .select("gross_cad, stripe_fee_cad")
    .eq("stripe_payment_intent_id", intentId)
    .maybeSingle();
  if (!payment) return;
  if (payment.stripe_fee_cad !== null && payment.stripe_fee_cad !== undefined) return;

  const info = await fetchStripeFee(intentId);
  const updates: Record<string, unknown> = {};
  if (info.receiptUrl) updates.receipt_url = info.receiptUrl;
  if (info.balanceTransactionId) updates.stripe_balance_transaction_id = info.balanceTransactionId;
  if (info.stripeFeeCad !== null) {
    updates.stripe_fee_cad = info.stripeFeeCad;
    const gross = Number(payment.gross_cad ?? 0);
    if (gross > 0) updates.net_cad = round2(gross - info.stripeFeeCad);
  }
  if (Object.keys(updates).length === 0) return;

  const { error } = await adminClient
    .from("payments")
    .update(updates)
    .eq("stripe_payment_intent_id", intentId)
    .is("stripe_fee_cad", null);
  if (error) {
    console.error("webhook: fee backfill failed", error);
    return;
  }
  revalidatePath("/admin/payments");
}

async function handlePaymentIntentSucceeded(intent: Stripe.PaymentIntent) {
  const intentId = typeof intent === "string" ? intent : intent?.id;
  if (!intentId) return;
  // A succeeded intent can arrive before or after checkout.session.completed;
  // backfill only fills the fee when it is still missing.
  await backfillPaymentFee(intentId);
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
  const intentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null);
  if (!intentId) return;
  await backfillPaymentFee(intentId);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const intentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null);
  if (!intentId) return;

  const { data: payment } = await adminClient
    .from("payments")
    .select("id, order_id, gross_cad, refunded_amount_cad, charge_to_cad_rate")
    .eq("stripe_payment_intent_id", intentId)
    .maybeSingle();
  if (!payment) return;

  const gross = Number(payment.gross_cad ?? 0);
  const rate = Number(payment.charge_to_cad_rate ?? 1) || 1;
  const refundedPresentment = round2(Number(charge.amount_refunded ?? 0) / 100);
  const refundedTotal = round2(refundedPresentment * rate);
  const previousRefunded = round2(Number(payment.refunded_amount_cad ?? 0));

  if (refundedTotal <= previousRefunded) return; // nothing new to reduce

  const fullyRefunded = gross > 0 && refundedTotal >= gross;

  const { error } = await adminClient
    .from("payments")
    .update({
      refunded_amount_cad: refundedTotal,
      ...(fullyRefunded ? { status: "refunded" } : {}),
    })
    .eq("id", payment.id);

  if (error) {
    console.error("webhook: refund update failed", error);
    throw error;
  }

  if (payment.order_id) {
    after(() =>
      notifyOrderActivity(payment.order_id!, () => ({
        type: "payment",
        message: fullyRefunded
          ? "This order has been refunded."
          : "A partial refund was issued on this order.",
        link: `/orders/${payment.order_id}`,
        emailSubject: fullyRefunded ? "Order refunded" : "A refund was issued",
        emailBody: fullyRefunded
          ? "Your order has been fully refunded. Depending on your bank, the amount may take a few days to appear."
          : "A refund was issued for part of your order. The remaining balance stays with the order.",
        emailLinkLabel: "View the order",
        audience: ["student", "helper", "admin"],
        inAppRoles: ["student", "helper", "admin"],
      }))
    );
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const intentId =
    typeof dispute.payment_intent === "string"
      ? dispute.payment_intent
      : (dispute.payment_intent?.id ?? null);
  if (!intentId) return;

  const { data: payment } = await adminClient
    .from("payments")
    .select("id, order_id")
    .eq("stripe_payment_intent_id", intentId)
    .maybeSingle();
  if (!payment) return;

  // Hold the payout and flag the order for the admin.
  const { error } = await adminClient
    .from("payments")
    .update({ helper_payout_status: "on_hold", disputed: true })
    .eq("id", payment.id);

  if (error) {
    console.error("webhook: dispute update failed", error);
    throw error;
  }

  if (payment.order_id) {
    await adminClient
      .from("orders")
      .update({ status: "disputed" })
      .eq("id", payment.order_id);

    after(() =>
      notifyOrderActivity(payment.order_id!, () => ({
        type: "warning",
        message: "A payment dispute was opened on this order.",
        link: `/orders/${payment.order_id}`,
        emailSubject: "A payment dispute was opened",
        emailBody:
          "A payment dispute was opened for this order. The helper payout is on hold while it is reviewed. No action is needed unless our support team reaches out.",
        emailLinkLabel: "View the order",
        audience: ["student", "helper", "admin"],
        inAppRoles: ["student", "helper", "admin"],
      }))
    );
  }
}
