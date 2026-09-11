import Link from "next/link";
import { LayoutDashboard, FileText, MessageSquare, Bell, User, Plus, GraduationCap } from "lucide-react";
import Header from "@/components/layout/header";
import Badge from "@/components/ui/badge";
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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/requests", label: "My Requests", icon: FileText, badge: requestCount > 0 ? String(requestCount) : undefined },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: notifCount > 0 ? String(notifCount) : undefined },
    { href: "/profile", label: "Profile", icon: User },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-outline-variant px-4 py-6 gap-1 sticky top-16 h-[calc(100vh-4rem)] bg-surface-container-lowest">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
            Student
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && <Badge variant="primary" className="px-2 py-0.5">{item.badge}</Badge>}
              </Link>
            );
          })}

          <div className="mt-auto pt-4">
            <Link
              href="/requests/new"
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors"
            >
              <Plus size={16} />
              Request Help
            </Link>
            <p className="mt-3 px-3 text-[11px] leading-relaxed text-on-surface-variant flex items-start gap-1.5">
              <GraduationCap size={12} className="shrink-0 mt-px" />
              Academic Honor Pass active through {new Date().getFullYear() + 1}
            </p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-8 py-6">
          {children}
        </main>
      </div>

      <footer className="py-5 text-center text-xs text-on-surface-variant border-t border-outline-variant bg-surface-container-lowest">
        © {new Date().getFullYear()} PeerCraft Academic Network for Eastview University. Connect with your academic
        integrity office for questions.
      </footer>
    </div>
  );
}