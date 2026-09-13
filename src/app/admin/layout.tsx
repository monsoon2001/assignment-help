"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import { VoiceCallProvider } from "@/components/call/voice-call";
import RoleBottomNav from "@/components/layout/role-bottom-nav";
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
    <VoiceCallProvider role="admin">
    <div className="min-h-screen flex flex-col bg-background">
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-2.5 bg-surface-container-lowest/95 backdrop-blur border-b border-outline-variant">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-lg">school</span>
          </span>
          <span className="font-display font-bold text-lg text-on-surface">PeerCraft</span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-container text-on-primary rounded-md">
            Admin
          </span>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => setSignOutOpen(true)} aria-label="Sign out">
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
      <div className="flex flex-1 min-h-0">
      <aside className="hidden lg:flex w-64 shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 min-h-screen p-4 flex-col sticky top-0 h-screen overflow-y-auto">
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

      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 overflow-auto min-h-screen">{children}</main>
      </div>

      <RoleBottomNav
        roleLabel="Admin"
        primary={[
          { href: "/admin/dashboard", label: "Dashboard", icon: links[0].icon },
          { href: "/admin/requests", label: "Requests", icon: links[3].icon },
          { href: "/admin/messages", label: "Messages", icon: links[6].icon },
        ]}
        more={links
          .filter((l) => !["/admin/dashboard", "/admin/requests", "/admin/messages"].includes(l.href))
          .map((l) => ({ href: l.href, label: l.label, icon: l.icon }))}
      />

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
    </VoiceCallProvider>
  );
}
