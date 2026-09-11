import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderWorkspace from "@/components/orders/order-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Workspace | PeerCraft",
};

export default async function HelperOrderPage({
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
    .select("id, student_id, helper_id")
    .eq("id", id)
    .maybeSingle();

  if (!order || order.helper_id !== user.id) {
    redirect("/helper/orders");
  }

  return <OrderWorkspace orderId={id} />;
}