"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Briefcase,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Settings,
  Shield,
  UserRound,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/helpers", label: "Helpers", icon: UserCheck },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/orders", label: "Orders", icon: Briefcase },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/chat-monitor", label: "Chat Monitor", icon: ShieldAlert },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/profile", label: "Profile", icon: UserRound },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [identity, setIdentity] = useState<{ name: string; email: string } | null>(null);
  const [signOutOpen, setSignOutOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSignOutOpen(false);
    router.push("/sign-in");
    router.refresh();
  }

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      const fallbackName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Admin";
      setIdentity({ name: fallbackName, email: user.email ?? "" });
      const { data } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", user.id)
        .single();
      if (data && active) setIdentity({ name: data.name ?? fallbackName, email: data.email ?? user.email ?? "" });
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 min-h-screen p-4 flex flex-col">
        <div className="flex items-center gap-2 px-3 py-3 mb-4">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-lg">
              school
            </span>
          </div>
          <span className="font-display font-bold text-xl text-on-surface">
            PeerCraft
          </span>
          <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-primary-container text-on-primary rounded-md">
            Admin
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center">
              <Shield size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">{identity?.name ?? "Loading…"}</p>
              <p className="text-xs text-on-surface-variant truncate">{identity?.email ?? "—"}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setSignOutOpen(true)}
            aria-label="Sign out"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-auto min-h-screen">{children}</main>

      {signOutOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 animate-[dialog-in_0.2s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-sign-out-title"
            onClick={() => setSignOutOpen(false)}
          >
            <div
              className="w-full max-w-sm bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl p-6 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <span className="w-11 h-11 rounded-xl bg-error-container/40 text-error flex items-center justify-center shrink-0">
                  <LogOut size={20} />
                </span>
                <div>
                  <h3 id="admin-sign-out-title" className="font-display font-bold text-lg text-on-surface">
                    Confirm Sign Out
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    You&apos;ll need to sign in again to access the admin dashboard.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setSignOutOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="md" className="flex-1" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
