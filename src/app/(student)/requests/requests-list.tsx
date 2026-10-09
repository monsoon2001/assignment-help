"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  FileText,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  Paperclip,
  Users,
  X,
} from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { requestStatusVariant } from "@/lib/status-meta";
import type { RequestProposal } from "@/components/requests/proposal-card";

export type StudentRequestRow = {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  deadline: string | null;
  file_urls: string[] | null;
  status: string;
  created_at: string;
  sent_at: string | null;
  helper: { id: string; name: string | null } | null;
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  proposal_sent: "Reviewing Proposals",
  accepted: "Hired",
  declined: "Declined",
  cancelled: "Cancelled",
};

const TABS = [
  { key: "all", label: "All Requests" },
  { key: "in_progress", label: "In Progress" },
  { key: "delivered", label: "Delivered & Review" },
  { key: "completed", label: "Completed" },
] as const;

const SORTS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "due", label: "Due soonest" },
] as const;

const PAGE_SIZE = 5;

function refCode(id: string) {
  return `#PC-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

function formatDate(value: string | null): string {
  if (!value) return "Flexible";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RequestsList({
  requests,
  proposalsByRequest,
  orderStatusByRequest,
  counts,
}: {
  requests: StudentRequestRow[];
  proposalsByRequest: Record<string, RequestProposal[]>;
  orderStatusByRequest: Record<string, string>;
  counts: { all: number; in_progress: number; delivered: number; completed: number };
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("newest");
  const [openMenu, setOpenMenu] = useState<"subject" | "sort" | null>(null);
  const [page, setPage] = useState(1);

  const subjects = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of requests) {
      const name = r.subject?.trim();
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [requests]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = requests.filter((r) => {
      if (subject && r.subject?.trim() !== subject) return false;
      if (!needle) return true;
      return (
        r.title.toLowerCase().includes(needle) ||
        (r.subject ?? "").toLowerCase().includes(needle) ||
        r.id.toLowerCase().includes(needle) ||
        refCode(r.id).toLowerCase().includes(needle)
      );
    });

    const byTab = matches.filter((r) => {
      if (tab === "all") return true;
      if (tab === "in_progress") return ["requested", "proposal_sent", "accepted"].includes(r.status);
      if (tab === "delivered") return orderStatusByRequest[r.id] === "delivered";
      return (
        orderStatusByRequest[r.id] === "completed" ||
        ["declined", "cancelled"].includes(r.status)
      );
    });

    return byTab.sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "due") {
        const aDue = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
        const bDue = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
        return aDue - bDue;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [requests, query, subject, sort, tab, orderStatusByRequest]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const firstShown = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(safePage * PAGE_SIZE, filtered.length);

  const applyFilter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
    setOpenMenu(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const activeTab = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => applyFilter(setTab)(t.key)}
              aria-pressed={activeTab}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-2 min-h-11 ${
                activeTab
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {t.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTab ? "bg-white/25 text-on-primary" : "bg-surface-container-high text-on-surface"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 py-2.5 max-w-md">
          <Search size={16} className="text-on-surface-variant shrink-0" />
          <input
            value={query}
            onChange={(e) => applyFilter(setQuery)(e.target.value)}
            placeholder="Search by title, subject, or request ID..."
            className="bg-transparent outline-none flex-1 text-sm text-on-surface placeholder:text-outline"
          />
          {query && (
            <button
              onClick={() => applyFilter(setQuery)("")}
              aria-label="Clear search"
              className="text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "subject" ? null : "subject")}
              aria-expanded={openMenu === "subject"}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                subject
                  ? "bg-primary-container text-on-primary"
                  : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <SlidersHorizontal size={15} />
              {subject || "Subject"}
            </button>
            {openMenu === "subject" && (
              <>
                <button
                  aria-label="Close subject filter"
                  onClick={() => setOpenMenu(null)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div className="absolute right-0 z-20 mt-2 w-60 max-h-72 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-xl">
                  <button
                    onClick={() => applyFilter(setSubject)("")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      subject === ""
                        ? "bg-primary-container text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    All subjects
                  </button>
                  {subjects.length === 0 && (
                    <p className="px-3 py-2 text-xs text-on-surface-variant">No subjects yet.</p>
                  )}
                  {subjects.map(([name, count]) => (
                    <button
                      key={name}
                      onClick={() => applyFilter(setSubject)(name)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        subject === name
                          ? "bg-primary-container text-on-primary"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      }`}
                    >
                      <span className="truncate">{name}</span>
                      <span className="text-xs opacity-70">{count}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}
              aria-expanded={openMenu === "sort"}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low cursor-pointer transition-colors"
            >
              <Clock size={15} />
              {SORTS.find((s) => s.key === sort)?.label}
            </button>
            {openMenu === "sort" && (
              <>
                <button
                  aria-label="Close sort options"
                  onClick={() => setOpenMenu(null)}
                  className="fixed inset-0 z-10 cursor-default"
                />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-xl">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => applyFilter(setSort)(s.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                        sort === s.key
                          ? "bg-primary-container text-on-primary"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {(subject || query) && (
        <p className="text-xs text-on-surface-variant">
          Showing {filtered.length} of {requests.length} request{requests.length !== 1 ? "s" : ""}
          {subject ? ` for ${subject}` : ""}
          {query ? ` matching “${query}”` : ""}.
        </p>
      )}

      {requests.length === 0 && (
        <div className="flex flex-col items-center gap-3 p-10 rounded-xl bg-surface-container-low border border-outline-variant text-center">
          <span className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center">
            <FileText size={26} className="text-primary" />
          </span>
          <div>
            <h3 className="font-semibold text-on-surface">No requests yet</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Submit your first help request and choose the helper right for you.
            </p>
          </div>
          <Link href="/requests/new">
            <Button>
              Create Your First Request <FileText size={15} />
            </Button>
          </Link>
        </div>
      )}

      {requests.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 p-10 rounded-xl bg-surface-container-low border border-outline-variant text-center">
          <span className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center">
            <Search size={26} className="text-primary" />
          </span>
          <div>
            <h3 className="font-semibold text-on-surface">No matching requests</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Try a different tab, subject, or search term.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setTab("all");
              setSubject("");
              setQuery("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {pageItems.length > 0 && (
        <section className="flex flex-col gap-3">
          {pageItems.map((r) => {
            const meta = { label: STATUS_LABEL[r.status] ?? r.status, variant: requestStatusVariant(r.status) };
            const proposals = proposalsByRequest[r.id] ?? [];
            return (
              <Link key={r.id} href={`/requests/${r.id}`} className="block">
                <Card hover className="p-5">
                  <div className="flex items-center gap-4">
                    <Avatar name={r.subject || r.title} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-display font-semibold text-on-surface truncate">{r.title}</h3>
                        <Badge variant={meta.variant} dot>
                          {meta.label}
                        </Badge>
                        {proposals.length > 0 && (
                          <Badge variant="outline">
                            {proposals.length} proposal{proposals.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 truncate">
                        {refCode(r.id)} · {r.subject || "General"} · Requested {formatDate(r.created_at)}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-on-surface-variant">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={11} /> Due {formatDate(r.deadline)}
                        </span>
                        {(r.file_urls?.length ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Paperclip size={11} /> {r.file_urls!.length} attachment{r.file_urls!.length > 1 ? "s" : ""}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Users size={11} /> {r.helper?.name ?? "No helper yet"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-on-surface-variant" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </section>
      )}

      {requests.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-on-surface-variant">
            Showing {firstShown}–{lastShown} of {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="w-9 h-9 rounded-lg text-sm font-medium bg-primary-container text-on-primary flex items-center justify-center">
              {safePage}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}