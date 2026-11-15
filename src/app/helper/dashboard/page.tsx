import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import {
  Briefcase,
  DollarSign,
  Clock,
  ArrowUpRight,
  FileText,
  Inbox,
  Sparkles,
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/ui/button";
import { EmptyState, PanelEmpty } from "@/components/ui/states";
import { createClient } from "@/lib/supabase/server";
import { unwrapRow } from "@/lib/embedded";
import { formatCurrency, normalizeCurrency } from "@/lib/currency";
import { orderStatusMeta } from "@/lib/status-meta";

export const dynamic = "force-dynamic";

function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function respondWithinLabel(createdAt: string): { label: string; overdue: boolean } {
  const windowMs = 2 * 60 * 60 * 1000; // 2 hours
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const remaining = windowMs - elapsed;
  if (remaining <= 0) return { label: "Overdue", overdue: true };
  const mins = Math.floor(remaining / 60000);
  if (mins < 60) return { label: `Respond within ${mins}m`, overdue: false };
  const hrs = Math.floor(mins / 60);
  return { label: `Respond within ${hrs}h`, overdue: false };
}

function deadlineLabel(value: string | null): string {
  if (!value) return "Flexible";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function HelperDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [
    { data: orderRows },
    { data: reqRows },
    { data: notifRows },
    { data: payRows },
    { data: proposalRows },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, status, price, currency, deadline, created_at, student:users!orders_student_id_fkey(id, name), proposal:proposals(request:requests(title))",
      )
      .eq("helper_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("requests")
      .select(
        "id, title, subject, status, deadline, created_at, student:users!requests_student_id_fkey(id, name)",
      )
      .eq("helper_id", user.id)
      .in("status", ["requested", "proposal_sent"]),
    supabase
      .from("notifications")
      .select("id, type, message, link, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("helper_payouts").select("amount_sent_cad, paid_at"),
    supabase
      .from("proposals")
      .select("id, request_id")
      .eq("helper_id", user.id),
  ]);

  const orders = (orderRows ?? []).map((o) => ({
    ...o,
    student: unwrapRow<{ id: string; name: string | null }>(o.student),
    makeTitle: unwrapRow<{ request: unknown }>(o.proposal)?.request
      ? String(
          unwrapRow<{ request: { title: string | null } | null }>(o.proposal)?.request?.title ??
            "Untitled Order",
        )
      : "Untitled Order",
  }));

  const activeOrders = orders.filter((o) => o.status !== "completed");
  const awaitingReview = orders.filter((o) => o.status === "delivered").length;

  // Requests that need a quote: status "requested" and no proposal sent yet from this helper
  const proposedRequestIds = new Set((proposalRows ?? []).map((p) => p.request_id));

  type RawIncomingReq = {
    id: string;
    title: string;
    subject: string | null;
    status: string;
    deadline: string | null;
    created_at: string;
    student: { id: string; name: string | null }[] | null;
  };

  const allIncoming = (reqRows ?? []) as unknown as RawIncomingReq[];
  const incoming = allIncoming;

  // Action required = status "requested" and no existing proposal from this helper
  const actionRequired = allIncoming
    .filter((r) => r.status === "requested" && !proposedRequestIds.has(r.id))
    .map((r) => ({
      ...r,
      student: (Array.isArray(r.student) ? (r.student[0] ?? null) : r.student) as {
        id: string;
        name: string | null;
      } | null,
    }));

  const monthPaid = (payRows ?? []).filter(
    (p) => new Date(p.paid_at).getTime() >= new Date(monthStart).getTime(),
  );
  const earningsThisMonth = formatCurrency(
    monthPaid.reduce((sum, p) => sum + Number(p.amount_sent_cad), 0),
  );

  const firstName = (user.user_metadata?.name ?? user.email ?? "helper")
    .toString()
    .trim()
    .split(/\s+/)[0];

  const notifications = (notifRows ?? []) as {
    id: string;
    message: string;
    link: string | null;
    read: boolean;
    created_at: string;
  }[];

  const stats = [
    {
      label: "Active Projects",
      value: String(activeOrders.length),
      icon: Briefcase,
      href: "/helper/orders",
      color: "bg-primary-container text-on-primary",
    },
    {
      label: "This Month",
      value: earningsThisMonth,
      icon: DollarSign,
      href: "/helper/earnings",
      color: "bg-success-tint text-success",
      small: true,
    },
    {
      label: "Awaiting Review",
      value: String(awaitingReview),
      icon: Clock,
      href: "/helper/orders",
      color: "bg-accent-tint text-on-accent-tint",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting + primary action */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
            Hi, {firstName}
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base mt-1">
            {actionRequired.length > 0
              ? `You have ${actionRequired.length} request${actionRequired.length === 1 ? "" : "s"} waiting for a quote.`
              : incoming.length > 0
                ? `You have ${incoming.length} incoming request${incoming.length === 1 ? "" : "s"} waiting for a proposal.`
                : "Here's what needs your attention today."}
          </p>
        </div>
        <Link href="/helper/requests">
          <Button>
            <Inbox size={16} />
            Review Incoming Requests
          </Button>
        </Link>
      </div>

      {/* Action Required */}
      {actionRequired.length > 0 && (
        <section className="flex flex-col gap-4" aria-label="Action required">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-on-surface">
              Action Required
            </h2>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold">
              {actionRequired.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionRequired.map((req) => {
              const countdown = respondWithinLabel(req.created_at);
              const studentFirstName = req.student?.name?.split(/\s+/)[0] ?? "Student";
              return (
                <Card key={req.id} className="p-5 transition-shadow hover:shadow-lg" hover>
                  <Link href={`/helper/requests/${req.id}`} className="block">
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent-tint text-on-accent-tint">
                        <AlertCircle size={18} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-on-surface truncate">{req.title}</p>
                        <p className="text-sm text-on-surface-variant mt-0.5 truncate">
                          From {studentFirstName}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-1.5">
                      {req.subject && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <BookOpen size={12} />
                          {req.subject}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Calendar size={12} />
                        Due {deadlineLabel(req.deadline)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          countdown.overdue
                            ? "bg-error/10 text-error"
                            : "bg-accent-tint text-on-accent-tint"
                        }`}
                      >
                        {countdown.label}
                      </span>
                      <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                        View &amp; quote <ChevronRight size={14} />
                      </span>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* At a glance */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-4" aria-label="At a glance">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="group">
              <Card className="h-full p-3 sm:p-5 transition-shadow group-hover:shadow-md" hover>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 order-2 sm:order-1">
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-tight">
                      {stat.label}
                    </p>
                    <p
                      className={`${stat.small ? "text-sm sm:text-lg" : "text-lg sm:text-2xl"} font-bold text-on-surface mt-0.5 sm:mt-1 truncate`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 order-1 sm:order-2 ${stat.color}`}
                  >
                    <Icon size={16} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Active projects */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-on-surface">Active Projects</h2>
            <Link
              href="/helper/orders"
              className="text-sm text-primary font-medium min-h-11 -my-2 inline-flex items-center gap-1 hover:underline"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {activeOrders.length === 0 && (
            <EmptyState
              icon={<Briefcase size={24} className="text-primary" />}
              title="No active orders yet"
              message="Accepted proposals move here as orders. Send a few proposals to line up your next project."
              actionHref="/helper/requests"
              actionLabel="Check incoming requests"
            />
          )}
          <div className="space-y-4">
            {activeOrders.map((order) => {
              const meta = orderStatusMeta(order.status);
              return (
                <Card key={order.id} className="p-5" hover>
                  <Link
                    href={`/helper/orders/${order.id}`}
                    className="min-h-11 -my-2 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-on-surface truncate">
                          {order.makeTitle}
                        </h3>
                        <StatusBadge tone={meta.tone} dot>
                          {meta.label}
                        </StatusBadge>
                      </div>
                      <p className="text-sm text-on-surface-variant">
                        Student: {order.student?.name ?? "Student"}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm text-on-surface-variant">
                          {order.deadline
                            ? `Due ${new Date(order.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : "Deadline flexible"}
                        </span>
                        <span className="text-sm font-semibold text-on-surface">
                          {formatCurrency(Number(order.price), normalizeCurrency(order.currency))}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight size={18} className="text-on-surface-variant shrink-0 mt-1.5" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Right rail: incoming + activity */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-display text-lg font-semibold text-on-surface">
                Incoming Requests
              </h2>
              <Link
                href="/helper/requests"
                className="text-sm text-primary font-medium min-h-11 -my-2 inline-flex items-center gap-1 hover:underline"
              >
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <Card className="overflow-hidden">
              {incoming.length === 0 && (
                <PanelEmpty
                  icon={<Inbox size={18} className="text-primary" />}
                  title="No new requests right now"
                  message="Assigned requests appear here as soon as a student picks you."
                  actionHref="/helper/profile"
                  actionLabel="Complete your profile"
                />
              )}
              {incoming.length > 0 && (
                <div className="flex flex-col divide-y divide-outline-variant/30 px-4">
                  {incoming.map((r) => (
                    <Link
                      key={r.id}
                      href={`/helper/requests/${r.id}`}
                      className="py-3 flex items-center gap-3 group min-h-11"
                    >
                      <FileText size={15} className="text-primary shrink-0" />
                      <span className="text-sm font-medium text-on-surface truncate group-hover:underline">
                        {r.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-display text-lg font-semibold text-on-surface">
                Recent Activity
              </h2>
              <Link
                href="/helper/notifications"
                className="text-sm text-primary font-medium min-h-11 -my-2 inline-flex items-center gap-1 hover:underline"
              >
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <Card className="divide-y divide-outline-variant/30 overflow-hidden">
              {notifications.length === 0 && (
                <PanelEmpty
                  icon={<Sparkles size={18} className="text-primary" />}
                  title="No activity yet"
                  message="Payment, order and chat updates for your requests will show up here."
                  actionHref="/helper/notifications"
                  actionLabel="View notifications"
                />
              )}
              {notifications.map((n) => (
                <Link
                  href={n.link ?? "/helper/notifications"}
                  key={n.id}
                  className="p-4 flex items-start gap-3 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm line-clamp-2 ${n.read ? "text-on-surface-variant" : "font-medium text-on-surface"}`}
                    >
                      {n.message}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5" />
                  )}
                </Link>
              ))}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
