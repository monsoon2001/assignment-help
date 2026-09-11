import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotificationsView, { type AppNotification } from "@/components/notifications/notifications-view";
import { ErrorState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications | PeerCraft",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, message, link, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <ErrorState title="Couldn't load notifications" message={error.message} />
      </div>
    );
  }

  return <NotificationsView initial={(data ?? []) as AppNotification[]} />;
}