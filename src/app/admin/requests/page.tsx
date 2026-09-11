import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { FileText, Eye } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { unwrapRow } from "@/lib/embedded";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Requests | PeerCraft Admin",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_VARIANT: Record<string, "primary" | "warning" | "success" | "danger" | "outline"> = {
  requested: "primary",
  proposal_sent: "warning",
  accepted: "success",
  declined: "danger",
  cancelled: "outline",
};

export default async function AdminRequestsPage() {
  await requireAdmin();

  const { data: requests, error } = await adminClient
    .from("requests")
    .select("id, title, subject, description, deadline, status, created_at, student:users(id, name), proposals:proposals(id, price, status, helper:users(id, name))")
    .order("created_at", { ascending: false })
    .limit(200);

  const statusCounts = (requests ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">Requests</h1>
        <p className="text-on-surface-variant mt-1">Review all help requests across the platform.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Badge key={status} variant={STATUS_VARIANT[status] ?? "outline"}>
            {status.replaceAll("_", " ")} · {count}
          </Badge>
        ))}
      </div>

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : requests && requests.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Request</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Proposals</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Deadline</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const student = unwrapRow<{ id: string; name: string | null }>(request.student);
                const proposalRows = (request.proposals as unknown as unknown[] | null) ?? [];
                return (
                  <tr key={request.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm font-medium text-on-surface truncate">{request.title}</p>
                      {request.subject && <p className="text-xs text-on-surface-variant mt-0.5">{request.subject}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={student?.name ?? "Student"} size="sm" />
                        <span className="text-sm text-on-surface">{student?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {proposalRows.length}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_VARIANT[request.status] ?? "outline"}>
                        {request.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{formatDate(request.deadline)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/requests/${request.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState
          icon={<FileText size={24} className="text-primary" />}
          title="No requests yet"
          message="Help requests will appear here as students post them."
        />
      )}
    </div>
  );
}