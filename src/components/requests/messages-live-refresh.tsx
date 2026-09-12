"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";

export default function MessagesLiveRefresh() {
  const router = useRouter();
  const supabase = useRef(createClient());

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let active = true;
    const client = supabase.current;

    const refresh = () => {
      if (active) router.refresh();
    };

    void (async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user || !active) return;

      channel = client
        .channel(realtimeTopic(`msgs-inbox:${user.id}`))
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          refresh
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) void client.removeChannel(channel);
    };
  }, [router]);

  return null;
}