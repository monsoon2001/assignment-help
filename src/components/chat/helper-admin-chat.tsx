"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  MessageSquare,
  Phone,
  Send,
  SmilePlus,
} from "lucide-react";
import Avatar from "@/components/ui/avatar";
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

type AdminPeer = { id: string; name: string; avatarUrl?: string | null };

const EMOJIS = [
  "😀", "😂", "😊", "😍", "😎", "🤔",
  "😅", "😉", "🤗", "😴", "🤯", "🥳",
  "🙌", "👍", "👏", "🙏", "💪", "🤝",
  "✨", "🔥", "🎉", "❤️", "💯", "🚀",
  "✅", "⭐", "🎯", "📚", "📖", "✏️",
  "📝", "📅", "⏰", "☕", "🧠", "🎓",
];

function timeLabel(value: string): string {
  const d = new Date(value);
  const sameDay = new Date().toDateString() === d.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function HelperAdminChat({ admin }: { admin: AdminPeer }) {
  const { startCall, phase } = useVoiceCall();
  const callBusy = phase !== "idle";

  const [me, setMe] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [logs, setLogs] = useState<CallLog[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const meRef = useRef<string | null>(null);
  const adminId = admin.id;

  const refreshMessages = useCallback(async () => {
    if (!meRef.current) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("admin_messages")
      .select("id, sender_id, recipient_id, body, created_at")
      .or(`and(sender_id.eq.${meRef.current},recipient_id.eq.${adminId}),and(sender_id.eq.${adminId},recipient_id.eq.${meRef.current})`)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as AdminMessage[]);
  }, [adminId]);

  const refreshLogs = useCallback(async () => {
    if (!meRef.current) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("call_logs")
      .select("id, caller_id, callee_id, direction, status, started_at, duration_seconds")
      .or(`and(caller_id.eq.${meRef.current},callee_id.eq.${adminId}),and(caller_id.eq.${adminId},callee_id.eq.${meRef.current})`)
      .order("started_at", { ascending: true });
    setLogs((data ?? []) as CallLog[]);
  }, [adminId]);

  const timeline = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = [
      ...messages.map((m) => ({ kind: "message" as const, msg: m, ts: m.created_at })),
      ...logs.map((l) => ({ kind: "call" as const, log: l, ts: l.started_at })),
    ].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    return items;
  }, [messages, logs]);

  const totalSeconds = logs
    .filter((l) => l.status === "answered")
    .reduce((sum, l) => sum + (l.duration_seconds || 0), 0);
  const missedCount = logs.filter((l) => l.status === "missed").length;

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let channel: RealtimeChannel | null = null;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      meRef.current = data.user?.id ?? null;
      setMe(data.user?.id ?? null);
      void refreshMessages();
      void refreshLogs();
    });

    channel = supabase
      .channel(ADMIN_MESSAGES_CHANNEL)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_messages" },
        (payload) => {
          const msg = payload.new as AdminMessage;
          const myId = meRef.current;
          if (!myId) return;
          const involved = (msg.sender_id === myId || msg.recipient_id === myId) &&
            (msg.sender_id === adminId || msg.recipient_id === adminId);
          if (!involved) return;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "call_logs" },
        () => void refreshLogs()
      )
      .subscribe();

    const poll = setInterval(() => {
      if (active) {
        void refreshMessages();
        void refreshLogs();
      }
    }, 20000);

    return () => {
      active = false;
      clearInterval(poll);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [adminId, refreshMessages, refreshLogs]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [timeline.length]);

  useEffect(() => {
    if (!emojiOpen) return;
    const onClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [emojiOpen]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !draft.trim()) return;
    setSending(true);
    const supabase = createClient();
    await supabase
      .from("admin_messages")
      .insert({ sender_id: me, recipient_id: adminId, body: draft.trim() });
    setDraft("");
    setSending(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-[clamp(380px,calc(100vh-260px),700px)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-outline-variant bg-surface-container-low/60">
        <Avatar name={admin.name} src={admin.avatarUrl ?? undefined} size="md" online />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-on-surface">Chat with Admin</p>
          {logs.length > 0 && (
            <p className="text-[11px] text-on-surface-variant">
              {logs.length} call{logs.length !== 1 ? "s" : ""}
              {totalSeconds > 0 ? ` · ${formatDuration(totalSeconds)} talk time` : ""}
              {missedCount > 0 ? ` · ${missedCount} missed` : ""}
            </p>
          )}
          {logs.length === 0 && (
            <p className="text-[11px] text-emerald-600 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Support desk · messages sync live
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={callBusy}
          onClick={() => startCall(admin)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            callBusy
              ? "bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed"
              : "bg-primary text-on-primary hover:bg-primary/90"
          }`}
          aria-label={`Call ${admin.name}`}
        >
          <Phone size={13} />
          Call
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-surface-container-low/40 overscroll-contain pb-6">
        {timeline.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquare size={26} className="text-on-surface-variant/50" />
            <p className="text-sm text-on-surface-variant">No messages yet.</p>
            <p className="text-xs text-on-surface-variant/80">
              Say hi — the admin will reply here in realtime.
            </p>
          </div>
        )}
        {timeline.map((item) => {
          if (item.kind === "message") {
            const m = item.msg;
            const mine = m.sender_id === me;
            return (
              <div key={`msg-${m.id}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "bg-primary-container text-on-primary rounded-br-md"
                      : "bg-surface-container-high text-on-surface rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-on-primary/70" : "text-on-surface-variant"}`}>
                    {timeLabel(m.created_at)}
                  </p>
                </div>
              </div>
            );
          }

          const l = item.log;
          const outgoing = l.caller_id === me;
          return (
            <div key={`call-${l.id}`} className="flex justify-center">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${callColor(l.status)}`}>
                {callIcon(l.status)}
                <span>
                  {outgoing ? "Call to Admin" : "Call from Admin"}
                  {" \u00b7 "}
                  {callStatusLabel(l.status)}
                  {l.status === "answered" && l.duration_seconds > 0
                    ? ` \u00b7 ${formatDuration(l.duration_seconds)}`
                    : ""}
                </span>
                <span className="text-[10px] opacity-60 ml-1">{timeLabel(l.started_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-outline-variant px-4 py-3 bg-surface-container-lowest">
        <div className="relative">
          {emojiOpen && (
            <div
              ref={emojiRef}
              className="absolute bottom-12 left-0 z-20 p-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-lg"
            >
              <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto pr-0.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setDraft((d) => d + e);
                      setEmojiOpen(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={sendMessage} className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setEmojiOpen((o) => !o)}
              className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                emojiOpen ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
              aria-label="Add emoji"
            >
              <SmilePlus size={17} />
            </button>
            <div className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20 transition-all px-3 py-2">
              <textarea
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message…"
                className="w-full resize-none outline-none bg-transparent text-sm text-on-surface placeholder:text-outline min-h-[24px] max-h-32"
                style={{ height: "auto" }}
              />
            </div>
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="w-10 h-10 shrink-0 rounded-xl bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}