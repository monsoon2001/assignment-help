"use client";

import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  DollarSign,
  MessageSquare,
  MessagesSquare,
  SquarePen,
  Phone,
  Headset,
} from "lucide-react";
import Button from "@/components/ui/button";
import { useVoiceCall } from "@/components/call/voice-call";

const links = [
  { key: "dashboard", href: "/helper/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "requests", href: "/helper/requests", label: "Incoming Requests", icon: Inbox },
  { key: "orders", href: "/helper/orders", label: "Active Orders", icon: Briefcase },
  { key: "earnings", href: "/helper/earnings", label: "Earnings", icon: DollarSign },
  { key: "messages", href: "/helper/messages", label: "Messages", icon: MessageSquare },
  { key: "chat-admin", href: "/helper/chat-admin", label: "Chat With Admin", icon: MessagesSquare },
  { key: "profile", href: "/helper/profile", label: "Edit Profile", icon: SquarePen },
];

export default function HelperNav({
  completedOrders,
  activeOrders,
}: {
  completedOrders: number;
  activeOrders: number;
}) {
  const segments = useSelectedLayoutSegments();
  const current = segments[0];

  return (
    <aside className="w-64 shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 min-h-[calc(100vh-4rem)] p-4 hidden md:flex flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const active = current === link.key;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
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

      <div className="mt-auto pt-4 flex flex-col gap-3">
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-3">
          <p className="text-sm font-medium text-on-surface">
            {completedOrders} completed order{completedOrders === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {activeOrders} order{activeOrders === 1 ? "" : "s"} currently active
          </p>
        </div>
        <CallAdminButton />
      </div>
    </aside>
  );
}

function CallAdminButton() {
  const { startCall, adminPeer, phase } = useVoiceCall();
  const busy = phase !== "idle";
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        disabled={!adminPeer || busy}
        onClick={() => adminPeer && startCall(adminPeer)}
        aria-label="Call the support desk"
      >
        <Phone size={15} />
        Call Admin
      </Button>
      <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-on-surface-variant">
        <Headset size={11} />
        Free voice with the support desk
      </p>
    </div>
  );
}