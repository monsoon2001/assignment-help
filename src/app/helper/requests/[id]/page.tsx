import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RequestWorkspace from "@/components/requests/request-workspace";
import OrderWorkspace from "@/components/orders/order-workspace";
import { createClient } from "@/lib/supabase/server";
import { getChargeContext } from "@/lib/charge.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request Workspace | Acadivo",
};

export default async function HelperRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: request } = await supabase
    .from("requests")
    .select("id, helper_id, student_id")
    .eq("id", id)
    .maybeSingle();

  if (!request || request.helper_id !== user.id) {
    redirect("/helper/requests");
  }

  // Once a proposal is accepted the request becomes an order, but the order
  // workspace (and its delivery tab) only unlocks once the Stripe webhook has
  // recorded the payment. Before that the helper keeps the request/proposal
  // stage and can still discuss the price in chat.
  const { data: proposals } = await supabase.from("proposals").select("id").eq("request_id", id);

  const proposalIds = (proposals ?? []).map((p) => p.id);

  const { data: orders } = proposalIds.length
    ? await supabase
        .from("orders")
        .select("id, payments(status)")
        .in("proposal_id", proposalIds)
        .limit(1)
    : { data: null };

  const orderRow = (orders?.[0] ?? null) as {
    id: string;
    payments: { status: string }[] | { status: string } | null;
  } | null;
  const payments = Array.isArray(orderRow?.payments) ? orderRow?.payments : [orderRow?.payments];
  const paid = !!orderRow && (payments ?? []).some((payment) => payment?.status === "paid");

  if (orderRow && paid) {
    const initialTab =
      query.tab === "delivery" ? "delivery" : query.tab === "chat" ? "chat" : "overview";
    return (
      <OrderWorkspace
        key={`${orderRow.id}:${initialTab}`}
        orderId={orderRow.id}
        initialTab={initialTab}
      />
    );
  }

  const { data: student } = await supabase
    .from("users")
    .select("country")
    .eq("id", request.student_id)
    .maybeSingle();
  const chargeContext = await getChargeContext(student?.country ?? null);

  return (
    <RequestWorkspace
      requestId={id}
      mode="helper"
      localCurrency={chargeContext.localCurrency}
    />
  );
}
