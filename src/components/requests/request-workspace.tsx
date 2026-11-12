"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldCheck,
  Timer,
  UserRound,
} from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import Avatar from "@/components/ui/avatar";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import ChatPanel, { type ChatMessageRow, fileNameFromUrl } from "@/components/chat/chat-panel";
import SecureFileLink from "@/components/ui/secure-file-link";
import ProposalCard, { type RequestProposal } from "@/components/requests/proposal-card";
import ProposalActivity from "@/components/requests/proposal-activity";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";
import { fetchRequestMessages, sendRequestMessage } from "@/lib/request-chat";
import { submitProposal } from "@/lib/proposals";
import { DEFAULT_CURRENCY } from "@/lib/currency";
import {
  markThreadNotificationsRead,
  markRequestNotificationsRead,
} from "@/lib/notifications";
import { ACADIVO_HELPER_NAME } from "@/lib/avatars";
import { requestStatusTone } from "@/lib/status-meta";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";

const RESPONSE_WINDOW_MS = 2 * 60 * 60 * 1000;

function isPastResponseWindow(sentAt: string | null): boolean {
  return !!sentAt && Date.now() - new Date(sentAt).getTime() > RESPONSE_WINDOW_MS;
}

type RequestData = {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  deadline: string | null;
  status: string;
  file_urls: string[];
  created_at: string;
  sent_at: string | null;
  student_id: string;
  helper: { id: string; name: string | null } | null;
  student: { id: string; name: string | null } | null;
};

const STATUS_LABEL: Record<string, string> = {
  requested: "Awaiting Response",
  proposal_sent: "Proposal Received",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
};

export default function RequestWorkspace({
  requestId,
  mode,
  localCurrency = DEFAULT_CURRENCY,
}: {
  requestId: string;
  mode: "student" | "helper";
  localCurrency?: string;
}) {
  const supabase = useRef(createClient());

  const [request, setRequest] = useState<RequestData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [proposal, setProposal] = useState<RequestProposal | null>(null);
  const [proposalHistory, setProposalHistory] = useState<RequestProposal[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderPaid, setOrderPaid] = useState(false);
  const [orderChargeAmount, setOrderChargeAmount] = useState<number | undefined>(undefined);
  const [orderChargeCurrency, setOrderChargeCurrency] = useState<string | undefined>(undefined);

  const [draft, setDraft] = useState("");
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [bidPrice, setBidPrice] = useState("");
  const [bidDescription, setBidDescription] = useState("");
  const [bidRevisions, setBidRevisions] = useState("1");
  const [sendingBid, setSendingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidNotice, setBidNotice] = useState<string | null>(null);

  const [view, setView] = useState<"chat" | "details">("chat");

  const bottomRef = useRef<HTMLDivElement>(null);
  const proposalAutoShown = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    markRequestNotificationsRead(requestId);
    markThreadNotificationsRead(pathname);
  }, [pathname, requestId]);

  // A student arriving from the dashboard's "Act now" card for a new proposal
  // lands on the request page expecting to review the offer, not the chat. On
  // mobile the details tab is hidden by default, so surface it once a pending
  // proposal exists (they can still switch back to chat).
  useEffect(() => {
    if (!proposalAutoShown.current && proposal && proposal.status === "pending") {
      proposalAutoShown.current = true;
      setView("details");
    }
  }, [proposal]);

  const loadRequest = useCallback(async () => {
    const { data } = await supabase.current
      .from("requests")
      .select(
        "id, title, subject, description, deadline, status, file_urls, created_at, sent_at, student_id, helper:users!requests_helper_id_fkey(id, name), student:users!requests_student_id_fkey(id, name)",
      )
      .eq("id", requestId)
      .maybeSingle();

    const row = Array.isArray(data) ? (data?.[0] ?? null) : data;
    if (!row) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setRequest({
      ...(row as Omit<RequestData, "helper" | "student">),
      helper: Array.isArray(row.helper) ? (row.helper[0] ?? null) : row.helper,
      student: Array.isArray(row.student) ? (row.student[0] ?? null) : row.student,
    });
  }, [requestId]);

  const loadMessages = useCallback(async () => {
    const rows = await fetchRequestMessages(requestId);
    if (rows) setMessages(rows);
  }, [requestId]);

  const loadProposal = useCallback(async () => {
    const { data } = await supabase.current
      .from("proposals")
      .select(
        "id, request_id, helper_id, price, currency, description, revisions_included, expires_at, status, created_at, student_note, target_price, decline_reason, revision_requested_at, replaced_by, revision_of, helper:users(id, name)",
      )
      .eq("request_id", requestId)
      .order("created_at", { ascending: false });

    const rows = (Array.isArray(data) ? data : []) as unknown as Array<
      Omit<RequestProposal, "helper"> & {
        helper: { id: string; name: string | null } | { id: string; name: string | null }[] | null;
      }
    >;
    const normalized: RequestProposal[] = rows.map((row) => ({
      ...row,
      helper: Array.isArray(row.helper) ? (row.helper[0] ?? null) : row.helper,
    }));
    setProposalHistory(normalized);

    // The active quote is the one the student can still act on. Older rows are
    // kept as history (replaced/declined) and never overwrite it.
    const active =
      normalized.find((p) => ["pending", "revision_requested", "accepted"].includes(p.status)) ??
      null;
    setProposal(active);

    // When the student asks for a different price, start the helper's revised
    // quote form at their target (still fully editable). This runs in the async
    // loader rather than an effect so it never cascades renders.
    if (
      active?.status === "revision_requested" &&
      typeof active.target_price === "number" &&
      active.target_price > 0
    ) {
      setBidPrice((current) => current || String(Math.round(active.target_price as number)));
    }

    if (!active || active.status !== "accepted") {
      setOrderId(null);
      setOrderStatus(null);
      setOrderPaid(false);
      setOrderChargeAmount(undefined);
      setOrderChargeCurrency(undefined);
      return;
    }

    const { data: order } = await supabase.current
      .from("orders")
      .select("id, status, charge_amount, charge_currency")
      .eq("proposal_id", active.id)
      .maybeSingle();
    const currentOrder = order && !Array.isArray(order) ? order : null;
    setOrderId(currentOrder?.id ?? null);
    setOrderStatus(currentOrder?.status ?? null);
    setOrderChargeAmount(
      currentOrder?.charge_amount != null ? Number(currentOrder.charge_amount) : undefined,
    );
    setOrderChargeCurrency(currentOrder?.charge_currency ?? undefined);

    if (currentOrder?.id) {
      const { data: payment } = await supabase.current
        .from("payments")
        .select("id")
        .eq("order_id", currentOrder.id)
        .eq("status", "paid")
        .maybeSingle();
      setOrderPaid(!!payment);
    } else {
      setOrderPaid(false);
    }
  }, [requestId]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let active = true;
    const client = supabase.current;

    async function init() {
      await loadRequest();
      const {
        data: { user },
      } = await client.auth.getUser();
      setCurrentUserId(user?.id);
      await Promise.all([loadMessages(), loadProposal()]);
      setLoading(false);
      if (!active) return;

      channel = client
        .channel(realtimeTopic(`request:${requestId}`))
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `request_id=eq.${requestId}`,
          },
          async () => {
            await loadMessages();
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "requests", filter: `id=eq.${requestId}` },
          async () => {
            await loadRequest();
          },
        )
        .subscribe();
    }

    void init();

    const poll = setInterval(() => {
      if (!active) return;
      void Promise.all([loadMessages(), loadRequest(), loadProposal()]);
    }, 20000);

    return () => {
      active = false;
      clearInterval(poll);
      if (channel) void client.removeChannel(channel);
    };
  }, [requestId, loadRequest, loadMessages, loadProposal]);

  if (loading) {
    return (
      <div className="w-full" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading request…</span>
        <div className="w-full rounded-2xl border border-outline-variant p-6">
          <div className="flex flex-wrap items-center gap-4">
            <SkeletonCircle className="w-12 h-12" />
            <div className="flex-1 min-w-48 space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-3.5 w-40" />
            </div>
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-outline-variant/40 p-4">
                  <Skeleton className="h-3.5 w-28" />
                  <SkeletonText lines={2} className="mt-3" />
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-outline-variant/40 p-4">
              <Skeleton className="h-4 w-32" />
              <SkeletonText lines={4} className="mt-4" />
              <Skeleton className="mt-5 h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !request) {
    return (
      <Card className="w-full py-16 text-center">
        <p className="text-on-surface-variant">Request not found.</p>
        <Link href={mode === "helper" ? "/helper/requests" : "/requests"}>
          <Button className="mt-4" variant="outline">
            Back to requests
          </Button>
        </Link>
      </Card>
    );
  }

  const isHelper = mode === "helper";
  const meta = {
    label: STATUS_LABEL[request.status] ?? request.status,
    tone: requestStatusTone(request.status),
  };
  const otherParty = isHelper ? request.student : request.helper;
  // Students only ever see the branded helper identity — never the real
  // name/photo. Helpers still see the actual student they're working with.
  const otherPartyName = isHelper ? otherParty?.name || "Student" : ACADIVO_HELPER_NAME;
  const overdue =
    !isHelper && request.status === "requested" && isPastResponseWindow(request.sent_at);

  async function sendMessage() {
    const text = draft.trim();
    if (!text && chatFiles.length === 0) return;
    setSendingMsg(true);
    setChatError(null);
    const result = await sendRequestMessage(requestId, text, chatFiles[0] ?? null);
    setSendingMsg(false);
    if ("error" in result) {
      setChatError(result.error);
      return;
    }
    setDraft("");
    setChatFiles([]);
    markRequestNotificationsRead(requestId);
    await loadMessages();
  }

  async function handleSendBid() {
    const rawPrice = Number(bidPrice);
    if (!bidPrice || !Number.isFinite(rawPrice) || rawPrice <= 0) {
      setBidError("Enter a valid price for this request.");
      return;
    }
    const parsedPrice = Math.round(rawPrice);
    if (!Number.isSafeInteger(parsedPrice) || parsedPrice <= 0) {
      setBidError("The price must round to at least one whole unit.");
      return;
    }
    setBidPrice(String(parsedPrice));
    setSendingBid(true);
    setBidError(null);
    setBidNotice(null);
    const result = await submitProposal({
      request_id: requestId,
      price: parsedPrice,
      currency: "CAD",
      description: bidDescription.trim() || undefined,
      revisions_included: Math.max(0, Number(bidRevisions) || 0),
    });
    setSendingBid(false);
    if ("error" in result) {
      if (
        result.error.includes("A quote has already been sent.") ||
        result.error.includes("This proposal is locked and can no longer be edited.") ||
        result.error.includes("This proposal is locked because an order already exists.")
      ) {
        markRequestNotificationsRead(requestId);
        await Promise.all([loadProposal(), loadRequest()]);
        setBidNotice(
          "This proposal has already been accepted or resolved. The latest status is shown.",
        );
        return;
      }
      setBidError(result.error);
      return;
    }
    setBidPrice("");
    setBidDescription("");
    setBidRevisions("1");
    markRequestNotificationsRead(requestId);
    await loadProposal();
    await loadRequest();
  }

  const title = request.title || "Untitled Request";

  const chatLabel = isHelper ? "Chat with student" : "Chat with helper";
  const tabs = [
    { id: "chat" as const, label: chatLabel, icon: MessageSquare },
    { id: "details" as const, label: "Request details", icon: FileText },
  ];

  const contactCard = (
    <Card className="p-3 shrink-0">
      <div className="flex items-center gap-3">
        <Avatar name={otherPartyName} role={isHelper ? "student" : "helper"} size="md" online />
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-sm text-on-surface">{otherPartyName}</p>
          <p className="text-xs text-on-surface-variant truncate">
            {isHelper ? "Student who requested help" : "Expert assigned to your request"}
          </p>
        </div>
        {request.sent_at && !isHelper && (
          <span className="text-xs text-on-surface-variant shrink-0 inline-flex items-center gap-1">
            <Clock size={12} />
            {new Date(request.sent_at).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </Card>
  );

  const chatPanel = (
    <ChatPanel
      title={chatLabel}
      fill
      compact
      className="border border-outline-variant"
      filesBucket="request-files"
      messages={messages}
      draft={draft}
      setDraft={setDraft}
      files={chatFiles}
      setFiles={setChatFiles}
      sending={sendingMsg}
      error={chatError}
      onSend={sendMessage}
      bottomRef={bottomRef}
      currentUserId={currentUserId}
      counterpartName={isHelper ? undefined : ACADIVO_HELPER_NAME}
    />
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-3 h-full min-h-0">
      <nav className="flex min-w-0 items-center gap-1.5 text-sm text-on-surface-variant shrink-0">
        <Link href={isHelper ? "/helper/requests" : "/requests"} className="hover:text-on-surface">
          {isHelper ? "Incoming Requests" : "My Requests"}
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <span className="min-w-0 flex-1 text-on-surface font-medium truncate" title={title}>
          #{request.id.slice(0, 8).toUpperCase()} · {title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 lg:overflow-hidden lg:auto-rows-fr">
        <div className="lg:col-span-7 flex flex-col gap-1.5 min-h-0 lg:h-full">
          <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-1.5 lg:gap-4 p-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="min-w-0 max-w-full break-words [overflow-wrap:anywhere] font-display font-bold text-lg text-on-surface line-clamp-2">
                    {title}
                  </h1>
                  <StatusBadge tone={meta.tone} dot className="shrink-0">
                    {meta.label}
                  </StatusBadge>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                    #{request.id.slice(0, 8).toUpperCase()} · {request.subject || "General"}
                  </span>
                  <span className="text-outline-variant" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <Timer size={12} />{" "}
                    {request.deadline
                      ? `Due ${new Date(request.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                      : "Deadline flexible"}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isHelper && request.status === "proposal_sent" && (
                <StatusBadge tone="blue">
                  <ShieldCheck size={12} /> Proposal Sent
                </StatusBadge>
              )}
            </div>
          </section>

          {overdue && (
            <Card className="p-4 border-warning shrink-0">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-warning-container/20 text-warning flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </span>
                <div>
                  <p className="font-semibold text-on-surface text-sm">
                    This helper hasn&apos;t responded yet
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    It&apos;s been more than 2 hours since your request was sent. You can keep
                    chatting in the request thread or contact support if you need help.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="shrink-0 flex items-center gap-1 border-b border-outline-variant lg:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                    active
                      ? "border-primary-container text-primary"
                      : "border-transparent text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === "chat" && messages.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
                      {messages.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 lg:flex-1 lg:overflow-y-auto">
            <div
              className={`${view === "details" ? "flex" : "hidden lg:flex"} flex-col gap-1.5 lg:min-h-full`}
            >
              {!isHelper && proposal && (
                <ProposalCard
                  proposal={proposal}
                  requestTitle={title}
                  requestDeadline={request.deadline}
                  orderId={orderId}
                  orderStatus={orderStatus}
                  orderPaid={orderPaid}
                  lockedAmount={orderChargeAmount}
                  lockedCurrency={orderChargeCurrency}
                  localCurrency={localCurrency}
                  onRevisionRequested={() => {
                    void loadProposal();
                    void loadRequest();
                  }}
                  onDeclined={() => {
                    void loadProposal();
                    void loadRequest();
                  }}
                />
              )}

              <Card className="p-2.5">
                <h2 className="font-display font-semibold text-on-surface text-xs uppercase tracking-wide mb-1">
                  Request details
                </h2>
                {request.description ? (
                  <p className="break-words [overflow-wrap:anywhere] text-xs text-on-surface-variant leading-snug whitespace-pre-line">
                    {request.description}
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    No additional details were provided.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs">
                  <span className="inline-flex items-center gap-1 text-on-surface-variant">
                    <CalendarDays size={12} />{" "}
                    {request.deadline
                      ? new Date(request.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Flexible"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-on-surface-variant">
                    <UserRound size={12} /> {request.subject || "General"}
                  </span>
                </div>
                {request.file_urls.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1.5">
                    {request.file_urls.map((url, i) => (
                      <SecureFileLink
                        key={i}
                        stored={url}
                        bucket="request-files"
                        showDownload
                        label={fileNameFromUrl(url)}
                        className="flex items-center gap-2 p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
                      >
                        <span className="w-7 h-7 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                          <FileText size={13} />
                        </span>
                        <span className="min-w-0 flex-1 text-xs font-medium text-on-surface truncate">
                          {fileNameFromUrl(url)}
                        </span>
                      </SecureFileLink>
                    ))}
                  </div>
                )}
              </Card>

              {proposalHistory.length > 0 && (
                <ProposalActivity proposals={proposalHistory} />
              )}

              {isHelper && bidNotice && (
                <p
                  role="status"
                  className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface-variant"
                >
                  {bidNotice}
                </p>
              )}

              {isHelper &&
                (!proposal || proposal.status === "revision_requested") &&
                request.status !== "accepted" && (
                  <Card className="p-3.5">
                    <h2 className="font-display font-semibold text-on-surface text-sm mb-1">
                      {proposal?.status === "revision_requested"
                        ? "Send revised quote"
                        : "Send a proposal"}
                    </h2>
                    <p className="text-xs text-on-surface-variant mb-3">
                      {proposal?.status === "revision_requested"
                        ? "The student asked for a different price. Send a revised quote in Canadian dollars (CAD). Your previous quote stays in the history as replaced."
                        : "Set your price in Canadian dollars (CAD) and explain what's included. The student can accept, ask for a different price, or decline."}
                    </p>
                    {proposal?.status === "revision_requested" && proposal.student_note && (
                      <div className="mb-3 rounded-lg border border-warning/30 bg-warning-container/20 p-2.5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                          Student note
                        </p>
                        <p className="mt-1 text-xs text-on-surface-variant whitespace-pre-line">
                          “{proposal.student_note}”
                        </p>
                        {typeof proposal.target_price === "number" && proposal.target_price > 0 && (
                          <p className="mt-1 text-xs font-medium text-on-surface">
                            Target price: C${Math.round(proposal.target_price)}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="w-full sm:max-w-64">
                      <Input
                        label="Your quote in CAD"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        placeholder="Enter amount"
                        className="placeholder:text-on-surface-variant"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        onBlur={() => {
                          const raw = Number(bidPrice);
                          if (Number.isFinite(raw) && raw > 0)
                            setBidPrice(String(Math.round(raw)));
                        }}
                      />
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Charged in Canadian dollars (CAD).
                      </p>
                    </div>
                    <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant">
                      <RotateCcw size={14} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed text-on-surface-variant">
                        Unlimited revisions until the student is satisfied with the delivered work —
                        no extra cost.
                      </p>
                    </div>
                    <div className="mt-3">
                      <Textarea
                        label="Proposal message"
                        rows={3}
                        placeholder="Describe how you'll help and what's included..."
                        value={bidDescription}
                        onChange={(e) => setBidDescription(e.target.value)}
                      />
                    </div>
                    {bidError && <p className="text-sm text-error mt-2">{bidError}</p>}
                    <Button
                      disabled={sendingBid}
                      onClick={handleSendBid}
                      className="w-full justify-center mt-3"
                    >
                      {sendingBid ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {sendingBid
                        ? "Sending..."
                        : proposal?.status === "revision_requested"
                          ? "Send Revised Quote"
                          : "Send Proposal"}
                    </Button>
                  </Card>
                )}

              {isHelper && proposal?.status === "pending" && (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs text-on-surface-variant inline-flex items-center gap-1">
                    <ShieldCheck size={12} className="text-primary" />
                    Your quote is with the student and can no longer be edited. You&apos;ll be
                    notified when they respond.
                  </p>
                </div>
              )}

              {!isHelper && request.status === "accepted" && (
                <Link href="/requests">
                  <Button className="w-full justify-center" size="sm">
                    <RotateCcw size={15} /> View My Requests
                  </Button>
                </Link>
              )}
            </div>

            {view === "chat" && (
              <div className="lg:hidden flex flex-col gap-3">
                {contactCard}
                {proposalHistory.length > 0 && (
                  <ProposalActivity
                    proposals={proposalHistory}
                    className="shrink-0 max-h-44 overflow-y-auto"
                  />
                )}
                <div className="h-[calc(100dvh-22rem)] min-h-[280px]">{chatPanel}</div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-3 lg:col-span-5 min-h-0 lg:h-full">
          {contactCard}
          {proposalHistory.length > 0 && (
            <ProposalActivity
              proposals={proposalHistory}
              className="shrink-0 max-h-48 overflow-y-auto"
            />
          )}
          <div className="flex-1 min-h-0">{chatPanel}</div>
        </div>
      </div>
    </div>
  );
}
