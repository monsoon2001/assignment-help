import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HelperOrderPage({
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

  const { data: order } = await supabase
    .from("orders")
    .select("id, helper_id, proposal:proposals(request_id)")
    .eq("id", id)
    .maybeSingle();

  if (!order || order.helper_id !== user.id) {
    redirect("/helper/orders");
  }

  const proposal = Array.isArray(order.proposal) ? (order.proposal[0] ?? null) : order.proposal;
  const requestId = (proposal as { request_id: string | null } | null)?.request_id;

  // Orders are now shown inside the single request workspace.
  const tab = query.tab === "chat" || query.tab === "delivery" ? query.tab : null;
  const suffix = tab ? `?tab=${tab}` : "";
  redirect(requestId ? `/helper/requests/${requestId}${suffix}` : "/helper/orders");
}
