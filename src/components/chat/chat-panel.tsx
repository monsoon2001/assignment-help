"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Send, SmilePlus, X } from "lucide-react";
import Avatar from "@/components/ui/avatar";
import Card from "@/components/ui/card";
import SecureFileLink from "@/components/ui/secure-file-link";
import { fileNameFromStoredUrl, type StorageBucket } from "@/lib/signed-files";

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
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fileNameFromUrl(url: string): string {
  return fileNameFromStoredUrl(url);
}

const EMOJIS = [
  "😀",
  "😂",
  "😊",
  "😍",
  "😎",
  "🤔",
  "😅",
  "😉",
  "🤗",
  "😴",
  "🤯",
  "🥳",
  "🙌",
  "👍",
  "👏",
  "🙏",
  "💪",
  "🤝",
  "✨",
  "🔥",
  "🎉",
  "❤️",
  "💯",
  "🚀",
  "✅",
  "⭐",
  "🎯",
  "📚",
  "📖",
  "✏️",
  "📝",
  "📅",
  "⏰",
  "☕",
  "🧠",
  "🎓",
];

export default function ChatPanel({
  title = "Order Chat",
  fill = false,
  compact = false,
  className = "",
  messages,
  draft,
  setDraft,
  files,
  setFiles,
  sending,
  error,
  onSend,
  bottomRef,
  currentUserId,
  filesBucket,
  counterpartName,
}: {
  title?: string;
  /** When true the panel fills its parent's height instead of using a viewport clamp. */
  fill?: boolean;
  /** Tighter typography/spacing so more conversation fits on screen. */
  compact?: boolean;
  className?: string;
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
  /** Storage bucket that hosted this chat's attachments (request-files or order-files). */
  filesBucket?: StorageBucket;
  /**
   * Display name for the other party's messages. Student views pass the
   * branded "Acadivo Helper" label so the helper's real name/photo never leaks
   * through the message avatars.
   */
  counterpartName?: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const messageListRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  // Grow the composer with the message instead of letting long or multi-line
  // drafts scroll inside a single-line box. The CSS max-height caps it, after
  // which the textarea scrolls on its own.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    el.style.overflowY = el.scrollHeight > 128 ? "auto" : "hidden";
  }, [draft]);

  // Keep the newest message in view: jump to the bottom on mount and whenever
  // the conversation changes. A second rAF pass handles late layout (fonts,
  // wrapped lines, attachment chips) that can grow the scroll height after the
  // first paint and otherwise leave the view stuck on the oldest message.
  useEffect(() => {
    const el = messageListRef.current;
    if (!el) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      raf2 = requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [messages]);

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
    <Card
      className={`flex flex-col overflow-hidden ${
        fill
          ? "h-full min-h-0"
          : "h-[clamp(300px,calc(100dvh-320px),480px)] sm:h-[clamp(360px,calc(100dvh-300px),560px)] xl:h-[clamp(400px,calc(100dvh-280px),600px)]"
      } ${className}`}
    >
      <div
        className={`flex items-center gap-3 ${compact ? "px-3 py-2" : "px-5 py-3"} border-b border-outline-variant bg-surface-container-low/60`}
      >
        <div className="min-w-0 flex-1">
          <p className={`${compact ? "text-sm" : "text-sm"} font-semibold text-on-surface`}>
            {title}
          </p>
          <p className="text-xs text-success inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            Live · messages sync instantly
          </p>
        </div>
      </div>

      <div
        ref={messageListRef}
        className={`flex-1 overflow-y-auto ${compact ? "px-3 py-3 space-y-3 pb-4" : "px-5 py-4 space-y-4 pb-6"} bg-surface overscroll-contain`}
      >
        {messages.length === 0 && (
          <div className={`text-center ${compact ? "pt-10" : "pt-16"}`}>
            <p className="text-sm text-on-surface-variant">No messages yet — say hello!</p>
          </div>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} gap-2`}>
              {!isMine && (
                <Avatar
                  name={
                    counterpartName ||
                    (m.sender && !Array.isArray(m.sender) ? m.sender.name : null) ||
                    "U"
                  }
                  size="sm"
                  className="mt-1"
                />
              )}
              <div className={`max-w-[78%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`${compact ? "px-3 py-1.5 rounded-xl text-sm" : "px-3.5 py-2 rounded-2xl text-sm"} leading-snug text-left ${
                    isMine
                      ? "bg-primary-container text-on-primary rounded-br-sm"
                      : "bg-surface-container border border-outline-variant text-on-surface rounded-bl-sm"
                  }`}
                >
                  {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                  {m.attachment_url && (
                    <SecureFileLink
                      stored={m.attachment_url}
                      bucket={filesBucket}
                      className={`inline-flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        isMine
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "bg-primary-container/10 text-primary hover:bg-primary-hover/20"
                      }`}
                    >
                      <FileText size={14} />
                      {fileNameFromUrl(m.attachment_url)}
                    </SecureFileLink>
                  )}
                </div>
                <div
                  className={`flex items-center gap-1.5 mt-1 text-xs text-on-surface-variant ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <span>{timeLabel(m.created_at)}</span>
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

      <div
        className={`border-t border-outline-variant ${compact ? "px-3 py-2.5" : "px-4 py-3"} bg-surface-container-lowest`}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low text-xs text-on-surface-variant"
              >
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
        <div className="relative rounded-xl bg-white">
          {emojiOpen && (
            <div
              ref={emojiRef}
              className="absolute bottom-12 left-0 z-20 p-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-lg"
            >
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 max-h-48 overflow-y-auto pr-0.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => insertEmoji(e)}
                    className="w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-end gap-2">
            <label className="w-10 h-10 shrink-0 self-end flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-low cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40">
              <Paperclip size={17} />
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const f = Array.from(e.target.files ?? []);
                  if (f.length) setFiles([...files, f[0]]);
                }}
              />
            </label>
            <button
              onClick={() => setEmojiOpen((o) => !o)}
              className={`w-10 h-10 shrink-0 self-end flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                emojiOpen
                  ? "bg-primary-container text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
              aria-label="Add emoji"
            >
              <SmilePlus size={17} />
            </button>
            <div className="flex-1 min-w-0 rounded-xl border border-outline-variant bg-white focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20 transition-all px-3 py-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message…"
                className="block w-full resize-none outline-none bg-white text-base leading-6 text-on-surface placeholder:text-outline min-h-6 max-h-32 overflow-y-hidden"
              />
            </div>
            <button
              onClick={onSend}
              disabled={sending || (!draft.trim() && files.length === 0)}
              className="w-10 h-10 shrink-0 self-end rounded-xl bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
