"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  CalendarDays, CheckCircle2, ChevronRight, Clock, FileText, Loader2, RotateCcw, Send, ShieldCheck,
  Timer, UserRound,
} from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS } from "@/lib/currency";
import ChatPanel, {
  type ChatMessageRow, fileNameFromUrl,
} from "@/components/chat/chat-panel";
import ProposalCard, { type RequestProposal } from "@/components/requests/proposal-card";
import HelperPicker from "@/components/requests/helper-picker";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";
import { fetchRequestMessages, sendRequestMessage } from "@/lib/request-chat";
import { reassignRequest, type HelperCandidate } from "@/lib/requests";
import { submitProposal } from "@/lib/proposals";

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

const STATUS_META: Record<string, { label: string; variant: "primary" | "success" | "warning" | "outline" }> = {
  requested: { label: "Awaiting Response", variant: "warning" },
  proposal_sent: { label: "Proposal Received", variant: "primary" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

export default function RequestWorkspace({
  requestId,
  mode,
  initialResend = false,
}: {
  requestId: string;
  mode: "student" | "helper";
  initialResend?: boolean;
}) {
  const supabase = useRef(createClient());

  const [request, setRequest] = useState<RequestData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [proposal, setProposal] = useState<RequestProposal | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [bidPrice, setBidPrice] = useState("");
  const [bidCurrency, setBidCurrency] = useState("USD");
  const [bidDescription, setBidDescription] = useState("");
  const [bidRevisions, setBidRevisions] = useState("1");
  const [bidExpires, setBidExpires] = useState("");
  const [sendingBid, setSendingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  const [resendOpen, setResendOpen] = useState(initialResend);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadRequest = useCallback(async () => {
    const { data } = await supabase.current
      .from("requests")
      .select("id, title, subject, description, deadline, status, file_urls, created_at, sent_at, student_id, helper:users!requests_helper_id_fkey(id, name), student:users!requests_student_id_fkey(id, name)")
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
      .select("id, request_id, helper_id, price, currency, description, revisions_included, expires_at, status, created_at, helper:users(id, name)")
      .eq("request_id", requestId)
      .maybeSingle();

    const row = Array.isArray(data) ? (data?.[0] ?? null) : data;
    if (!row) {
      setProposal(null);
      setOrderId(null);
      return;
    }
    const normalized: RequestProposal = {
      ...(row as Omit<RequestProposal, "helper">),
      helper: Array.isArray(row.helper) ? (row.helper[0] ?? null) : row.helper,
    };
    setProposal(normalized);

    if (normalized.status === "accepted") {
      const { data: order } = await supabase.current
        .from("orders")
        .select("id")
        .eq("proposal_id", normalized.id)
        .maybeSingle();
      setOrderId(order && !Array.isArray(order) ? order.id : null);
    } else {
      setOrderId(null);
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
          { event: "INSERT", schema: "public", table: "messages", filter: `request_id=eq.${requestId}` },
          async () => {
            await loadMessages();
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "requests", filter: `id=eq.${requestId}` },
          async () => {
            await loadRequest();
          }
        )
        .subscribe();
    }

    void init();
    return () => {
      active = false;
      if (channel) void client.removeChannel(channel);
    };
  }, [requestId, loadRequest, loadMessages, loadProposal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="w-full py-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (notFound || !request) {
    return (
      <Card className="w-full py-16 text-center">
        <p className="text-on-surface-variant">Request not found.</p>
        <Link href={mode === "helper" ? "/helper/requests" : "/requests"}>
          <Button className="mt-4" variant="outline">Back to requests</Button>
        </Link>
      </Card>
    );
  }

  const isHelper = mode === "helper";
  const meta = STATUS_META[request.status] ?? { label: request.status, variant: "outline" as const };
  const otherParty = isHelper ? request.student : request.helper;
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
    await loadMessages();
  }

  async function handleSendBid() {
    const parsedPrice = Number(bidPrice);
    if (!bidPrice || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setBidError("Enter a valid price for this request.");
      return;
    }
    setSendingBid(true);
    setBidError(null);
    const result = await submitProposal({
      request_id: requestId,
      price: parsedPrice,
      currency: bidCurrency,
      description: bidDescription.trim() || undefined,
      revisions_included: Math.max(0, Number(bidRevisions) || 0),
      expires_at: bidExpires ? new Date(`${bidExpires}T23:59:59`).toISOString() : null,
    });
    setSendingBid(false);
    if ("error" in result) {
      setBidError(result.error);
      return;
    }
    setBidPrice("");
    setBidCurrency("USD");
    setBidDescription("");
    setBidRevisions("1");
    setBidExpires("");
    await loadProposal();
    await loadRequest();
  }

  async function handleReassign(helper: HelperCandidate) {
    setResendError(null);
    const result = await reassignRequest(requestId, helper.user_id);
    if ("error" in result) {
      setResendError(result.error);
      return;
    }
    setResendOpen(false);
    setResendMessage(`Request sent to ${helper.user?.name ?? "your new helper"}. They have 2 hours to respond.`);
    await Promise.all([loadRequest(), loadProposal()]);
  }

  const title = request.title || "Untitled Request";

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5">
      <nav className="flex items-center gap-1.5 text-sm text-on-surface-variant">
        <Link href={isHelper ? "/helper/requests" : "/requests"} className="hover:text-on-surface">
          {isHelper ? "Incoming Requests" : "My Requests"}
        </Link>
        <ChevronRight size={14} />
        <span className="text-on-surface font-medium truncate">#{request.id.slice(0, 8).toUpperCase()} · {title}</span>
      </nav>

      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant">
        <div className="flex items-center gap-4 min-w-0">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-xl text-on-surface">{title}</h1>
              <Badge variant={meta.variant} dot className="shrink-0">{meta.label}</Badge>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              #{request.id.slice(0, 8).toUpperCase()} · {request.subject || "General"}
            </p>
            <p className="text-xs text-on-surface-variant mt-1 inline-flex items-center gap-1">
              <Timer size={12} />{" "}
              {request.deadline
                ? `Due ${new Date(request.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Deadline flexible"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isHelper && request.status === "proposal_sent" && (
            <Badge variant="success"><ShieldCheck size={12} /> Proposal Sent</Badge>
          )}
        </div>
      </section>

      {overdue && (
        <Card className="p-5 border-warning">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-warning-container/20 text-warning flex items-center justify-center shrink-0">
                <Clock size={18} />
              </span>
              <div>
                <p className="font-semibold text-on-surface">This helper hasn&apos;t responded</p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  It&apos;s been more than 2 hours since your request was sent. Choose a different helper to keep things moving.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setResendOpen((v) => !v)}>
              {resendOpen ? "Cancel" : "Choose a different helper"}
            </Button>
          </div>
          {resendOpen && (
            <div className="mt-4 pt-4 border-t border-outline-variant">
              <HelperPicker subject={request.subject} onSelect={handleReassign} pickLabel="Send to this helper instead" heading="Pick a different helper" />
              {resendError && <p className="text-sm text-error mt-3">{resendError}</p>}
            </div>
          )}
        </Card>
      )}

      {!overdue && resendOpen && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-on-surface">Choose a different helper</h3>
            <Button size="sm" variant="ghost" onClick={() => setResendOpen(false)}>Close</Button>
          </div>
          <HelperPicker subject={request.subject} onSelect={handleReassign} pickLabel="Send to this helper instead" heading="" />
          {resendError && <p className="text-sm text-error mt-3">{resendError}</p>}
        </Card>
      )}

      {resendMessage && !resendOpen && (
        <p className="text-sm text-success inline-flex items-center gap-1.5">
          <CheckCircle2 size={15} /> {resendMessage}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 flex flex-col gap-5">
          <ChatPanel
            title="Request Chat"
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
          />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={otherParty?.name || (isHelper ? "Student" : "Helper")} size="lg" online />
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-on-surface">
                  {otherParty?.name || (isHelper ? "Student" : "PeerCraft Helper")}
                </p>
                <p className="text-xs text-on-surface-variant truncate">
                  {isHelper ? "Student who requested help" : "Expert assigned to your request"}
                </p>
              </div>
            </div>
            {request.sent_at && !isHelper && (
              <p className="text-xs text-on-surface-variant inline-flex items-center gap-1">
                <Clock size={12} />
                Sent {new Date(request.sent_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-display font-semibold text-on-surface mb-2">Request details</h2>
            {request.description ? (
              <p className="text-sm text-on-surface-variant leading-relaxed">{request.description}</p>
            ) : (
              <p className="text-sm text-on-surface-variant">No additional details were provided.</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                <CalendarDays size={14} />{" "}
                {request.deadline
                  ? new Date(request.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "Flexible"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                <UserRound size={14} /> {request.subject || "General"}
              </span>
            </div>
            {request.file_urls.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                {request.file_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
                  >
                    <span className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-on-surface truncate">
                      {fileNameFromUrl(url)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </Card>

          {isHelper && !proposal && (
            <Card className="p-5">
              <h2 className="font-display font-semibold text-on-surface mb-1">Send a proposal</h2>
              <p className="text-sm text-on-surface-variant mb-4">
                Price this request in the chat — the student reviews and accepts from here.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="25.00"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                />
                <Select
                  label="Currency"
                  value={bidCurrency}
                  onChange={(e) => setBidCurrency(e.target.value)}
                  options={SUPPORTED_CURRENCIES.map((c) => ({ value: c, label: CURRENCY_LABELS[c] }))}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Revisions included"
                  type="number"
                  min="0"
                  value={bidRevisions}
                  onChange={(e) => setBidRevisions(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Offer expires"
                  type="date"
                  value={bidExpires}
                  onChange={(e) => setBidExpires(e.target.value)}
                />
              </div>
              <div className="mt-4">
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
                className="w-full justify-center mt-4"
              >
                {sendingBid ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sendingBid ? "Sending..." : "Send Proposal"}
              </Button>
            </Card>
          )}

          {!isHelper && proposal && (
            <ProposalCard
              proposal={proposal}
              requestTitle={title}
              requestDeadline={request.deadline}
              orderId={orderId}
            />
          )}

          {isHelper && proposal && (
            <p className="text-xs text-on-surface-variant inline-flex items-center gap-1">
              <ShieldCheck size={12} className="text-primary" />
              Your proposal is with the student. You&apos;ll be notified when they respond.
            </p>
          )}

          {!isHelper && request.status === "accepted" && (
            <Link href="/requests">
              <Button className="w-full justify-center" size="sm">
                <RotateCcw size={15} /> View My Requests
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}