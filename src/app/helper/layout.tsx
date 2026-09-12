"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import WarningsBannerClient from "@/components/layout/warnings-banner-client";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  DollarSign,
  MessageSquare,
  User,
} from "lucide-react";

const links = [
  { href: "/helper/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/helper/requests", label: "Incoming Requests", icon: Inbox },
  { href: "/helper/orders", label: "Active Orders", icon: Briefcase },
  { href: "/helper/earnings", label: "Earnings", icon: DollarSign },
  { href: "/helper/messages", label: "Messages", icon: MessageSquare },
  { href: "/helper/profile", label: "Profile", icon: User },
];

export default function HelperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <WarningsBannerClient />
      <div className="flex flex-1">
        <aside className="w-64 shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 min-h-[calc(100vh-4rem)] p-4 hidden lg:flex flex-col gap-1">
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
        </aside>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
