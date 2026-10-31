"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";

/**
 * Keeps the server-rendered dashboard current without a manual reload.
 *
 * The App Router can serve a cached RSC payload when a student navigates back
 * to the dashboard, and notifications/orders arrive while the page is already
 * open. Refresh on focus/visibility, on live order/notification events, and on
 * a slow poll so action cards appear and disappear promptly without overlapping
 * refresh requests.
 */
export default function DashboardRefresh({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let refreshTimer: number | undefined;

    const scheduleRefresh = () => {
      if (!active || document.visibilityState === "hidden" || refreshTimer !== undefined) return;
      refreshTimer = window.setTimeout(() => {
        refreshTimer = undefined;
        if (active && document.visibilityState !== "hidden") router.refresh();
      }, 300);
    };

    const onFocus = () => scheduleRefresh();
    const onVisibility = () => scheduleRefresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const poll = window.setInterval(scheduleRefresh, 60000);

    channel = supabase
      .channel(realtimeTopic(`dashboard:${userId}`))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `student_id=eq.${userId}` },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests", filter: `student_id=eq.${userId}` },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      active = false;
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [router, userId]);

  return null;
}
