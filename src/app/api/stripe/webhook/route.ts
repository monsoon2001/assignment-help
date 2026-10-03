import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const intentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    const orderId = session.metadata?.order_id;
    if (!orderId) {
      console.error("webhook: checkout.session.completed missing order_id metadata");
      return NextResponse.json({ received: true });
    }

    // Cross-check the checkout session really belongs to this order.
    if (session.client_reference_id && session.client_reference_id !== orderId) {
      console.error("webhook: client_reference_id mismatch", {
        orderId,
        clientReferenceId: session.client_reference_id,
      });
      return NextResponse.json(
        { error: "Session does not match order" },
        { status: 400 }
      );
    }

    let receiptUrl: string | null = null;
    if (intentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(intentId, {
          expand: ["latest_charge"],
        });
        const charge = paymentIntent.latest_charge;
        receiptUrl =
          typeof charge === "string" ? null : (charge?.receipt_url ?? null);
      } catch (err) {
        // Receipt URL is best-effort; the payment record proceeds without it.
        console.error("webhook: failed to fetch receipt url", err);
      }
    }

    try {
      // The webhook is the ONLY writer that transitions an order to
      // in_progress. The status filter makes double delivery harmless and
      // prevents regressing a later status (e.g. a refund/cancel).
      const { error: orderError } = await adminClient
        .from("orders")
        .update({ status: "in_progress" })
        .eq("id", orderId)
        .eq("status", "payment_pending");

      if (orderError) {
        console.error("webhook: order update failed", orderError);
        return NextResponse.json({ error: orderError.message }, { status: 500 });
      }

      // Idempotent (guard: reversing an insert/upsert of an existing intent)
      // thanks to the partial unique index on stripe_payment_intent_id.
      const { data: exists } = await adminClient
        .from("payments")
        .select("id")
        .eq("stripe_payment_intent_id", intentId)
        .maybeSingle();

      if (!exists && intentId) {
        const { error: paymentError } = await adminClient.from("payments").upsert(
          {
            order_id: orderId,
            amount: Number(session.amount_total) / 100,
            currency:
              typeof session.currency === "string"
                ? session.currency.toUpperCase()
                : "USD",
            stripe_payment_intent_id: intentId,
            receipt_url: receiptUrl,
            customer_email:
              typeof session.customer_email === "string"
                ? session.customer_email
                : null,
            status: "paid",
          },
          { onConflict: "stripe_payment_intent_id", ignoreDuplicates: true }
        );

        if (paymentError) {
          console.error("webhook: payment insert failed", paymentError);
          return NextResponse.json(
            { error: paymentError.message },
            { status: 500 }
          );
        }
      }

      // Keep the cached workspace/confirmed pages fresh once the payment lands.
      revalidatePath(`/orders/${orderId}`, "page");
      revalidatePath(`/orders/${orderId}/confirmed`, "page");
    } catch (err) {
      console.error("webhook: unexpected failure while finalizing", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}