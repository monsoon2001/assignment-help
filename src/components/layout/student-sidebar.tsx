"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, MessageSquare, Bell, User } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/browse-helpers", label: "Browse Helpers", icon: Users },
  { href: "/requests", label: "My Requests", icon: FileText },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  return (
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
  );
}
