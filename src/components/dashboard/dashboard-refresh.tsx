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
 * open. Refresh on mount, on focus/visibility, on live order/notification
 * events, and on a slow poll so action cards appear and disappear promptly.
 */
export default function DashboardRefresh({ userId }: { userId: string }) {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const refresh = () => {
      if (!active || document.visibilityState === "hidden") return;
      router.refresh();
    };

    // Drop the possibly stale client-router cache as soon as the dashboard mounts.
    router.refresh();

    const onFocus = () => refresh();
    const onVisibility = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const poll = window.setInterval(refresh, 15000);

    channel = supabase
      .channel(realtimeTopic(`dashboard:${userId}`))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `student_id=eq.${userId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requests", filter: `student_id=eq.${userId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        refresh
      )
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [router, userId]);

  return null;
}
