import Header from "@/components/layout/header";
import HelperNav from "@/components/layout/helper-nav";
import RoleBottomNav from "@/components/layout/role-bottom-nav";
import WarningsBannerClient from "@/components/layout/warnings-banner-client";
import { VoiceCallProvider } from "@/components/call/voice-call";
import { CurrencyDisplayProvider } from "@/components/currency/currency-display";
import { createClient } from "@/lib/supabase/server";
import { resolveDisplayCurrency } from "@/lib/display-currency.server";
import { getDisplayRates } from "@/lib/exchange-rates.server";

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

  let userCountry: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("country")
      .eq("id", user.id)
      .maybeSingle();
    userCountry = (profile as { country?: string | null } | null)?.country ?? null;
  }
  const [defaultCurrency, rates] = await Promise.all([
    resolveDisplayCurrency(userCountry),
    getDisplayRates(),
  ]);

  return (
    <CurrencyDisplayProvider defaultCurrency={defaultCurrency} rates={rates}>
    <VoiceCallProvider role="helper">
      <div className="min-h-dvh flex flex-col bg-background lg:h-dvh lg:overflow-hidden">
        <Header />
        <WarningsBannerClient />
        <div className="flex flex-1 w-full max-w-360 mx-auto lg:min-h-0">
          <HelperNav completedOrders={completedOrders} activeOrders={activeOrders} />
          <main className="flex-1 min-w-0 p-6 lg:p-8 pb-24 lg:pb-8 lg:min-h-0 lg:overflow-y-auto">
            {children}
          </main>
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
    </CurrencyDisplayProvider>
  );
}