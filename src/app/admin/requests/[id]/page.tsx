import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { FileText, ArrowLeft } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency } from "@/lib/currency";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request Detail | PeerCraft Admin",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const { data: request } = await adminClient
    .from("requests")
    .select("id, title, description, subject, deadline, status, file_urls, created_at, student:users!requests_student_id_fkey(id, name, email), proposals:proposals(id, price, currency, description, revisions_included, status, created_at, helper:users(id, name))")
    .eq("id", id)
    .maybeSingle();

  if (!request) notFound();

  const student = unwrapRow<{ id: string; name: string | null; email: string | null }>(request.student);
  const proposals = (request.proposals as unknown as ProposalRow[]) ?? [];

  type ProposalRow = {
    id: string;
    price: number;
    currency?: string | null;
    description: string | null;
    revisions_included: number;
    status: string;
    created_at: string;
    helper: unknown;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/admin/requests" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-3">
          <ArrowLeft size={14} /> Back to requests
        </Link>
        <h1 className="font-display text-2xl font-bold text-on-surface">{request.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="outline">{request.subject ?? "General"}</Badge>
          <Badge variant="primary">{request.status.replaceAll("_", " ")}</Badge>
          <span className="text-sm text-on-surface-variant">Posted {formatDate(request.created_at)}</span>
          {request.deadline && <span className="text-sm text-on-surface-variant">· Deadline {formatDate(request.deadline)}</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h2 className="font-display text-lg font-semibold text-on-surface mb-3">Description</h2>
          <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
            {request.description || "No description provided."}
          </p>

          {(request.file_urls as string[] | undefined)?.length ? (
            <>
              <h3 className="font-medium text-on-surface mt-6 mb-2">Attachments</h3>
              <ul className="space-y-1.5">
                {(request.file_urls as string[]).map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>

        <Card className="p-6 h-fit">
          <h2 className="font-display text-lg font-semibold text-on-surface mb-4">Student</h2>
          <div className="flex items-center gap-3">
            <Avatar name={student?.name ?? "Student"} size="md" />
            <div>
              <p className="text-sm font-medium text-on-surface">{student?.name ?? "Unnamed"}</p>
              <p className="text-xs text-on-surface-variant">{student?.email}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-outline-variant/30">
          <h2 className="font-display text-lg font-semibold text-on-surface">
            Proposals ({proposals.length})
          </h2>
        </div>

        {proposals.length > 0 ? (
          <div className="divide-y divide-outline-variant/20">
            {proposals.map((raw) => {
              const { helper: helperRaw, ...proposal } = raw;
              const helper = unwrapRow<{ name: string | null }>(helperRaw);
              return (
              <div key={proposal.id} className="p-6 flex flex-col sm:flex-row sm:items-start gap-4">
                <Avatar name={helper?.name ?? "Helper"} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-on-surface">{helper?.name ?? "Helper"}</p>
                    <Badge variant="outline">{proposal.status}</Badge>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">{proposal.description || "No description."}</p>
                  <p className="text-xs text-on-surface-variant mt-2">
                    {proposal.revisions_included > 0 ? `${proposal.revisions_included} revision(s) included` : "No revisions included"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-on-surface">{formatCurrency(Number(proposal.price), normalizeCurrency(proposal.currency))}</p>
                  <p className="text-xs text-on-surface-variant">{formatDate(proposal.created_at)}</p>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={<FileText size={22} className="text-primary" />}
              title="No proposals yet"
              message="Helpers have not proposed on this request yet."
            />
          </div>
        )}
      </Card>
    </div>
  );
}