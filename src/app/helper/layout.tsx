import Header from "@/components/layout/header";
import HelperNav from "@/components/layout/helper-nav";
import RoleBottomNav from "@/components/layout/role-bottom-nav";
import WarningsBannerClient from "@/components/layout/warnings-banner-client";
import { VoiceCallProvider } from "@/components/call/voice-call";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HelperLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let completedOrders = 0;
  let activeOrders = 0;
  if (user) {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("status")
      .eq("helper_id", user.id);
    for (const order of orderRows ?? []) {
      if (order.status === "completed") completedOrders += 1;
      else activeOrders += 1;
    }
  }

  return (
    <VoiceCallProvider role="helper">
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <WarningsBannerClient />
        <div className="flex flex-1">
          <HelperNav completedOrders={completedOrders} activeOrders={activeOrders} />
          <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8 overflow-auto">{children}</main>
        </div>

        <RoleBottomNav
          roleLabel="Helper"
          primary={[
            { href: "/helper/dashboard", label: "Dashboard", icon: "dashboard" },
            { href: "/helper/requests", label: "Requests", icon: "inbox" },
            { href: "/helper/messages", label: "Messages", icon: "messages" },
          ]}
          more={[
            { href: "/helper/orders", label: "Orders", icon: "orders" },
            { href: "/helper/earnings", label: "Earnings", icon: "earnings" },
            { href: "/helper/chat-admin", label: "Chat With Admin", icon: "chat_admin" },
            { href: "/helper/profile", label: "Edit Profile", icon: "profile" },
          ]}
        />
      </div>
    </VoiceCallProvider>
  );
}