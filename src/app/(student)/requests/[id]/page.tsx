import type { Metadata } from "next";
import { redirect } from "next/navigation";
import RequestWorkspace from "@/components/requests/request-workspace";
import OrderWorkspace from "@/components/orders/order-workspace";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request Workspace | Acadivo",
};

export default async function StudentRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ resend?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

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

  // Once a proposal is accepted the request becomes an order. Show the order
  // workspace for that stage so a single request always opens one page.
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id")
    .eq("request_id", id);

  const proposalIds = (proposals ?? []).map((p) => p.id);

  const { data: orders } = proposalIds.length
    ? await supabase.from("orders").select("id").in("proposal_id", proposalIds).limit(1)
    : { data: null };

  const orderId = (orders?.[0] as { id: string } | undefined)?.id ?? null;

  if (orderId) {
    return <OrderWorkspace orderId={orderId} />;
  }

  return <RequestWorkspace requestId={id} mode="student" initialResend={sp.resend === "1"} />;
}
