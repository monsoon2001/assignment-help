"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Briefcase,
  CreditCard,
  MessageSquare,
  Settings,
  Shield,
} from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/helpers", label: "Helpers", icon: UserCheck },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/orders", label: "Orders", icon: Briefcase },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
            <div>
              <p className="text-sm font-medium text-on-surface">Admin User</p>
              <p className="text-xs text-on-surface-variant">admin@peercraft.com</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-auto min-h-screen">{children}</main>
    </div>
  );
}
