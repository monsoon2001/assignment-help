import type { Metadata } from "next";
import { requireAdmin, adminClient } from "@/lib/admin";
import AdminMessages from "@/app/admin/components/admin-messages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages | PeerCraft Admin",
};

export default async function AdminMessagesPage() {
  await requireAdmin();

  const { data: helpers } = await adminClient
    .from("users")
    .select("id, name, email, status, avatar_url")
    .eq("role", "helper")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">Support Messages</h1>
        <p className="text-on-surface-variant mt-1">Direct realtime chat with helpers.</p>
      </div>

      <AdminMessages helpers={(helpers ?? []) as unknown as Parameters<typeof AdminMessages>[0]["helpers"]} />
    </div>
  );
}