"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, FileText, ShoppingBag, MessageSquare, CheckCircle2, Settings, ChevronRight, Wallet, RotateCcw } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";

export type AppNotification = {
  id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

type Tone = { icon: React.ComponentType<{ size?: number; className?: string }>; tone: string };

const typeConfig: Record<string, Tone> = {
  proposal: { icon: FileText, tone: "bg-secondary-container text-on-secondary-container" },
  payment: { icon: Wallet, tone: "bg-emerald-100 text-emerald-700" },
  message: { icon: MessageSquare, tone: "bg-primary-container text-on-primary" },
  delivery: { icon: ShoppingBag, tone: "bg-tertiary-container text-on-tertiary" },
  revision: { icon: RotateCcw, tone: "bg-amber-100 text-amber-700" },
  completed: { icon: CheckCircle2, tone: "bg-success text-white" },
  system: { icon: Settings, tone: "bg-surface-container-high text-on-surface-variant" },
};

function fallbackTone(): Tone {
  return { icon: Bell, tone: "bg-surface-container-high text-on-surface-variant" };
}

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function NotificationsView({
  initial,
  emptyHref = "/dashboard",
}: {
  initial: AppNotification[];
  emptyHref?: string;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>(initial);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active || !data.user) return;
        channel = supabase
          .channel(realtimeTopic(`notifications:${data.user.id}`))
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${data.user.id}` },
            (payload) => {
              const n = payload.new as AppNotification;
              setNotifications((prev) => [n, ...prev]);
            }
          )
          .subscribe();
      });

    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllRead() {
    setMarking(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", data.user.id)
          .eq("read", false);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } finally {
      setMarking(false);
    }
  }

  function handleOpen(n: AppNotification) {
    if (!n.read) void markRead(n.id);
    if (n.link) {
      router.push(n.link);
      router.refresh();
    }
  }

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">Notifications</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          {unreadCount} unread update{unreadCount === 1 ? "" : "s"} on your workspace
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={marking || unreadCount === 0}>
          Mark all read
        </Button>
      </div>
    </div>
  );

  if (notifications.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
        {header}
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <span className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center">
            <Bell size={26} className="text-primary" />
          </span>
          <h3 className="font-semibold text-on-surface">You&apos;re all caught up</h3>
          <p className="text-sm text-on-surface-variant max-w-sm">
            You don&apos;t have any notifications yet. You&apos;ll be notified here when a helper
            proposes, messages you, or delivers work.
          </p>
          <Link href={emptyHref}>
            <Button variant="outline">Back to your workspace</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {header}

      <Card className="divide-y divide-outline-variant/50 overflow-hidden">
        {notifications.map((n) => {
          const conf = typeConfig[n.type] ?? fallbackTone();
          const Icon = conf.icon;
          return (
            <button
              key={n.id}
              onClick={() => handleOpen(n)}
              className={`w-full text-left p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                n.read ? "" : "bg-surface-container-low/60 hover:bg-surface-container-low"
              } hover:bg-surface-container-low`}
            >
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${conf.tone}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${n.read ? "text-on-surface-variant" : "font-semibold text-on-surface"}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-on-surface-variant">{timeAgo(n.created_at)}</span>
                  {n.link && (
                    <>
                      <span className="w-0.5 h-3 bg-outline-variant" />
                      <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                        Open <ChevronRight size={12} />
                      </span>
                    </>
                  )}
                </div>
              </div>
              {!n.read && <Badge variant="primary" className="shrink-0 px-2 py-0.5">New</Badge>}
            </button>
          );
        })}
      </Card>
    </div>
  );
}