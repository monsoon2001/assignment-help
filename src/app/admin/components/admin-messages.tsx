"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { MessageSquare, Phone, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_MESSAGES_CHANNEL } from "@/lib/supabase/realtime";
import { useVoiceCall } from "@/components/call/voice-call";
import {
  callColor,
  callIcon,
  callStatusLabel,
  formatDuration,
  type AdminMessage,
  type CallLog,
  type TimelineItem,
} from "@/components/chat/admin-chat-utils";

type HelperLite = {
  id: string;
  name: string | null;
  email: string | null;
  status: string;
  avatar_url: string | null;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function AdminMessages({ helpers }: { helpers: HelperLite[] }) {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const meRef = useRef<string | null>(null);
const selectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    meRef.current = me;
  }, [me]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const cardScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;

    supabase.auth.getUser().then(({ data }) => {
      setMe(data.user?.id ?? null);
    });

    supabase
      .channel(ADMIN_MESSAGES_CHANNEL)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_messages" },
        (payload) => {
          const msg = payload.new as AdminMessage;
          const userId = meRef.current;
          const openId = selectedIdRef.current;
          setMessages((prev) => {
            const involved = msg.sender_id === userId || msg.recipient_id === userId;
            if (!involved || !openId) return prev;
            if (msg.sender_id !== openId && msg.recipient_id !== openId) return prev;
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.sender_id !== userId) {
            setUnread((u) => ({ ...u, [msg.sender_id]: (u[msg.sender_id] ?? 0) + 1 }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "call_logs" },
        () => {
          const openId = selectedIdRef.current;
          const userId = meRef.current;
          if (!openId || !userId) return;
          void (async () => {
            const { data } = await supabase
              .from("call_logs")
              .select("id, caller_id, callee_id, direction, status, started_at, duration_seconds")
              .or(`and(caller_id.eq.${userId},callee_id.eq.${openId}),and(caller_id.eq.${openId},callee_id.eq.${userId})`)
              .order("started_at", { ascending: true });
            setLogs((data ?? []) as CallLog[]);
          })();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeAllChannels();
    };
  }, []);

  const openThread = useCallback(async (helperId: string) => {
    setSelectedId(helperId);
    setUnread((u) => ({ ...u, [helperId]: 0 }));
    if (!supabaseRef.current || !me) return;
    const { data } = await supabaseRef.current
      .from("admin_messages")
      .select("id, sender_id, recipient_id, body, created_at")
      .or(`sender_id.eq.${me},sender_id.eq.${helperId}`)
      .or(`recipient_id.eq.${me},recipient_id.eq.${helperId}`)
      .order("created_at", { ascending: true });
    // Combined filter would be ideal; fall back to fetching both directions.
    const { data: otherSide } = await supabaseRef.current
      .from("admin_messages")
      .select("id, sender_id, recipient_id, body, created_at")
      .or(`sender_id.eq.${helperId},recipient_id.eq.${helperId}`)
      .order("created_at", { ascending: true });
    setMessages(
      (data ?? [])
        .concat(otherSide ?? [])
        .filter((m: AdminMessage) => (m.sender_id === me || m.recipient_id === me) && (m.sender_id === helperId || m.recipient_id === helperId))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    );
    const { data: logRows } = await supabaseRef.current
      .from("call_logs")
      .select("id, caller_id, callee_id, direction, status, started_at, duration_seconds")
      .or(`and(caller_id.eq.${me},callee_id.eq.${helperId}),and(caller_id.eq.${helperId},callee_id.eq.${me})`)
      .order("started_at", { ascending: true });
    setLogs((logRows ?? []) as CallLog[]);
  }, [me]);

  useEffect(() => {
    const el = cardScrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !selectedId || !draft.trim()) return;
    setSending(true);
    await supabaseRef.current
      ?.from("admin_messages")
      .insert({ sender_id: me, recipient_id: selectedId, body: draft.trim() });
    setDraft("");
    setSending(false);
  }

  const selected = !selectedId ? null : helpers.find((h) => h.id === selectedId) ?? null;
  const { startCall, phase } = useVoiceCall();
  const callBusy = phase !== "idle";

  const timeline = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = [
      ...messages.map((m) => ({ kind: "message" as const, msg: m, ts: m.created_at })),
      ...logs.map((l) => ({ kind: "call" as const, log: l, ts: l.started_at })),
    ].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    return items;
  }, [messages, logs]);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      <Card className="overflow-hidden h-fit lg:max-h-[70vh] lg:overflow-y-auto">
        <div className="p-4 border-b border-outline-variant/30">
          <h2 className="font-display font-semibold text-on-surface">Helpers</h2>
          <p className="text-xs text-on-surface-variant">Message any helper directly</p>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {helpers.length === 0 && <p className="p-4 text-sm text-on-surface-variant">No helpers yet.</p>}
          {helpers.map((helper) => (
            <button
              key={helper.id}
              onClick={() => openThread(helper.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors ${
                selectedId === helper.id ? "bg-primary-container/20" : "hover:bg-surface-container-low"
              }`}
            >
              <Avatar name={helper.name ?? "Helper"} src={helper.avatar_url ?? undefined} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{helper.name ?? "Helper"}</p>
                <p className="text-xs text-on-surface-variant truncate">{helper.email}</p>
              </div>
              {unread[helper.id] ? <Badge variant="primary">{unread[helper.id]}</Badge> : null}
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col min-h-[60vh]">
        {selected ? (
          <>
            <div className="p-4 border-b border-outline-variant/30 flex items-center gap-3">
              <Avatar name={selected.name ?? "Helper"} src={selected.avatar_url ?? undefined} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface">{selected.name ?? "Helper"}</p>
                <p className="text-xs text-on-surface-variant truncate">{selected.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={callBusy}
                onClick={() =>
                  startCall({ id: selected.id, name: selected.name ?? "Helper", avatarUrl: selected.avatar_url })
                }
                aria-label={`Call ${selected.name ?? "Helper"}`}
              >
                <Phone size={15} />
                Call
              </Button>
            </div>

            <div ref={cardScrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-surface-container-low/40">
              {timeline.length === 0 && (
                <p className="text-center text-sm text-on-surface-variant py-10">
                  No messages yet. Say hi!
                </p>
              )}
              {timeline.map((item) => {
                if (item.kind === "call") {
                  const l = item.log;
                  const outgoing = l.caller_id === me;
                  return (
                    <div key={`call-${l.id}`} className="flex justify-center">
                      <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${callColor(l.status)}`}>
                        {callIcon(l.status)}
                        <span>
                          {outgoing ? "Call to Helper" : "Call from Helper"}
                          {" \u00b7 "}
                          {callStatusLabel(l.status)}
                          {l.status === "answered" && l.duration_seconds > 0
                            ? ` \u00b7 ${formatDuration(l.duration_seconds)}`
                            : ""}
                        </span>
                        <span className="text-[10px] opacity-60 ml-1">{formatTime(l.started_at)}</span>
                      </div>
                    </div>
                  );
                }
                const m = item.msg;
                const mine = m.sender_id === me;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        mine
                          ? "bg-primary-container text-on-primary rounded-br-md"
                          : "bg-surface-container-high text-on-surface rounded-bl-md"
                      }`}
                    >
                      <p>{m.body}</p>
                      <p className={`text-[10px] mt-1 ${mine ? "text-on-primary/70" : "text-on-surface-variant"}`}>
                        {formatTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-outline-variant/30 flex items-center gap-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-11 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container"
              />
              <Button type="submit" disabled={!draft.trim() || sending}>
                <Send size={16} />
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center">
              <MessageSquare size={26} className="text-primary" />
            </span>
            <h3 className="font-semibold text-on-surface">Select a helper</h3>
            <p className="text-sm text-on-surface-variant max-w-sm">
              Choose a helper from the list to start a support conversation.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}