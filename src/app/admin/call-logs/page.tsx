import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { PhoneCall, PhoneMissed, Clock } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { RefreshButton } from "@/app/admin/components/call-logs-refresh";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Call Logs | PeerCraft Admin",
};

type CallLog = {
  id: string;
  caller_id: string;
  callee_id: string;
  direction: string;
  status: string;
  started_at: string;
  answered_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  caller_name?: string;
  callee_name?: string;
};

const STATUS_META: Record<string, { label: string; variant: "danger" | "success" | "warning" | "secondary" | "primary" }> = {
  answered: { label: "Answered", variant: "success" },
  missed: { label: "Missed", variant: "danger" },
  declined: { label: "Declined", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  busy: { label: "Busy", variant: "warning" },
  failed: { label: "Failed", variant: "danger" },
  ringing: { label: "Ringing", variant: "primary" },
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function fmtDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

export default async function AdminCallLogsPage() {
  await requireAdmin();

  const { data: logs, error } = await adminClient
    .from("call_logs")
    .select("id, caller_id, callee_id, direction, status, started_at, answered_at, ended_at, duration_seconds")
    .order("started_at", { ascending: false })
    .limit(300);

  const list = (logs ?? []) as CallLog[];

  if (!error && list.length > 0) {
    const ids = Array.from(new Set(list.flatMap((l) => [l.caller_id, l.callee_id])));
    const { data: users } = await adminClient
      .from("users")
      .select("id, name, avatar_url")
      .in("id", ids);
    const nameMap = new Map((users ?? []).map((u) => [u.id, u as { id: string; name: string | null; avatar_url: string | null }]));
    for (const log of list) {
      log.caller_name = nameMap.get(log.caller_id)?.name ?? "Unknown";
      log.callee_name = nameMap.get(log.callee_id)?.name ?? "Unknown";
    }
  }

  const answered = list.filter((l) => l.status === "answered");
  const missed = list.filter((l) => l.status === "missed");
  const totalSeconds = answered.reduce((s, l) => s + (l.duration_seconds || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Call Logs</h1>
          <p className="text-on-surface-variant mt-1">Every voice call with helpers — answers, misses, and talk time.</p>
        </div>
        <RefreshButton />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-2xl bg-success-container/30 flex items-center justify-center">
            <PhoneCall size={20} className="text-success" />
          </span>
          <div>
            <p className="text-2xl font-bold text-on-surface">{answered.length}</p>
            <p className="text-xs text-on-surface-variant">Answered calls</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-2xl bg-error-container/30 flex items-center justify-center">
            <PhoneMissed size={20} className="text-error" />
          </span>
          <div>
            <p className="text-2xl font-bold text-on-surface">{missed.length}</p>
            <p className="text-xs text-on-surface-variant">Missed calls</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <span className="w-11 h-11 rounded-2xl bg-primary-container/30 flex items-center justify-center">
            <Clock size={20} className="text-primary" />
          </span>
          <div>
            <p className="text-2xl font-bold text-on-surface">
              {Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s
            </p>
            <p className="text-xs text-on-surface-variant">Total talk time</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {list.length === 0 ? (
          <p className="p-8 text-sm text-on-surface-variant text-center">
            No calls logged yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-on-surface-variant border-b border-outline-variant/30">
                  <th className="px-5 py-3 font-medium">Call</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {list.map((log) => {
                  const meta = STATUS_META[log.status] ?? { label: log.status, variant: "secondary" as const };
                  const outgoing = log.direction === "outgoing";
                  return (
                    <tr key={log.id} className="hover:bg-surface-container-low/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={outgoing ? log.callee_name ?? "?" : log.caller_name ?? "?"}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-on-surface">
                              {outgoing ? log.callee_name : log.caller_name}
                            </p>
                            <p className="text-[11px] text-on-surface-variant">
                              {outgoing ? "Admin called helper" : "Helper called admin"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-on-surface">
                        {log.status === "answered" ? fmtDuration(log.duration_seconds) : "—"}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant whitespace-nowrap">
                        {fmtTime(log.started_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}