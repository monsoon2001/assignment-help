"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Bell,
  User,
  type LucideIcon,
} from "lucide-react";
import Badge from "@/components/ui/badge";

export type StudentNavItem = {
  key: "dashboard" | "requests" | "messages" | "notifications" | "profile";
  href: string;
  label: string;
  badge?: string;
};

const ICONS: Record<StudentNavItem["key"], LucideIcon> = {
  dashboard: LayoutDashboard,
  requests: FileText,
  messages: MessageSquare,
  notifications: Bell,
  profile: User,
};

export default function StudentNav({ items }: { items: StudentNavItem[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const Icon = ICONS[item.key];
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-primary-container text-on-primary shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge && <Badge variant="primary" className="px-2 py-0.5">{item.badge}</Badge>}
          </Link>
        );
      })}
    </>
  );
}