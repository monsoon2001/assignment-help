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

export default async function StudentRequestDetailPage({
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
    .select("id, student_id")
    .eq("id", id)
    .maybeSingle();

  if (!request || request.student_id !== user.id) {
    redirect("/requests");
  }

  // Once a proposal is accepted the request becomes an order. Until the Stripe
  // webhook records a paid payment, keep the request workspace (details,
  // proposal, chat) and do not expose the order's delivery area.
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
    const initialTab = query.tab === "delivery" ? "delivery" : "overview";
    return (
      <OrderWorkspace
        key={`${orderRow.id}:${initialTab}`}
        orderId={orderRow.id}
        initialTab={initialTab}
      />
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("country")
    .eq("id", user.id)
    .maybeSingle();

  const chargeContext = await getChargeContext(profile?.country ?? null);

  return (
    <RequestWorkspace
      requestId={id}
      mode="student"
      localCurrency={chargeContext.localCurrency}
      rates={chargeContext.rates}
      surchargePercent={chargeContext.surchargePercent}
    />
  );
}
