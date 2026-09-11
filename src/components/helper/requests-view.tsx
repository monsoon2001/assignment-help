"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import { BookOpen, Calendar, CheckCircle2, MessageSquare } from "lucide-react";

type HelperRequest = {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
  student: { id: string; name: string | null } | null;
};

type FilterTab = "all" | "new" | "proposals";

const tabs: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Waiting on Me", value: "new" },
  { label: "Proposal Sent", value: "proposals" },
];

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.max(1, Math.round(diff / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function deadlineLabel(value: string | null): string {
  if (!value) return "Flexible";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function HelperRequestsView({
  requests,
  proposedIds,
}: {
  requests: HelperRequest[];
  proposedIds: Set<string>;
}) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const rows = requests.filter((r) => {
    if (activeTab === "new") return r.status === "requested";
    if (activeTab === "proposals") return proposedIds.has(r.id);
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Incoming Requests
        </h1>
        <p className="text-on-surface-variant mt-1">
          These requests were sent directly to you. Respond in the chat to lock in the work.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.value
                ? "bg-primary-container text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-on-surface-variant">
        <p>
          Showing {rows.length} request{rows.length !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

      {rows.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-on-surface-variant">
            No assigned requests right now. You&apos;ll see requests here when a student picks you.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {rows.map((req) => {
          const alreadyProposed = proposedIds.has(req.id);
          return (
            <Card key={req.id} className="p-6" hover>
              <div className="flex items-start gap-4">
                <Avatar name={req.student?.name || "Student"} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-on-surface">
                          {req.title}
                        </h3>
                        <Badge variant={alreadyProposed ? "success" : "warning"} dot>
                          {alreadyProposed ? "Proposal Sent" : "New Request"}
                        </Badge>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        Sent by {req.student?.name || "Student"} &middot; {timeAgo(req.created_at)}
                      </p>
                    </div>
                  </div>
                  {req.description && (
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">
                      {req.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {req.subject && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
                        <BookOpen size={14} />
                        {req.subject}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
                      <Calendar size={14} />
                      Deadline: {deadlineLabel(req.deadline)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <Link href={`/helper/requests/${req.id}`}>
                      <Button size="sm">
                        <MessageSquare size={15} />
                        {alreadyProposed ? "Open Chat" : "Open Chat & Respond"}
                      </Button>
                    </Link>
                    {alreadyProposed && (
                      <span className="text-xs text-on-surface-variant inline-flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Proposal sent — waiting on the student
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}