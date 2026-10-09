import Link from "next/link";
import { Home, Plus } from "lucide-react";
import Header from "@/components/layout/header";
import StudentNav from "@/components/layout/student-nav";
import RoleBottomNav from "@/components/layout/role-bottom-nav";
import WarningsBanner from "@/components/layout/warnings-banner";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let requestCount = 0;
  let notifCount = 0;
  if (user) {
    const [{ count: reqCount }, { count: notif }] = await Promise.all([
      supabase
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("student_id", user.id)
        .in("status", ["requested", "proposal_sent", "accepted"]),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false),
    ]);
    requestCount = reqCount ?? 0;
    notifCount = notif ?? 0;
  }

  const navItems: { key: "dashboard" | "requests" | "messages" | "notifications" | "profile"; href: string; label: string; badge?: string }[] = [
    { key: "dashboard", href: "/dashboard", label: "Dashboard" },
    { key: "requests", href: "/requests", label: "My Requests", badge: requestCount > 0 ? String(requestCount) : undefined },
    { key: "messages", href: "/messages", label: "Messages" },
    { key: "notifications", href: "/notifications", label: "Notifications", badge: notifCount > 0 ? String(notifCount) : undefined },
    { key: "profile", href: "/profile", label: "Profile" },
  ];
  return (
    <div className="min-h-dvh flex flex-col bg-background lg:h-dvh lg:overflow-hidden">
      <Header />
      <WarningsBanner />

      <div className="flex flex-1 w-full max-w-360 mx-auto lg:min-h-0">
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-outline-variant px-4 py-6 gap-1 sticky top-16 md:h-[calc(100vh-4rem)] lg:h-full bg-surface-container-lowest">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
            Student
          </p>
          <StudentNav items={navItems} />

          <div className="mt-auto pt-4 flex flex-col gap-2">
            <Button href="/requests/new" className="w-full" size="sm">
              <Plus size={16} />
              Request Help
            </Button>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors min-h-11"
            >
              <Home size={16} />
              Back to homepage
            </Link>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 pb-24 md:pb-10 lg:min-h-0 lg:overflow-y-auto">
          {children}
        </main>
      </div>

      <RoleBottomNav
        roleLabel="Student"
        primary={[
          { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
          { href: "/requests", label: "Requests", icon: "requests", badge: requestCount > 0 ? requestCount : undefined },
          { href: "/messages", label: "Messages", icon: "messages" },
        ]}
        more={[
          { href: "/notifications", label: "Notifications", icon: "notifications", badge: notifCount > 0 ? notifCount : undefined },
          { href: "/profile", label: "Profile", icon: "profile" },
          { href: "/requests/new", label: "Request Help", icon: "new_request" },
          { href: "/", label: "Home", icon: "home" },
        ]}
      />

      <footer className="py-5 text-center text-xs text-on-surface-variant border-t border-outline-variant bg-surface-container-lowest pb-24 md:pb-5">
        © {new Date().getFullYear()} Acadivo Academic Network. Students worldwide — connect with your academic
        integrity office for questions.
      </footer>
    </div>
  );
}