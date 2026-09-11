"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Bell, MessageSquare, GraduationCap, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";
import type { UserRole } from "@/lib/auth";

interface MenuItem {
  label: string;
  href: string;
}

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  menuItems?: MenuItem[];
}

export default function Header({ title, showSearch = true, menuItems = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;

      if (session?.user.id) {
        setUserId(session.user.id);
        const { data: profile } = await supabase
          .from("users")
          .select("role, name, avatar_url")
          .eq("id", session.user.id)
          .single();
        if (!active) return;
        setRole((profile?.role as UserRole) ?? null);
        setUserName((profile?.name as string) ?? session.user.email ?? null);
        setAvatarUrl((profile?.avatar_url as string) ?? null);

        const { count } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .eq("read", false);
        if (!active) return;
        setUnreadCount(count ?? 0);

        if (!active) return;
        channel = supabase
          .channel(realtimeTopic("header-notifications"))
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` },
            () => {
              setUnreadCount((prev) => prev + 1);
            }
          )
          .subscribe();
      }
    }

    loadSession();
    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserId(null);
    setRole(null);
    setSignOutDialogOpen(false);
    router.push("/sign-in");
    router.refresh();
  }, [router]);

  const profileHref = role === "helper" ? "/helper/profile" : "/profile";
  const dashboardHref = role === "helper" ? "/helper/dashboard" : "/dashboard";
  const messagesHref = role === "helper" ? "/helper/messages" : "/messages";
  const notificationsHref = role === "helper" ? "/helper/notifications" : "/notifications";
  const firstName = userName
    ? userName.includes("@")
      ? userName.split("@")[0]
      : userName.trim().split(/\s+/)[0]
    : "User";

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur border-b border-outline-variant">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
            <GraduationCap size={20} />
          </span>
          <div className="leading-tight hidden sm:block">
            <p className="font-display font-bold text-on-surface text-lg">PeerCraft</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Academic Network</p>
          </div>
        </Link>

        {showSearch && (
          <div className="hidden md:flex items-center gap-1 text-sm rounded-lg bg-surface-container-low px-3 py-2 flex-1 max-w-md border border-transparent focus-within:border-primary-container">
            <Search size={16} className="text-on-surface-variant mr-2" />
            <input
              placeholder="Search helpers, requests, courses..."
              className="bg-transparent outline-none flex-1 text-on-surface placeholder:text-outline"
            />
          </div>
        )}

        {menuItems.length > 0 && (
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {title && (
            <span className="hidden lg:block text-sm font-medium text-on-surface-variant">{title}</span>
          )}
          {userId ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Button>
              </Link>
              <Link href={notificationsHref}>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell size={18} />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-container-lowest">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
                  )}
                </Button>
              </Link>
              <Link href={messagesHref}>
                <Button variant="ghost" size="sm" className="relative">
                  <MessageSquare size={18} />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-container-lowest" />
                </Button>
              </Link>
              <Link
                href={profileHref}
                className="flex items-center gap-2 pl-1 group"
              >
                <span className="hidden md:block text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {firstName}
                </span>
                <Avatar name={userName ?? "User"} src={avatarUrl ?? undefined} size="md" online className="cursor-pointer" />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 hidden md:inline-flex"
                onClick={() => setSignOutDialogOpen(true)}
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" aria-label="Sign in or create account" className="hidden md:inline-flex">
                  <User size={18} />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="primary" size="sm">Sign In</Button>
              </Link>
            </>
          )}
          {menuItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
        </div>
      </div>

      {menuItems.length > 0 && mobileMenuOpen && (
        <div className="lg:hidden border-t border-outline-variant bg-surface-container-lowest">
          <nav className="max-w-[1440px] mx-auto px-6 py-4 flex flex-col gap-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-sm font-medium transition-colors py-2 ${
                    isActive
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {signOutDialogOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 animate-[dialog-in_0.2s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-out-dialog-title"
            onClick={() => setSignOutDialogOpen(false)}
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
                  <h3 id="sign-out-dialog-title" className="font-display font-bold text-lg text-on-surface">
                    Sign out?
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    Are you sure you want to sign out? You&apos;ll need to sign in again to access your dashboard.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setSignOutDialogOpen(false)}>
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
    </header>
  );
}