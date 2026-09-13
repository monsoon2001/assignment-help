"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Send, SmilePlus, X } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import Card from "@/components/ui/card";

export type ChatMessageRow = {
  id: string;
  sender_id: string;
  body: string;
  attachment_url: string | null;
  created_at: string;
  sender: { id: string; name: string | null } | null;
};

export function timeLabel(value: string): string {
  const d = new Date(value);
  const sameDay = new Date().toDateString() === d.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function fileNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split("/").pop() || "file";
    return decodeURIComponent(last.replace(/^[a-f0-9-]{36}-/, ""));
  } catch {
    return "file";
  }
}

const EMOJIS = [
  "😀", "😂", "😊", "😍", "😎", "🤔",
  "😅", "😉", "🤗", "😴", "🤯", "🥳",
  "🙌", "👍", "👏", "🙏", "💪", "🤝",
  "✨", "🔥", "🎉", "❤️", "💯", "🚀",
  "✅", "⭐", "🎯", "📚", "📖", "✏️",
  "📝", "📅", "⏰", "☕", "🧠", "🎓",
];

export default function ChatPanel({
  title = "Order Chat",
  messages, draft, setDraft, files, setFiles, sending, error, onSend, bottomRef, currentUserId,
}: {
  title?: string;
  messages: ChatMessageRow[];
  draft: string;
  setDraft: (v: string) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  sending: boolean;
  error: string | null;
  onSend: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  currentUserId?: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const messageListRef = useRef<HTMLDivElement | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = messageListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (!emojiOpen) return;
    const onClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [emojiOpen]);

  function insertEmoji(emoji: string) {
    setDraft((draft || "") + emoji);
    setEmojiOpen(false);
  }

  return (
    <Card className="flex flex-col h-[clamp(300px,calc(100vh-320px),480px)] sm:h-[clamp(360px,calc(100vh-300px),560px)] xl:h-[clamp(400px,calc(100vh-280px),600px)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-outline-variant bg-surface-container-low/60">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-on-surface">{title}</p>
          <p className="text-[11px] text-emerald-600 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Live · messages sync instantly
          </p>
        </div>
      </div>

      <div ref={messageListRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-surface-container-low/40 overscroll-contain pb-6">
        {messages.length === 0 && (
          <div className="text-center pt-16">
            <p className="text-sm text-on-surface-variant">No messages yet — say hello!</p>
          </div>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2.5`}>
              {!isMine && (
                <Avatar name={(m.sender && !Array.isArray(m.sender) ? m.sender.name : null) || "U"} size="sm" className="mt-1" />
              )}
              <div className={`max-w-[78%] ${isMine ? "items-end text-right" : "items-start"}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-primary-container text-on-primary rounded-br-sm"
                      : "bg-surface-container border border-outline-variant text-on-surface rounded-bl-sm"
                  }`}
                >
                  {m.body && <p>{m.body}</p>}
                  {m.attachment_url && (
                    <a
                      href={m.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        isMine
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "bg-primary-container/10 text-primary hover:bg-primary-container/20"
                      }`}
                    >
                      <FileText size={14} />
                      {fileNameFromUrl(m.attachment_url)}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-on-surface-variant justify-end">
                  <span className="w-full flex justify-end">{timeLabel(m.created_at)}</span>
                  {isMine && (
                    <span className="inline-flex items-center">
                      <Send size={12} className="text-primary opacity-0" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-outline-variant px-4 py-3 bg-surface-container-lowest">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low text-xs text-on-surface-variant">
                <FileText size={12} />
                {f.name}
                <button
                  className="text-on-surface-variant hover:text-error"
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        {error && <p className="text-xs text-error mb-2">{error}</p>}
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
                    onClick={() => insertEmoji(e)}
                    className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-end gap-2">
          <label className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer">
            <Paperclip size={17} />
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = Array.from(e.target.files ?? []);
                if (f.length) setFiles([...files, f[0]]);
              }}
            />
          </label>
          <button
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
            onClick={onSend}
            disabled={sending || (!draft.trim() && files.length === 0)}
            className="w-10 h-10 shrink-0 rounded-xl bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
          </button>
          </div>
        </div>
      </div>
    </Card>
  );
}