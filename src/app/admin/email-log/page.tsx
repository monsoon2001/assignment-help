import type { Metadata } from "next";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import { requireAdmin, adminClient } from "@/lib/admin";
import { EmptyState } from "@/components/ui/states";
import ResendEmailButton from "@/app/admin/components/resend-email-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Email log | Acadivo Admin",
};

const toneByStatus: Record<string, "green" | "amber" | "red"> = {
  sent: "green",
  pending: "amber",
  failed: "red",
};

export default async function AdminEmailLogPage() {
  await requireAdmin();

  const { data: rows, error } = await adminClient
    .from("email_outbox")
    .select("id, event_type, to_email, subject, status, attempts, last_error, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">Email log</h1>
        <p className="text-on-surface-variant mt-1">
          Recent transactional emails and their delivery status.
        </p>
      </div>

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : rows && rows.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Event", "Recipient", "Subject", "Status", "Created", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-outline-variant/20 last:border-0">
                  <td className="px-4 py-3 text-sm text-on-surface">{row.event_type}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{row.to_email}</td>
                  <td className="px-4 py-3 text-sm text-on-surface">{row.subject}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={toneByStatus[row.status] ?? "amber"}>{row.status}</StatusBadge>
                    {row.last_error ? (
                      <p className="mt-1 text-xs text-error max-w-xs truncate">{row.last_error}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">
                    {new Date(row.created_at).toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.status === "failed" ? <ResendEmailButton id={row.id} /> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="No emails yet" message="Transactional emails will appear here." />
      )}
    </div>
  );
}