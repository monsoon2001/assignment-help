import { NextResponse } from "next/server";
import {
  expireUnpaidCheckoutSessions,
  listOrderCheckoutSessionIds,
} from "@/lib/checkout-sessions.server";
import { getRequestFilePaths, removeRequestFiles } from "@/lib/request-deletion.server";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("unpaid request cleanup: CRON_SECRET is not configured");
    return NextResponse.json({ error: "Cleanup is not configured." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: orders, error: ordersError } = await adminClient
    .from("orders")
    .select("id, proposal_id, student_id, created_at")
    .eq("status", "payment_pending")
    .lte("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(100);
  if (ordersError) {
    console.error("unpaid request cleanup: order lookup failed", ordersError);
    return NextResponse.json({ error: "Unable to load expired orders." }, { status: 500 });
  }

  const proposalIds = [...new Set((orders ?? []).map(({ proposal_id }) => proposal_id))];
  if (proposalIds.length === 0) {
    return NextResponse.json({ deleted: 0, skipped: 0 });
  }

  const { data: proposals, error: proposalsError } = await adminClient
    .from("proposals")
    .select("id, request_id")
    .in("id", proposalIds)
    .eq("status", "accepted");
  if (proposalsError) {
    console.error("unpaid request cleanup: proposal lookup failed", proposalsError);
    return NextResponse.json({ error: "Unable to load expired proposals." }, { status: 500 });
  }

  const requestIdByProposal = new Map(
    (proposals ?? []).map(({ id, request_id }) => [id, request_id]),
  );
  let deletedCount = 0;
  let skippedCount = 0;
  let failures = 0;

  for (const order of orders ?? []) {
    const requestId = requestIdByProposal.get(order.proposal_id);
    if (!requestId) {
      skippedCount += 1;
      continue;
    }

    try {
      const { data: payments, error: paymentError } = await adminClient
        .from("payments")
        .select("id")
        .eq("order_id", order.id)
        .in("status", ["pending", "paid"])
        .limit(1);
      if (paymentError) {
        throw new Error("Unable to verify payment status.");
      }
      if (payments?.length) {
        skippedCount += 1;
        continue;
      }

      const sessionIds = await listOrderCheckoutSessionIds(order.id, order.created_at);
      if (!(await expireUnpaidCheckoutSessions(sessionIds))) {
        skippedCount += 1;
        continue;
      }

      const filePaths = await getRequestFilePaths(requestId);
      const { data: deleted, error: deleteError } = await adminClient.rpc(
        "delete_request_if_unpaid",
        {
          p_request_id: requestId,
          p_student_id: order.student_id,
          p_require_expired: true,
        },
      );
      if (deleteError) {
        throw new Error(`Guarded deletion failed: ${deleteError.message}`);
      }
      if (!deleted) {
        skippedCount += 1;
        continue;
      }

      try {
        await removeRequestFiles(filePaths);
      } catch (error) {
        console.error("unpaid request cleanup: request deleted but storage cleanup failed", {
          requestId,
          error,
        });
        failures += 1;
      }
      deletedCount += 1;
    } catch (error) {
      console.error("unpaid request cleanup: failed to process request", { requestId, error });
      failures += 1;
    }
  }

  return NextResponse.json(
    { deleted: deletedCount, skipped: skippedCount, failures },
    { status: failures ? 500 : 200 },
  );
}
