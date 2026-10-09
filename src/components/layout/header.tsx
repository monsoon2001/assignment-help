"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Bell, MessageSquare, GraduationCap, Menu, X, LogOut, User, LayoutDashboard, ChevronDown, Home } from "lucide-react";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";
import type { UserRole } from "@/lib/auth";

export interface MenuChild {
  label: string;
  href: string;
  /** Optional right-aligned hint, e.g. a guide count. */
  meta?: string;
}

export interface MenuGroup {
  /** Omitted for plain lists of links, e.g. the subject columns. */
  title?: string;
  href?: string;
  items: MenuChild[];
}

export interface MenuItem {
  label: string;
  href: string;
  /** When present, hovering the item on large screens opens this dropdown. */
  groups?: MenuGroup[];
}

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  menuItems?: MenuItem[];
}

const CLOSE_DELAY_MS = 140;

export default function Header({ title, showSearch = true, menuItems = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const openNow = useCallback((href: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenMenu(href);
  }, []);

  const closeSoon = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), CLOSE_DELAY_MS);
  }, []);

  const closeNow = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenMenu(null);
  }, []);

  // Mobile menus always start closed; collapse the active accordion group too.
  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    setOpenMobileGroup(null);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeNow();
        closeMobileMenu();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [closeNow, closeMobileMenu]);

  // Never leave a dropdown open across navigation: a stale openMenu would keep
  // the full-screen overlaps in place, blocking taps and scrolling on the page
  // you just landed on. Reset the menu state when the route changes (handles
  // client-side navigation, back/forward, and programmatic redirects).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenMenu(null);
    setMobileMenuOpen(false);
    setOpenMobileGroup(null);
  }

  // If the viewport crosses the xl breakpoint (e.g. a drop-down opened on a
  // wide window, then the window is narrowed to mobile), close whatever is open
  // so an invisible full-screen overlay can't trap the page.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeMobileMenu();
      else closeNow();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [closeNow, closeMobileMenu]);

  const activeMenu = menuItems.find((item) => item.href === openMenu && item.groups?.length);

  const fetchUnread = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user.id) return;
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("read", false);
    setUnreadCount(count ?? 0);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user.id || !active) return;
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("read", false);
      if (active) setUnreadCount(count ?? 0);
    })();
    return () => {
      active = false;
    };
  }, [pathname]);

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
        const metaAvatar =
          session.user.user_metadata?.avatar_url ??
          session.user.user_metadata?.picture ??
          null;
        setAvatarUrl((metaAvatar as string) ?? null);
        const { data: profile } = await supabase
          .from("users")
          .select("role, name, avatar_url")
          .eq("id", session.user.id)
          .single();
        if (!active) return;
        setRole((profile?.role as UserRole) ?? null);
        setUserName((profile?.name as string) ?? session.user.email ?? null);
        setAvatarUrl((profile?.avatar_url as string) ?? (metaAvatar as string) ?? null);

        // Backfill the Google avatar (and a missing display name) into the users
        // table so server-rendered surfaces (listings, chats, admin) show the real
        // profile picture instead of the default placeholder.
        if (metaAvatar && !profile?.avatar_url) {
          const metaName =
            typeof session.user.user_metadata?.name === "string"
              ? session.user.user_metadata.name
              : null;
          const patch: Record<string, string> = { avatar_url: metaAvatar };
          if (metaName && !profile?.name) patch.name = metaName;
          supabase
            .from("users")
            .update(patch)
            .eq("id", session.user.id)
            .then(
              () => undefined,
              () => undefined
            );
        }

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
            { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` },
            () => {
              void fetchUnread();
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
  }, [fetchUnread]);

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
    <header className="sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur border-b border-outline-variant">
      <div className="max-w-360 mx-auto px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0 min-h-11 min-w-11">
          <span className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
            <GraduationCap size={20} />
          </span>
          <div className="leading-tight hidden sm:block">
            <p className="font-display font-bold text-on-surface text-lg">Acadivo</p>
            <p className="text-xs uppercase tracking-widest xl:tracking-widest text-on-surface-variant">Academic Network</p>
          </div>
        </Link>

        {showSearch && (
          <div className="hidden 2xl:flex items-center gap-1 text-sm rounded-lg bg-surface-container-low px-3 py-2 flex-1 max-w-xs 2xl:min-w-0 border border-transparent focus-within:border-primary-container">
            <Search size={16} className="text-on-surface-variant mr-2" />
            <input
              placeholder="Search helpers, requests, courses..."
              className="bg-transparent outline-none flex-1 text-on-surface placeholder:text-outline"
            />
          </div>
        )}

        {menuItems.length > 0 && (
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-5 flex-1 min-w-0 justify-center">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const hasDropdown = (item.groups?.length ?? 0) > 0;
              const isOpen = openMenu === item.href;
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={hasDropdown ? () => openNow(item.href) : undefined}
                  onMouseLeave={hasDropdown ? closeSoon : undefined}
                  onFocus={hasDropdown ? () => openNow(item.href) : undefined}
                  onBlur={hasDropdown ? closeSoon : undefined}
                >
                  <Link
                    href={item.href}
                    aria-haspopup={hasDropdown ? "true" : undefined}
                    aria-expanded={hasDropdown ? isOpen : undefined}
                    className={`flex items-center gap-1 py-1.5 whitespace-nowrap text-sm 2xl:text-sm font-medium transition-colors ${
                      isActive || isOpen
                        ? "text-primary"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {item.label}
                    {hasDropdown && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </div>
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
              {pathname !== "/" && (
                <Link href="/">
                  <Button variant="ghost" size="sm" aria-label="Back to homepage" className="hidden xl:inline-flex">
                    <Home size={16} />
                    <span className="hidden 2xl:inline">Home</span>
                  </Button>
                </Link>
              )}
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" aria-label="Dashboard">
                  <LayoutDashboard size={16} />
                  <span className="hidden 2xl:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href={notificationsHref}>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell size={18} />
                  {unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-error text-white text-xs font-bold flex items-center justify-center ring-2 ring-surface-container-lowest">
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
                className="flex items-center gap-2 pl-1 pr-1 min-h-11 group"
              >
                <span className="hidden 2xl:block text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
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
              className="xl:hidden"
              onClick={() => {
                if (mobileMenuOpen) closeMobileMenu();
                else {
                  setOpenMobileGroup(null);
                  setMobileMenuOpen(true);
                }
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
        </div>
      </div>

      {activeMenu && (
        <>
          {createPortal(
            <div
              className="fixed inset-0 z-40 bg-black/50 animate-[fade-in_0.18s_ease-out] hidden xl:block"
              onClick={closeNow}
              aria-hidden="true"
            />,
            document.body
          )}
          <div className="absolute inset-x-0 top-full hidden xl:block">
            <div className="mx-auto max-w-360 px-6 pt-3">
              <div
                className="max-h-[72vh] overflow-y-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-2xl shadow-black/20 animate-[sheet-up_0.18s_ease-out]"
                onMouseEnter={() => openNow(activeMenu.href)}
                onMouseLeave={closeSoon}
              >
                <div
                  className="grid gap-x-6 gap-y-5"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(activeMenu.groups!.length, 5)}, minmax(0, 1fr))`,
                  }}
                >
                  {activeMenu.groups!.map((group, groupIndex) => (
                    <div key={group.title ?? groupIndex} className="min-w-0">
                      {group.title && (
                        <div className="mb-2 border-b border-outline-variant/30 pb-2">
                          {group.href ? (
                            <Link
                              href={group.href}
                              onClick={closeNow}
                              className="font-display text-xs font-bold uppercase tracking-wide text-primary hover:underline"
                            >
                              {group.title}
                            </Link>
                          ) : (
                            <p className="font-display text-xs font-bold uppercase tracking-wide text-on-surface-variant">
                              {group.title}
                            </p>
                          )}
                        </div>
                      )}
                      <ul className="space-y-0.5">
                        {group.items.map((child) => (
                          <li key={`${group.title ?? groupIndex}-${child.href}-${child.label}`}>
                            <Link
                              href={child.href}
                              onClick={closeNow}
                              className="flex items-baseline justify-between gap-2 rounded-lg px-2 py-1 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
                            >
                              <span>{child.label}</span>
                              {child.meta && (
                                <span className="shrink-0 text-xs font-normal text-on-surface-variant">
                                  {child.meta}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 border-t border-outline-variant/30 pt-4">
                  <p className="text-xs text-on-surface-variant">
                    {activeMenu.label} —{" "}
                    {activeMenu.groups!.reduce((total, group) => total + group.items.length, 0)} links
                  </p>
                  <Link
                    href={activeMenu.href}
                    onClick={closeNow}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Browse everything
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {menuItems.length > 0 &&
        mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto xl:hidden bg-surface-container-lowest border-t border-outline-variant">
            <nav className="max-w-360 mx-auto px-6 py-4 pb-12 flex flex-col gap-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const hasGroups = (item.groups?.length ?? 0) > 0;
              const expanded = openMobileGroup === item.href;
              return (
                <div key={item.href} className="border-b border-outline-variant/30 last:border-b-0 pb-2">
                  <div className="flex items-center justify-between gap-2 min-h-11">
                    <Link
                      href={item.href}
                      className={`relative flex-1 min-w-0 py-2 text-sm font-medium transition-colors inline-flex items-center ${
                        isActive
                          ? "text-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
                      )}
                    </Link>
                    {hasGroups && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMobileGroup((prev) => (prev === item.href ? null : item.href))
                        }
                        aria-expanded={expanded}
                        aria-label={`${expanded ? "Close" : "Open"} ${item.label} menu`}
                        className="flex items-center justify-center w-11 h-11 shrink-0 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface cursor-pointer transition-colors"
                      >
                        <ChevronDown
                          size={20}
                          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                  {expanded && item.groups && item.groups.length > 0 && (
                    <div className="mb-1 flex flex-col gap-3 border-l border-outline-variant/30 pl-4">
                      {item.groups.map((group, groupIndex) => (
                        <div key={group.title ?? groupIndex} className="min-w-0">
                          {group.title && (
                            <p className="py-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                              {group.title}
                            </p>
                          )}
                          <div className="flex flex-col">
                            {group.items.map((child) => (
                              <Link
                                key={`${group.title ?? groupIndex}-${child.href}-${child.label}`}
                                href={child.href}
                                onClick={closeMobileMenu}
                                className="py-1.5 text-sm text-on-surface-variant transition-colors hover:text-primary min-h-11 inline-flex items-center"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          </div>,
          document.body
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
                    Confirm Sign Out
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    You&apos;ll need to sign in again to access your dashboard.
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