import { NextResponse } from "next/server";
import {
  expireUnpaidCheckoutSessions,
  listOrderCheckoutSessionIds,
} from "@/lib/checkout-sessions.server";
import { getRequestFilePaths, removeRequestFiles } from "@/lib/request-deletion.server";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { request_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.request_id !== "string" || body.request_id.length === 0) {
    return NextResponse.json({ error: "Missing request id." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to delete a request." },
      { status: 401 },
    );
  }

  const { data: requestRow, error: requestError } = await adminClient
    .from("requests")
    .select("id, student_id")
    .eq("id", body.request_id)
    .maybeSingle();
  if (requestError) {
    console.error("request delete: request lookup failed", requestError);
    return NextResponse.json(
      { error: "Unable to delete this request right now." },
      { status: 500 },
    );
  }
  if (!requestRow || requestRow.student_id !== user.id) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  const { data: proposals, error: proposalsError } = await adminClient
    .from("proposals")
    .select("id")
    .eq("request_id", requestRow.id);
  if (proposalsError) {
    console.error("request delete: proposal lookup failed", proposalsError);
    return NextResponse.json({ error: "Unable to verify this request's orders." }, { status: 500 });
  }

  const proposalIds = (proposals ?? []).map(({ id }) => id);
  const ordersResult = proposalIds.length
    ? await adminClient
        .from("orders")
        .select("id, proposal_id, status, created_at")
        .in("proposal_id", proposalIds)
    : { data: [], error: null };
  if (ordersResult.error) {
    console.error("request delete: order lookup failed", ordersResult.error);
    return NextResponse.json({ error: "Unable to verify this request's orders." }, { status: 500 });
  }

  const orders = ordersResult.data ?? [];
  if (orders.some(({ status }) => status !== "payment_pending")) {
    return NextResponse.json(
      { error: "This request can no longer be deleted because its order is active or complete." },
      { status: 409 },
    );
  }

  try {
    const filePaths = await getRequestFilePaths(requestRow.id);

    for (const order of orders) {
      const { data: payments, error: paymentError } = await adminClient
        .from("payments")
        .select("id")
        .eq("order_id", order.id)
        .in("status", ["pending", "paid"])
        .limit(1);
      if (paymentError) {
        console.error("request delete: payment lookup failed", paymentError);
        return NextResponse.json({ error: "Unable to verify payment status." }, { status: 500 });
      }
      if (payments?.length) {
        return NextResponse.json(
          { error: "This request cannot be deleted while a payment is processing or complete." },
          { status: 409 },
        );
      }

      const sessionIds = await listOrderCheckoutSessionIds(order.id, order.created_at);
      if (!(await expireUnpaidCheckoutSessions(sessionIds))) {
        return NextResponse.json(
          { error: "Payment is processing. Refresh the page before deleting this request." },
          { status: 409 },
        );
      }
    }

    const { data: deleted, error: deleteError } = await adminClient.rpc(
      "delete_request_if_unpaid",
      {
        p_request_id: requestRow.id,
        p_student_id: user.id,
        p_require_expired: false,
      },
    );
    if (deleteError) {
      console.error("request delete: guarded database deletion failed", deleteError);
      return NextResponse.json(
        {
          error:
            "This request could not be deleted. Apply the latest database migration and try again.",
        },
        { status: 500 },
      );
    }
    if (!deleted) {
      return NextResponse.json(
        {
          error:
            "This request can no longer be deleted because its payment or order status changed.",
        },
        { status: 409 },
      );
    }

    try {
      await removeRequestFiles(filePaths);
    } catch (error) {
      console.error("request delete: request removed but storage cleanup failed", error);
      return NextResponse.json({
        ok: true,
        warning:
          "The request was deleted, but some attached files could not be removed. Please contact support.",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("request delete: safe deletion failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to safely delete this request." },
      { status: 503 },
    );
  }
}
