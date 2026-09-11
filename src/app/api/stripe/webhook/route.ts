import { NextResponse } from "next/server";
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

    const { data: existing } = await adminClient
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", intentId)
      .maybeSingle();

    if (orderId && !existing) {
      const { error: orderError } = await adminClient
        .from("orders")
        .update({ status: "in_progress" })
        .eq("id", orderId);

      if (orderError) {
        return NextResponse.json({ error: orderError.message }, { status: 500 });
      }

      const { error: paymentError } = await adminClient.from("payments").insert({
        order_id: orderId,
        amount: Number(session.amount_total) / 100,
        stripe_payment_intent_id: intentId,
        status: "paid",
      });

      if (paymentError) {
        return NextResponse.json({ error: paymentError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}