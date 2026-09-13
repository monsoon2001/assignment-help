import type { Metadata } from "next";
import { requireAdmin, adminClient } from "@/lib/admin";
import ChatMonitor from "@/app/admin/components/chat-monitor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chat Monitor | PeerCraft Admin",
};

type Participant = { id: string; name: string | null; role: string | null };
type FlagRow = { id: string; message_id: string; reason: string; status: string; created_at: string };
type MessageRow = { id: string; body: string | null; sender_id: string; sender?: Participant; created_at: string; flags: FlagRow[] };

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return value ? [value as T] : [];
}

function toParticipant(value: unknown): Participant[] {
  return asArray<Participant>(value);
}

function toMessages(value: unknown): MessageRow[] {
  return asArray<MessageRow>(value).map((m) => ({
    ...m,
    flags: asArray<FlagRow>(m.flags),
    sender: m.sender ? toParticipantRaw(m.sender)[0] : undefined,
  }));
}

function toParticipantRaw(value: unknown): Participant[] {
  if (Array.isArray(value)) return value as Participant[];
  return value ? [value as Participant] : [];
}

export default async function AdminChatMonitorPage() {
  await requireAdmin();

  // Request-scoped threads
  const { data: requestThreads } = await adminClient
    .from("requests")
    .select(
      "id, title, created_at, student:users!requests_student_id_fkey(id, name, role), helper:users!requests_helper_id_fkey(id, name, role), messages:messages(id, body, sender_id, sender:users(id, name, role), created_at, flags:chat_flags(id, message_id, reason, status, created_at))"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  // Order-scoped threads
  const { data: orderThreads } = await adminClient
    .from("orders")
    .select(
      "id, created_at, status, student:users!orders_student_id_fkey(id, name, role), helper:users!orders_helper_id_fkey(id, name, role), messages:messages(id, body, sender_id, sender:users(id, name, role), created_at, flags:chat_flags(id, message_id, reason, status, created_at))"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const threads = [
    ...(requestThreads ?? []).map((t) => ({
      id: t.id,
      kind: "request" as const,
      title: t.title ?? "Untitled Request",
      createdAt: t.created_at as string,
      participants: [...toParticipant(t.student), ...toParticipant(t.helper)],
      messages: toMessages(t.messages),
    })),
    ...(orderThreads ?? []).map((t) => ({
      id: t.id,
      kind: "order" as const,
      title: `Order #${t.id.slice(0, 8).toUpperCase()}`,
      createdAt: t.created_at as string,
      status: t.status as string,
      participants: [...toParticipant(t.student), ...toParticipant(t.helper)],
      messages: toMessages(t.messages),
    })),
  ]
    .filter((t) => t.messages.length > 0)
    .map((t) => {
      const sorted = [...t.messages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const last = sorted[0];
      return {
        ...t,
        messages: sorted,
        lastMessage: last
          ? { body: last.body, senderName: last.sender?.name ?? null, createdAt: last.created_at }
          : null,
      };
    })
    .sort((a, b) => {
      const pa = new Date(a.messages[0]?.created_at ?? a.createdAt).getTime();
      const pb = new Date(b.messages[0]?.created_at ?? b.createdAt).getTime();
      return pb - pa;
    });

  const { data: warnings } = await adminClient
    .from("user_warnings")
    .select("id, user_id, message_id, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const pendingFlags = threads.flatMap((t) =>
    t.messages.flatMap((m) => m.flags.filter((f) => f.status === "pending"))
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Chat Monitor</h1>
          <p className="text-on-surface-variant mt-1">
            Review student–helper conversations. Messages that mention phone numbers,
            WhatsApp or other off-platform contact are flagged automatically.
          </p>
        </div>
        {pendingFlags > 0 && (
          <span className="px-3 py-1.5 rounded-full bg-error/10 text-error text-xs font-semibold shrink-0">
            {pendingFlags} pending flag{pendingFlags !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <ChatMonitor
        threads={threads as unknown as Parameters<typeof ChatMonitor>[0]["threads"]}
        warnings={(warnings ?? []) as unknown as Parameters<typeof ChatMonitor>[0]["warnings"]}
      />
    </div>
  );
}