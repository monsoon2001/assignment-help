import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, student_id, proposal:proposals(request_id)")
    .eq("id", id)
    .maybeSingle();

  if (!order || order.student_id !== user.id) {
    redirect("/requests");
  }

  const proposal = Array.isArray(order.proposal) ? (order.proposal[0] ?? null) : order.proposal;
  const requestId = (proposal as { request_id: string | null } | null)?.request_id;

  // Orders are now shown inside the single request workspace.
  redirect(requestId ? `/requests/${requestId}` : "/requests");
}
