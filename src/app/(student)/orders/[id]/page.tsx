import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentOrderPage({
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
    .select("id, student_id, status, payments(status), proposal:proposals(request_id)")
    .eq("id", id)
    .maybeSingle();

  if (!order || order.student_id !== user.id) {
    redirect("/requests");
  }

  const proposal = Array.isArray(order.proposal) ? (order.proposal[0] ?? null) : order.proposal;
  const requestId = (proposal as { request_id: string | null } | null)?.request_id;
  const payments = Array.isArray(order.payments) ? order.payments : [order.payments];
  const paid = (payments as ({ status: string } | null)[]).some(
    (payment) => payment?.status === "paid",
  );

  // Delivery is server-gated: an unpaid order is still in the request/proposal
  // stage, so strip the delivery tab and send the student back there.
  const suffix = paid && query.tab === "delivery" ? "?tab=delivery" : "";
  redirect(requestId ? `/requests/${requestId}${suffix}` : "/requests");
}
