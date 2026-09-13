"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight, LayoutGrid, MessageSquare, Package, Check,
  ShieldCheck, FileText, Download, RotateCcw, Star, Clock,
  Loader2, CalendarDays, Timer, DollarSign, CheckCircle2, Paperclip,
  Receipt, ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { realtimeTopic } from "@/lib/supabase/realtime";
import { uploadOrderFile } from "@/lib/order-files";
import { normalizeCurrency, formatCurrency } from "@/lib/currency";
import { markThreadNotificationsRead } from "@/lib/notifications";
import ChatPanel, { type ChatMessageRow, timeLabel, fileNameFromUrl } from "@/components/chat/chat-panel";

type OrderStatus =
  | "payment_pending"
  | "in_progress"
  | "delivered"
  | "revision_requested"
  | "completed"
  | "disputed";

type OrderData = {
  id: string;
  status: OrderStatus;
  price: number;
  currency: string;
  deadline: string | null;
  created_at: string;
  student_id: string;
  proposal_id: string;
  helper: { id: string; name: string | null } | null;
  proposal: {
    id: string | null;
    request_id: string | null;
    description: string | null;
    revisions_included: number | null;
    request: { title: string | null; subject: string | null } | null;
  } | null;
};

type DeliveryRow = {
  id: string;
  message: string | null;
  file_urls: string[];
  created_at: string;
};

type PaymentRow = {
  status: string | null;
  amount: number | null;
  currency: string | null;
  receipt_url: string | null;
  created_at: string | null;
};

const STATUS_META: Record<OrderStatus, { label: string; variant: "primary" | "success" | "warning" | "outline" | "danger" }> = {
  payment_pending: { label: "Payment Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "primary" },
  delivered: { label: "Delivered", variant: "success" },
  revision_requested: { label: "Revision Requested", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Under Review", variant: "danger" },
};


export default function OrderWorkspace({ orderId }: { orderId: string }) {
  const supabase = useRef(createClient());

  const [order, setOrder] = useState<OrderData | null>(null);
  const [role, setRole] = useState<"student" | "helper" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "delivery">("overview");
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [payment, setPayment] = useState<PaymentRow | null>(null);

  const [draft, setDraft] = useState("");
  const [chatFiles, setChatFiles] = useState<File[]>([]);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    markThreadNotificationsRead(pathname);
  }, [pathname]);

  const loadOrder = useCallback(async () => {
    const { data, error } = await supabase.current
      .from("orders")
      .select("id, status, price, currency, deadline, created_at, student_id, proposal_id, helper:users!orders_helper_id_fkey(id, name), proposal:proposals(id, request_id, description, revisions_included, request:requests(title, subject))")
      .eq("id", orderId)
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const proposal =
      (Array.isArray(data.proposal) ? data.proposal[0] : data.proposal) ?? null;
    requestIdRef.current = proposal?.request_id ?? null;

    const normalized: OrderData = {
      ...(data as Omit<OrderData, "helper" | "proposal">),
      helper: Array.isArray(data.helper) ? data.helper[0] ?? null : data.helper,
      proposal: proposal
        ? {
            id: proposal.id,
            request_id: proposal.request_id,
            description: proposal.description,
            revisions_included: proposal.revisions_included,
            request: Array.isArray(proposal.request)
              ? (proposal.request[0] ?? null)
              : (proposal.request ?? null),
          }
        : null,
    };

    const {
      data: { user: current },
    } = await supabase.current.auth.getUser();

    setCurrentUserId(current?.id);
    setRole(current && normalized.student_id === current.id ? "student" : "helper");
    setOrder(normalized);

    const { data: paymentData } = await supabase.current
      .from("payments")
      .select("status, amount, currency, receipt_url, created_at")
      .eq("order_id", orderId)
      .maybeSingle();
    setPayment((paymentData as PaymentRow | null) ?? null);

    setLoading(false);
  }, [orderId]);

  const loadMessages = useCallback(async () => {
    const requestId = requestIdRef.current;
    const { data } = requestId
      ? await supabase.current
          .from("messages")
          .select("id, sender_id, body, attachment_url, created_at, sender:users(id, name)")
          .or(`order_id.eq.${orderId},request_id.eq.${requestId}`)
          .order("created_at", { ascending: true })
      : await supabase.current
          .from("messages")
          .select("id, sender_id, body, attachment_url, created_at, sender:users(id, name)")
          .eq("order_id", orderId)
          .order("created_at", { ascending: true });
    setMessages((data ?? []) as unknown as ChatMessageRow[]);
  }, [orderId]);

  const loadDeliveries = useCallback(async () => {
    const { data } = await supabase.current
      .from("deliveries")
      .select("id, message, file_urls, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    setDeliveries((data ?? []) as DeliveryRow[]);
  }, [orderId]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let active = true;
    const client = supabase.current;

    async function init() {
      await loadOrder();
      await Promise.all([loadMessages(), loadDeliveries()]);
      if (!active) return;

      channel = client
        .channel(realtimeTopic(`order:${orderId}`))
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `order_id=eq.${orderId}` },
          async () => {
            await loadMessages();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "deliveries", filter: `order_id=eq.${orderId}` },
          async () => {
            await Promise.all([loadDeliveries(), loadOrder()]);
          }
        )
        .subscribe();
    }

    void init();

    const poll = setInterval(() => {
      if (!active) return;
      void Promise.all([loadMessages(), loadDeliveries(), loadOrder()]);
    }, 10000);

    return () => {
      active = false;
      clearInterval(poll);
      if (channel) void client.removeChannel(channel);
    };
  }, [orderId, loadOrder, loadMessages, loadDeliveries]);

  if (loading) {
    return (
      <div className="w-full py-24 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (notFound || !order || !role) {
    return (
      <Card className="w-full py-16 text-center">
        <p className="text-on-surface-variant">Order not found.</p>
        <Link href={role === "helper" ? "/helper/orders" : "/requests"}>
          <Button className="mt-4" variant="outline">Back to orders</Button>
        </Link>
      </Card>
    );
  }

  const meta = STATUS_META[order.status];
  const isHelper = role === "helper";
  const isStudent = role === "student";
  const title = order.proposal?.request?.title ?? "Order";
  const subject = order.proposal?.request?.subject ?? "General";
  const price = formatCurrency(Number(order.price), normalizeCurrency(order.currency));

  const paidLabel =
    payment?.status === "paid"
      ? `Paid ${formatCurrency(Number(payment.amount ?? order.price), normalizeCurrency(payment.currency ?? order.currency))}` +
        (payment.created_at
          ? ` · ${new Date(payment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
          : "")
      : "Awaiting payment";

  const logoName = order.helper?.name || "Helper";

  async function sendMessage() {
    const text = draft.trim();
    if (!text && chatFiles.length === 0) return;
    setSendingMsg(true);
    setChatError(null);
    try {
      let attachmentUrl: string | null = null;
      if (chatFiles.length > 0) {
        attachmentUrl = await uploadOrderFile(orderId, chatFiles[0]);
      }
      const body = text || (chatFiles[0]?.name ?? "Attachment");
      const { error } = await supabase.current.from("messages").insert({
        order_id: orderId,
        sender_id: currentUserId,
        body,
        attachment_url: attachmentUrl,
      });
      if (error) throw new Error(error.message);
      setDraft("");
      setChatFiles([]);
      await loadMessages();
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Could not send.");
    } finally {
      setSendingMsg(false);
    }
  }

  async function submitDelivery() {
    if (!deliveryMessage.trim() && deliveryFiles.length === 0) {
      setDeliveryError("Add a message or at least one file.");
      return;
    }
    setSubmittingDelivery(true);
    setDeliveryError(null);
    try {
      const urls: string[] = [];
      for (const f of deliveryFiles) {
        urls.push(await uploadOrderFile(orderId, f));
      }
      const { error } = await supabase.current.from("deliveries").insert({
        order_id: orderId,
        message: deliveryMessage.trim() || null,
        file_urls: urls,
      });
      if (error) throw new Error(error.message);

      const { error: statusError } = await supabase.current
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", orderId);
      if (statusError) throw new Error(statusError.message);

      setDeliveryMessage("");
      setDeliveryFiles([]);
      await Promise.all([loadDeliveries(), loadOrder()]);
    } catch (e) {
      setDeliveryError(e instanceof Error ? e.message : "Delivery failed.");
    } finally {
      setSubmittingDelivery(false);
    }
  }

  async function setOrderStatus(status: OrderStatus) {
    const { error } = await supabase.current
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) {
      setDeliveryError(error.message);
      return;
    }
    await loadOrder();
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: LayoutGrid },
    { id: "chat" as const, label: "Chat", icon: MessageSquare },
    { id: "delivery" as const, label: "Delivery", icon: Package },
  ];

  const statusStep =
    order.status === "completed"
      ? 3
      : order.status === "delivered"
        ? 2
        : order.status === "in_progress" || order.status === "revision_requested"
          ? 1
          : 0;

  const timeline = [
    { label: "Payment Confirmed", icon: Check },
    { label: "In Progress", icon: Clock },
    { label: isHelper ? "Deliverable Ready" : "Delivered", icon: Package },
    { label: "Completed", icon: Star },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5">
      <nav className="flex items-center gap-1.5 text-sm text-on-surface-variant">
        <Link href={isHelper ? "/helper/orders" : "/requests"} className="hover:text-on-surface">
          {isHelper ? "Active Orders" : "My Requests"}
        </Link>
        <ChevronRight size={14} />
        <span className="text-on-surface font-medium truncate">#{order.id.slice(0, 8).toUpperCase()} · {title}</span>
      </nav>

      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant">
        <div className="flex items-center gap-4 min-w-0">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-xl text-on-surface">{title}</h1>
              <Badge variant={meta.variant} dot className="shrink-0">{meta.label}</Badge>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              #{order.id.slice(0, 8).toUpperCase()} · {subject} · {paidLabel}
            </p>
            <p className="text-xs text-on-surface-variant mt-1 inline-flex items-center gap-1">
              <Timer size={12} />{" "}
              {order.deadline
                ? `Due ${new Date(order.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Deadline flexible"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isStudent && order.status === "completed" && (
            <Link href={`/orders/${order.id}/review`}>
              <Button size="sm" variant="outline">
                <Star size={15} className="mr-1.5" /> Leave a Review
              </Button>
            </Link>
          )}
          {isHelper && order.status !== "completed" && (
            <Button size="sm" onClick={() => setActiveTab("delivery")}>
              Submit Delivery
            </Button>
          )}
          {isStudent && order.status === "delivered" && (
            <Button size="sm" onClick={() => setActiveTab("delivery")}>
              Review Delivery
            </Button>
          )}
        </div>
      </section>

      <div className="flex items-center gap-1 border-b border-outline-variant">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                active
                  ? "border-primary-container text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon size={16} />
              {tab.label}
              {tab.id === "chat" && messages.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gradient-to-br from-primary-container to-secondary-container text-white text-[10px] font-bold">
                  {messages.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 flex flex-col gap-5">
            <Card className="p-5">
              <h2 className="font-display font-semibold text-on-surface mb-1">Order Progress</h2>
              <p className="text-xs text-on-surface-variant mb-5">
                Status driven by real order activity.
              </p>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Phase</span>
                <span className="text-sm font-bold text-on-surface">Step {statusStep + 1} of {timeline.length}</span>
              </div>

              <div className="flex flex-col gap-4">
                {timeline.map((step, i) => {
                  const done = i < statusStep;
                  const current = i === statusStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.label} className="flex gap-3">
                      <span
                        className={`w-7 h-7 mt-0.5 rounded-full flex items-center justify-center shrink-0 ${
                          done
                            ? "bg-success text-white"
                            : current
                              ? "bg-primary-container text-on-primary"
                              : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        <Icon size={14} />
                      </span>
                      <div>
                        <p className={`text-sm font-semibold ${done || current ? "text-on-surface" : "text-on-surface-variant/60"}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {current ? "Current stage of this order" : done ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="font-display font-semibold text-on-surface mb-3">Agreed Scope</h2>
              {order.proposal?.description ? (
                <p className="text-sm text-on-surface-variant leading-relaxed">{order.proposal.description}</p>
              ) : (
                <p className="text-sm text-on-surface-variant">No additional scope notes were provided.</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                  <DollarSign size={14} /> {price} fixed
                </span>
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                  <RotateCcw size={14} /> Unlimited revisions
                </span>
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                  <CalendarDays size={14} />{" "}
                  {order.deadline
                    ? new Date(order.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "Flexible"}
                </span>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-on-surface inline-flex items-center gap-2">
                  <Receipt size={16} className="text-primary" /> Payment
                </h2>
                <Badge variant={payment?.status === "paid" ? "success" : "warning"}>
                  {payment?.status === "paid" ? "Paid" : "Awaiting Payment"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                  <DollarSign size={14} />{" "}
                  {formatCurrency(
                    Number(payment?.amount ?? order.price),
                    normalizeCurrency(payment?.currency ?? order.currency)
                  )}
                </span>
                {payment?.status === "paid" && payment.created_at && (
                  <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                    <CalendarDays size={14} />{" "}
                    Paid{" "}
                    {new Date(payment.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
              {payment?.status === "paid" && payment.receipt_url ? (
                <a
                  href={payment.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  View payment receipt <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
                  {isHelper
                    ? "Payment is secured by PeerCraft and releases to you after the student reviews the delivery. The student's paid receipt is shown here once confirmed."
                    : "Complete payment to start your order."}
                </p>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={logoName} size="lg" online />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-on-surface">{order.helper?.name ?? "PeerCraft Helper"}</p>
                  <p className="text-xs text-on-surface-variant truncate">Assigned mentor</p>
                </div>
                <Badge variant="success" className="shrink-0"><ShieldCheck size={12} /> Verified</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-on-surface">Expert</span>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <ChatPanel
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
        </div>
      )}

      {activeTab === "chat" && (
        <ChatPanel
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
      )}

      {activeTab === "delivery" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <h2 className="font-display font-semibold text-on-surface mb-1">Deliverables</h2>
              <p className="text-sm text-on-surface-variant mb-4">
                {isHelper
                  ? "Upload completed work. This creates a delivery and marks the order Delivered."
                  : "Reviewed files appear here once your helper delivers."}
              </p>

              {deliveries.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center">
                    <Package size={22} className="text-primary" />
                  </span>
                  <p className="text-sm font-medium text-on-surface">No deliveries yet</p>
                  <p className="text-xs text-on-surface-variant">
                    {isHelper ? "Submit your first deliverable below." : "Your helper hasn't delivered yet."}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {deliveries.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl border border-outline-variant">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Delivered {timeLabel(d.created_at)}
                    </div>
                    {d.message && <p className="text-sm text-on-surface mb-3">{d.message}</p>}
                    {d.file_urls.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {d.file_urls.map((url, i) => (
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
                            <Download size={15} className="text-on-surface-variant shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {isStudent && order.status === "delivered" && (
              <Card className="p-5 flex flex-col gap-3">
                <h3 className="font-semibold text-on-surface">How did the delivery look?</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => setOrderStatus("revision_requested")}>
                    <RotateCcw size={15} /> Request a Change
                  </Button>
                  <Button onClick={() => setOrderStatus("completed")} className="w-full">
                    <Check size={15} /> Accept &amp; Complete
                  </Button>
                </div>
                {deliveryError && <p className="text-sm text-error">{deliveryError}</p>}
              </Card>
            )}

            {isStudent && order.status === "revision_requested" && (
              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-warning" />
                  <p className="text-sm font-medium text-on-surface">Revision requested</p>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Your helper is working on a revised version — you&apos;ll see it here when delivered.
                </p>
              </Card>
            )}

            {isStudent && order.status === "completed" && (
              <Card className="p-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <div>
                    <p className="font-semibold text-on-surface">Order completed</p>
                    <p className="text-xs text-on-surface-variant">Share your experience below.</p>
                  </div>
                </div>
                <Link href={`/orders/${order.id}/review`}>
                  <Button size="sm"><Star size={14} /> Review</Button>
                </Link>
              </Card>
            )}
          </div>

          {isHelper && (
            <Card className="p-5 sticky top-6">
              <h2 className="font-display font-semibold text-on-surface mb-1">Submit Delivery</h2>
              <p className="text-sm text-on-surface-variant mb-4">
                Include a summary note and any files for the student.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-on-surface block mb-1.5">Delivery note</label>
                  <textarea
                    rows={3}
                    value={deliveryMessage}
                    onChange={(e) => setDeliveryMessage(e.target.value)}
                    placeholder="Summarize what you delivered and any notes for the student..."
                    className="w-full p-3.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-on-surface block mb-1.5">
                    Files ({deliveryFiles.length} selected)
                  </label>
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant rounded-xl p-6 cursor-pointer hover:bg-surface-container-low transition-colors">
                    <Paperclip size={20} className="text-primary" />
                    <span className="text-sm font-medium text-on-surface">Click to browse</span>
                    <span className="text-xs text-on-surface-variant">PDF, DOCX, images — up to 25 MB</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setDeliveryFiles(Array.from(e.target.files ?? []))
                      }
                    />
                  </label>
                  {deliveryFiles.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {deliveryFiles.map((f, i) => (
                        <span key={i} className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <FileText size={13} /> {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {deliveryError && <p className="text-sm text-error">{deliveryError}</p>}

                <Button
                  disabled={submittingDelivery}
                  onClick={submitDelivery}
                  className="w-full justify-center"
                >
                  {submittingDelivery ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Package size={16} />
                  )}
                  {submittingDelivery ? "Uploading..." : "Submit Delivery"}
                </Button>
                <p className="text-xs text-on-surface-variant text-center">
                  Submitting sets the order status to Delivered for student review.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
