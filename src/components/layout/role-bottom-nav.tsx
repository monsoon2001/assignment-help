"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  GraduationCap,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Bell,
  User,
  Plus,
  Inbox,
  Briefcase,
  DollarSign,
  MessagesSquare,
  Users,
  UserCheck,
  CreditCard,
  ShieldAlert,
  Settings,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  requests: FileText,
  messages: MessageSquare,
  notifications: Bell,
  profile: User,
  new_request: Plus,
  inbox: Inbox,
  orders: Briefcase,
  earnings: DollarSign,
  chat_admin: MessagesSquare,
  students: Users,
  helpers: UserCheck,
  payments: CreditCard,
  chat_monitor: ShieldAlert,
  settings: Settings,
  admin_profile: UserRound,
};

export type RoleNavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

export default function RoleBottomNav({
  primary,
  more,
  roleLabel,
}: {
  primary: RoleNavItem[];
  more: RoleNavItem[];
  roleLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur px-1 pb-[env(safe-area-inset-bottom)]"
        aria-label={`${roleLabel} navigation`}
      >
        <div className="flex items-stretch justify-around">
          {primary.map((item) => {
            const Icon = ICONS[item.icon] ?? Menu;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-[64px] text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="relative">
                  <Icon size={20} />
                  {item.badge ? (
                    <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </span>
                <span className="truncate max-w-[72px]">{item.label}</span>
                {active && (
                  <span className="absolute top-0 inset-x-3 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-[64px] text-[10px] font-medium text-on-surface-variant hover:text-on-surface cursor-pointer"
            aria-label="More navigation options"
          >
            <Menu size={20} />
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[80] flex flex-col md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div
            className="absolute inset-0 bg-black/40 animate-[fade-in_0.15s_ease-out]"
            onClick={() => setOpen(false)}
          />
          <div className="relative mt-auto bg-surface-container-lowest rounded-t-3xl border-t border-outline-variant shadow-2xl animate-[sheet-up_0.2s_ease-out] overflow-y-auto max-h-[75vh] pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <GraduationCap size={18} />
                </span>
                <span className="font-display font-bold text-on-surface">PeerCraft</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-container text-on-primary rounded-md uppercase">
                  {roleLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-lg text-on-surface-variant hover:bg-surface-container-low flex items-center justify-center cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-3 pb-4 grid grid-cols-2 gap-1.5">
              {[...primary, ...more].map((item) => {
                const Icon = ICONS[item.icon] ?? Menu;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      active
                        ? "bg-primary-container text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <Icon size={17} />
                    <span className="truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}