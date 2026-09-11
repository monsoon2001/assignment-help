"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, School, ShieldCheck, FileText, ShoppingCart, CreditCard, MessageSquare, Settings } from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: School },
  { href: "/admin/helpers", label: "Helpers", icon: ShieldCheck },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 min-h-screen p-4 flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-4 px-3">
        <div className="flex items-center gap-2">
          <span className="text-primary-container text-xl">◆</span>
          <span className="font-display text-lg font-semibold tracking-tight text-on-surface">PeerCraft</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold uppercase tracking-wider">Admin</span>
      </div>
      <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider px-3 mb-1">Navigation</span>
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
  );
}
