"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { ArrowRight, MessageSquare } from "lucide-react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";
import { buildThreads, type Thread } from "@/lib/threads";

export default function MessagesInbox({
  initialThreads,
  isHelper,
}: {
  initialThreads: Thread[];
  isHelper: boolean;
}) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const clientRef = useRef(createClient());
  const fetchingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const {
        data: { user },
      } = await clientRef.current.auth.getUser();
      if (!user) return;
      const next = await buildThreads(clientRef.current, user.id, isHelper);
      setThreads(next);
    } finally {
      fetchingRef.current = false;
    }
  }, [isHelper]);

  useEffect(() => {
    let active = true;
    let channel: RealtimeChannel | null = null;
    const client = clientRef.current;

    void (async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user || !active) return;

      channel = client
        .channel(realtimeTopic(`${isHelper ? "h" : "s"}-inbox:${user.id}`))
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          () => {
            void refresh();
          }
        )
        .subscribe();
    })();

    const poll = setInterval(() => {
      if (active) void refresh();
    }, 12000);

    return () => {
      active = false;
      clearInterval(poll);
      if (channel) void client.removeChannel(channel);
    };
  }, [refresh, isHelper]);

  const container = "w-full max-w-7xl mx-auto";
  const fallbackName = isHelper ? "Student" : "PeerCraft Helper";

  return (
    <div className={container}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">Messages</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {isHelper
              ? "Conversations with students about your requests and orders"
              : "Conversations about your requests and orders"}
          </p>
        </div>
        {!isHelper && (
          <Link href="/requests/new">
            <Button size="sm"><MessageSquare size={15} /> New Request</Button>
          </Link>
        )}
      </div>

      {threads.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare size={28} className="mx-auto text-on-surface-variant/60 mb-3" />
          <p className="text-on-surface-variant">No conversations yet.</p>
          <p className="text-sm text-on-surface-variant mt-1">
            {isHelper
              ? "Students you work with will appear here."
              : "Request help and chat with your helper here."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-1 divide-y divide-outline-variant/40 overflow-hidden lg:max-h-[70vh] overflow-y-auto">
            {threads.map((t) => (
              <Link
                key={t.key}
                href={t.link}
                className="flex items-start gap-3 p-4 hover:bg-surface-container-low transition-colors group"
              >
                <Avatar name={t.counterpart?.name ?? fallbackName} size="md" src={t.counterpart?.avatar_url ?? undefined} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-on-surface truncate group-hover:underline">
                      {t.counterpart?.name ?? fallbackName}
                    </p>
                    <span className="text-[11px] text-on-surface-variant shrink-0">
                      {new Date(t.lastAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-on-surface truncate">{t.title}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{t.lastPreview}</p>
                  <Badge variant={t.statusVariant} className="mt-2">{t.statusLabel}</Badge>
                </div>
              </Link>
            ))}
          </Card>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="p-8 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary-container/30 flex items-center justify-center">
                <MessageSquare size={26} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-on-surface">Live chats live in the workspace</h2>
                <p className="text-sm text-on-surface-variant mt-1 max-w-md">
                  Select a conversation to open its request or order workspace, where
                  the realtime chat, files, and deliverables live.
                </p>
              </div>
              {threads[0] && (
                <Link href={threads[0].link} className="mt-2">
                  <Button>Open latest conversation <ArrowRight size={15} /></Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}