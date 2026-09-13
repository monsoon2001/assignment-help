import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HelperAdminChat from "@/components/chat/helper-admin-chat";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chat with Admin | PeerCraft",
};

export default async function HelperChatAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: adminData } = await supabase
    .from("users")
    .select("id, name, avatar_url")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();
  const admin = Array.isArray(adminData) ? adminData[0] : adminData;

  if (!admin) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 text-on-surface-variant">
        The support desk is not set up yet. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <HelperAdminChat
        admin={{ id: admin.id, name: admin.name ?? "Support", avatarUrl: admin.avatar_url }}
      />
    </div>
  );
}