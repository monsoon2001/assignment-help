import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { unwrapRow } from "@/lib/embedded";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { orderId } = await request.json().catch(() => ({}));
  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, price, status, deadline, proposal_id, student_id, helper_id")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.student_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "payment_pending") {
    return NextResponse.json(
      { error: "This order is not awaiting payment." },
      { status: 409 }
    );
  }

  const { data: proposal } = await adminClient
    .from("proposals")
    .select("id, description, request:requests(title)")
    .eq("id", order.proposal_id)
    .single();

  const origin = new URL(request.url).origin;
  const requestTitle = unwrapRow<{ title: string }>(proposal?.request)?.title ?? null;
  const title = requestTitle || "PeerCraft Order";

  const priceCents = Math.round(Number(order.price) * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: title,
            description: proposal?.description ?? "PeerCraft academic order",
          },
          unit_amount: priceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      order_id: order.id,
    },
    success_url: `${origin}/orders/${order.id}/confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/orders/${order.id}/payment`,
  });

  return NextResponse.json({ sessionId: session.id, url: session.url });
}