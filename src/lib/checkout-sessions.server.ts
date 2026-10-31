import "server-only";
import { stripe } from "@/lib/stripe";
import { adminClient } from "@/lib/supabase/admin";

export async function listOrderCheckoutSessionIds(
  orderId: string,
  orderCreatedAt: string,
): Promise<string[]> {
  const { data: trackedSessions, error: trackingError } = await adminClient
    .from("order_checkout_sessions")
    .select("session_id")
    .eq("order_id", orderId);

  const sessionIds = new Set((trackedSessions ?? []).map(({ session_id }) => session_id));
  if (trackingError) {
    console.warn("checkout cleanup: session tracking unavailable; searching Stripe", trackingError);
  }

  const createdAt = Math.floor(new Date(orderCreatedAt).getTime() / 1000);
  if (!Number.isFinite(createdAt)) {
    throw new Error("Unable to safely identify checkout sessions for this order.");
  }

  const recentCheckoutWindow = Math.floor(Date.now() / 1000) - 48 * 60 * 60;
  if (sessionIds.size === 0 && createdAt < recentCheckoutWindow) {
    throw new Error("Checkout tracking is unavailable for this older order.");
  }
  const sessionCreatedAfter = Math.max(createdAt, recentCheckoutWindow);
  let startingAfter: string | undefined;

  try {
    let hasMore = true;
    while (hasMore) {
      const batch = await stripe.checkout.sessions.list({
        created: { gte: sessionCreatedAfter },
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      for (const session of batch.data) {
        if (session.metadata?.order_id === orderId) {
          sessionIds.add(session.id);
        }
      }
      hasMore = batch.has_more;
      startingAfter = batch.data.at(-1)?.id;
      if (hasMore && !startingAfter) {
        throw new Error("Stripe returned an incomplete checkout session page.");
      }
    }
  } catch (error) {
    console.error("checkout cleanup: Stripe session search failed", error);
    throw new Error("Unable to safely identify this order's checkout sessions.");
  }

  return [...sessionIds];
}

export async function expireUnpaidCheckoutSessions(sessionIds: string[]): Promise<boolean> {
  for (const sessionId of sessionIds) {
    let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.status === "complete" || session.payment_status !== "unpaid") {
        return false;
      }
      if (session.status === "open") {
        await stripe.checkout.sessions.expire(sessionId);
      }
    } catch (error) {
      console.error("checkout cleanup: unable to verify or expire a checkout session", {
        sessionId,
        error,
      });
      throw new Error("Unable to safely cancel this order's checkout sessions.");
    }
  }

  return true;
}
