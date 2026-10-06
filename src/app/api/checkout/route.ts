import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { unwrapRow } from "@/lib/embedded";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizeCurrency, isSupportedCurrency, convertCurrency, type CurrencyCode } from "@/lib/currency";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let orderId: unknown;
  let currency: unknown;
  try {
    const body = await request.json();
    orderId = body?.orderId;
    currency = body?.currency;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof orderId !== "string" || orderId.length === 0) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }
  const payCurrency: CurrencyCode = isSupportedCurrency(currency) ? currency : "USD";

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
    currency: string;
    status: string;
    proposal_id: string | null;
    student_id: string;
    helper_id: string | null;
  };
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, price, currency, status, proposal_id, student_id, helper_id")
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
    return NextResponse.json(
      { error: "This order is not awaiting payment." },
      { status: 409 }
    );
  }

  if (!order.proposal_id || !order.helper_id) {
    return NextResponse.json(
      { error: "This order is missing proposal or helper details." },
      { status: 409 }
    );
  }

  // The accepted proposal is the single authority for amount and currency.
  let proposal: {
    id: string;
    price: number;
    currency: string;
    status: string;
    request_id: string;
    helper_id: string;
    description: string | null;
    request: { title: string }[] | { title: string } | null;
  } | null;
  try {
    const { data, error } = await adminClient
      .from("proposals")
      .select("id, price, currency, status, request_id, helper_id, description, request:requests(title)")
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
      { status: 409 }
    );
  }

  const origin = new URL(request.url).origin;
  const requestTitle = unwrapRow<{ title: string }>(proposal.request)?.title ?? null;
  const title = requestTitle || "Acadivo Order";

  const orderCurrency = normalizeCurrency(proposal.currency);
  const amountInPayCurrency = convertCurrency(
    Number(proposal.price),
    orderCurrency,
    payCurrency
  );
  const priceCents = Math.round(amountInPayCurrency * 100);

  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    console.error("checkout: non-positive amount computed", { proposalId: proposal.id, price: proposal.price });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      client_reference_id: order.id,
      line_items: [
        {
          price_data: {
            currency: payCurrency.toLowerCase(),
            product_data: {
              name: title,
              description: proposal.description ?? "Acadivo academic order",
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
  } catch (err) {
    console.error("checkout: stripe session creation failed", err);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 }
    );
  }
}