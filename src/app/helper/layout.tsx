import type { Metadata } from "next";
import Header from "@/components/layout/header";
import HelperNav from "@/components/layout/helper-nav";
import RoleBottomNav from "@/components/layout/role-bottom-nav";
import WarningsBannerClient from "@/components/layout/warnings-banner-client";
import { VoiceCallProvider } from "@/components/call/voice-call";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function HelperLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let completedOrders = 0;
  let activeOrders = 0;
  let incomingRequests = 0;
  let unreadMessages = 0;
  if (user) {
    const [completedResult, activeResult, requestResult, messageResult] = await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("helper_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("helper_id", user.id)
        .neq("status", "completed"),
      supabase
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("helper_id", user.id)
        .eq("status", "requested"),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("type", "message")
        .eq("read", false),
    ]);

    if (completedResult.error)
      throw new Error(`Could not load completed order count: ${completedResult.error.message}`);
    if (activeResult.error)
      throw new Error(`Could not load active order count: ${activeResult.error.message}`);
    if (requestResult.error)
      throw new Error(`Could not load incoming request count: ${requestResult.error.message}`);
    if (messageResult.error)
      throw new Error(`Could not load unread message count: ${messageResult.error.message}`);

    completedOrders = completedResult.count ?? 0;
    activeOrders = activeResult.count ?? 0;
    incomingRequests = requestResult.count ?? 0;
    unreadMessages = messageResult.count ?? 0;
  }

  return (
    <VoiceCallProvider role="helper">
      <div className="min-h-dvh flex flex-col bg-background lg:h-dvh lg:overflow-hidden">
        <Header />
        <WarningsBannerClient />
        <div className="flex flex-1 w-full max-w-360 mx-auto lg:min-h-0">
          <HelperNav
            completedOrders={completedOrders}
            activeOrders={activeOrders}
            incomingRequests={incomingRequests}
            unreadMessages={unreadMessages}
          />
          <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:p-8 pb-24 md:pb-10 lg:pb-0 lg:min-h-0 lg:overflow-y-auto">
            {children}
          </main>
        </div>

        <RoleBottomNav
          roleLabel="Helper"
          primary={[
            { href: "/helper/dashboard", label: "Dashboard", icon: "dashboard" },
            {
              href: "/helper/requests",
              label: "Requests",
              icon: "inbox",
              badge: incomingRequests || undefined,
            },
            {
              href: "/helper/messages",
              label: "Messages",
              icon: "messages",
              badge: unreadMessages || undefined,
            },
          ]}
          more={[
            {
              href: "/helper/orders",
              label: "Orders",
              icon: "orders",
              badge: activeOrders || undefined,
            },
            { href: "/helper/earnings", label: "Earnings", icon: "earnings" },
            { href: "/helper/notifications", label: "Notifications", icon: "notifications" },
            { href: "/helper/chat-admin", label: "Chat With Admin", icon: "chat_admin" },
            { href: "/helper/profile", label: "Edit Profile", icon: "profile" },
          ]}
        />
      </div>
    </VoiceCallProvider>
  );
}
