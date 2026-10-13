import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminClient } from "@/lib/supabase/admin";
import { computeHelperShare, getHelperShareConfig } from "@/lib/payment-ledger.server";

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

  // Pull the real Stripe fee + net from the charge's balance transaction, and
  // the receipt URL from the charge.
  let receiptUrl: string | null = null;
  let stripeFeeCad: number | null = null;
  let balanceTransactionId: string | null = null;

  if (intentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(intentId, {
        expand: ["latest_charge.balance_transaction"],
      });
      const charge = paymentIntent.latest_charge;
      if (charge && typeof charge !== "string") {
        receiptUrl = charge.receipt_url ?? null;
        const bt = charge.balance_transaction;
        if (bt && typeof bt !== "string") {
          stripeFeeCad = round2(bt.fee / 100);
          balanceTransactionId = bt.id;
        }
      }
    } catch (err) {
      // Best-effort: the payment still records without the exact fee.
      console.error("webhook: failed to fetch charge/balance transaction", err);
    }
  }

  const grossCad = round2(Number(session.amount_total ?? 0) / 100);

  // Determine the helper for share computation.
  const { data: orderRow } = await adminClient
    .from("orders")
    .select("helper_id")
    .eq("id", orderId)
    .maybeSingle();

  let helperShareCad: number | null = null;
  let netCad: number | null = round2(grossCad - (stripeFeeCad ?? 0));
  if (orderRow?.helper_id) {
    const config = await getHelperShareConfig(orderRow.helper_id);
    const computed = computeHelperShare(grossCad, stripeFeeCad, config);
    helperShareCad = computed.helperShareCad;
    netCad = computed.netCad;
  }

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
      helper_share_cad: helperShareCad,
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
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const intentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : (charge.payment_intent?.id ?? null);
  if (!intentId) return;

  const { data: payment } = await adminClient
    .from("payments")
    .select(
      "id, order_id, gross_cad, net_cad, helper_share_cad, refunded_amount_cad, helper_payout_status"
    )
    .eq("stripe_payment_intent_id", intentId)
    .maybeSingle();
  if (!payment) return;

  const gross = Number(payment.gross_cad ?? 0);
  const refundedTotal = round2(Number(charge.amount_refunded ?? 0) / 100);
  const previousRefunded = round2(Number(payment.refunded_amount_cad ?? 0));
  const delta = round2(refundedTotal - previousRefunded);

  if (delta <= 0) return; // nothing new to reduce

  const fullyRefunded = gross > 0 && refundedTotal >= gross;

  // Reduce the helper's owed amount proportionally to the newly refunded slice.
  let newShare = Number(payment.helper_share_cad ?? 0);
  if (gross > 0) {
    const remainingBefore = Math.max(gross - previousRefunded, 0);
    const reduction =
      remainingBefore > 0 ? newShare * (delta / remainingBefore) : newShare;
    newShare = Math.max(0, round2(newShare - reduction));
  }
  if (fullyRefunded) newShare = 0;

  const { error } = await adminClient
    .from("payments")
    .update({
      refunded_amount_cad: refundedTotal,
      helper_share_cad: newShare,
      ...(fullyRefunded ? { status: "refunded" } : {}),
    })
    .eq("id", payment.id);

  if (error) {
    console.error("webhook: refund update failed", error);
    throw error;
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

  // Hold the helper's payout and flag the order for the admin.
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
  }
}
