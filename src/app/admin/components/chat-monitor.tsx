"use client";

import { useMemo, useState } from "react";
import { useTransition } from "react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { MessageSquare, Flag, ShieldAlert, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { flagMessage, updateFlagStatus, issueWarning } from "@/app/admin/chat-monitor/actions";

type ThreadParticipant = { id: string; name: string | null; role: string | null };
type Flag = { id: string; message_id: string; reason: string; status: string; created_at: string };
type Warning = { id: string; user_id: string; message_id: string | null; reason: string; created_at: string };

export type ChatMonitorThread = {
  id: string;
  kind: "request" | "order";
  title: string;
  createdAt: string;
  status?: string;
  participants: ThreadParticipant[];
  messages: {
    id: string;
    body: string | null;
    senderId: string;
    sender?: ThreadParticipant | null;
    createdAt: string;
    flags: Flag[];
  }[];
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatMonitor({
  threads,
  warnings,
}: {
  threads: ChatMonitorThread[];
  warnings: Warning[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openWarn, setOpenWarn] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allParticipants = useMemo(() => {
    const map = new Map<string, ThreadParticipant>();
    for (const t of threads) for (const p of t.participants) map.set(p.id, p);
    return map;
  }, [threads]);

  function doIssueWarning(userId: string, messageId: string, key: string) {
    const text = reason[key]?.trim();
    if (!text) return;
    setResult(null);
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("messageId", messageId);
    fd.set("reason", text);
    startTransition(async () => {
      const res = await issueWarning(fd);
      setResult(res.ok ? "Warning issued." : res.message);
      setOpenWarn((o) => ({ ...o, [key]: false }));
      setReason((r) => ({ ...r, [key]: "" }));
    });
  }

  function doFlag(messageId: string) {
    setResult(null);
    const fd = new FormData();
    fd.set("messageId", messageId);
    fd.set("reason", "Reported by admin");
    startTransition(async () => {
      await flagMessage(fd);
      setResult("Message flagged.");
    });
  }

  function doUpdateFlag(flagId: string, status: string) {
    setResult(null);
    const fd = new FormData();
    fd.set("flagId", flagId);
    fd.set("status", status);
    startTransition(async () => {
      await updateFlagStatus(fd);
      setResult(status === "confirmed" ? "Flag confirmed." : "Flag dismissed.");
    });
  }

  if (threads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MessageSquare size={28} className="mx-auto text-on-surface-variant mb-3" />
        <p className="text-on-surface-variant">No conversations yet.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {result && (
        <p className="text-sm text-success px-1">{result}</p>
      )}

      {threads.map((thread) => {
        const key = `${thread.kind}-${thread.id}`;
        const open = !!expanded[key];
        const threadFlags = thread.messages.flatMap((m) => m.flags);
        const pendingFlags = threadFlags.filter((f) => f.status === "pending");

        return (
          <Card key={key} className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-on-surface truncate">
                    {thread.kind === "request" ? "Request" : "Order"}
                    {" · "}
                    {thread.title}
                  </p>
                  {thread.kind === "order" && thread.status && (
                    <Badge variant="outline">{thread.status.replaceAll("_", " ")}</Badge>
                  )}
                  {pendingFlags.length > 0 && (
                    <Badge variant="danger">{pendingFlags.length} flag</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {thread.participants.map((p, i) => (
                    <span key={p.id} className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                      {i > 0 && <span className="text-outline-variant">&middot;</span>}
                      <Avatar name={p.name ?? p.role ?? "User"} size="sm" />
                      {p.name ?? "Unnamed"} ({p.role ?? "user"})
                    </span>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setExpanded((e) => ({ ...e, [key]: !open }))}>
                {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {open ? "Hide" : `${thread.messages.length} message${thread.messages.length !== 1 ? "s" : ""}`}
              </Button>
            </div>

            {open && (
              <div className="border-t border-outline-variant/30 divide-y divide-outline-variant/10">
                {thread.messages.length === 0 && (
                  <p className="p-5 text-sm text-on-surface-variant">No messages in this thread.</p>
                )}
                {thread.messages.map((msg) => {
                  const sender = msg.sender || allParticipants.get(msg.senderId);
                  const flags = msg.flags;
                  const pendingMsgFlags = flags.filter((f) => f.status === "pending");
                  const warnKey = `${key}-${msg.id}`;
                  const warnOpen = !!openWarn[warnKey];

                  return (
                    <div key={msg.id} className="px-4 sm:px-5 py-3.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar name={sender?.name ?? "?"} size="sm" />
                          <span className="text-sm font-medium text-on-surface truncate">
                            {sender?.name ?? "Unknown"}
                            {sender?.role && (
                              <span className="normal-case font-normal text-xs text-on-surface-variant">
                                {" "}· {sender.role}
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-on-surface-variant shrink-0">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {pendingMsgFlags.length === 0 && !flags.some((f) => f.status !== "dismissed") && (
                            <button
                              onClick={() => doFlag(msg.id)}
                              disabled={pending}
                              className="text-[11px] inline-flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                            >
                              <Flag size={12} /> Flag
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                        {msg.body || <span className="italic">(attachment)</span>}
                      </p>

                      {flags.filter((f) => f.status !== "dismissed").map((f) => (
                        <div
                          key={f.id}
                          className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-error/5 border border-error/20 text-xs"
                        >
                          <ShieldAlert size={13} className="text-error shrink-0" />
                          <span className="text-on-surface font-medium">Flagged:</span>
                          <span className="text-on-surface-variant">{f.reason}</span>
                          <span className="text-on-surface-variant">{f.status}</span>
                          <span className="flex items-center gap-1.5 ml-auto">
                            {f.status !== "confirmed" && (
                              <button
                                onClick={() => doUpdateFlag(f.id, "confirmed")}
                                disabled={pending}
                                className="inline-flex items-center gap-1 text-success hover:underline cursor-pointer"
                              >
                                <Check size={12} /> Confirm
                              </button>
                            )}
                            {f.status !== "dismissed" && (
                              <button
                                onClick={() => doUpdateFlag(f.id, "dismissed")}
                                disabled={pending}
                                className="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
                              >
                                <X size={12} /> Dismiss
                              </button>
                            )}
                            <button
                              onClick={() => setOpenWarn((o) => ({ ...o, [warnKey]: !warnOpen }))}
                              className="inline-flex items-center gap-1 text-error hover:underline cursor-pointer"
                            >
                              <ShieldAlert size={12} /> Warn sender
                            </button>
                          </span>

                          {warnOpen && (
                            <div className="w-full flex items-center gap-2">
                              <input
                                value={reason[warnKey] || ""}
                                onChange={(e) => setReason((r) => ({ ...r, [warnKey]: e.target.value }))}
                                placeholder="Warning reason (e.g. sharing phone number)"
                                className="flex-1 h-9 px-3 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:border-primary-container"
                              />
                              <Button
                                size="sm"
                                disabled={!reason[warnKey]?.trim() || pending}
                                onClick={() => doIssueWarning(msg.senderId, msg.id, warnKey)}
                              >
                                Issue warning
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      {warnings.length > 0 && (
        <Card className="p-5">
          <h2 className="font-display font-semibold text-on-surface mb-3 flex items-center gap-2">
            <ShieldAlert size={16} className="text-error" /> Recent warnings
          </h2>
          <div className="flex flex-col gap-2">
            {warnings.map((w) => {
              const user = allParticipants.get(w.user_id);
              return (
                <div key={w.id} className="text-sm text-on-surface-variant flex items-center justify-between gap-3 border-b border-outline-variant/10 pb-2 last:border-0">
                  <span>
                    <span className="font-medium text-on-surface">{user?.name ?? "Unknown user"}</span> — {w.reason}
                  </span>
                  <span className="text-[11px] shrink-0">{formatTime(w.created_at)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}