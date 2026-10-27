"use client";

import { Phone, PhoneCall, PhoneMissed, PhoneOff } from "lucide-react";

export type AdminMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

export type CallLog = {
  id: string;
  caller_id: string;
  callee_id: string;
  direction: "outgoing" | "incoming";
  status: string;
  started_at: string;
  duration_seconds: number;
};

export type TimelineItem = { kind: "message"; msg: AdminMessage } | { kind: "call"; log: CallLog };

export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function callStatusLabel(status: string): string {
  if (status === "answered") return "Answered";
  if (status === "missed") return "Missed";
  if (status === "declined") return "Declined";
  if (status === "cancelled") return "Cancelled";
  if (status === "busy") return "Busy";
  if (status === "failed") return "Failed";
  return status;
}

export function callIcon(status: string) {
  if (status === "answered") return <PhoneCall size={13} className="text-success" />;
  if (status === "missed" || status === "failed")
    return <PhoneMissed size={13} className="text-danger" />;
  if (status === "declined" || status === "busy")
    return <PhoneOff size={13} className="text-warning" />;
  if (status === "cancelled") return <PhoneOff size={13} className="text-on-surface-variant" />;
  return <Phone size={13} className="text-on-surface-variant" />;
}

export function callColor(status: string) {
  if (status === "answered") return "bg-success-tint border-success-tint text-success";
  if (status === "missed" || status === "failed")
    return "bg-danger-tint border-danger-tint text-danger";
  if (status === "declined" || status === "busy")
    return "bg-accent-tint border-accent-tint text-on-accent-tint";
  return "bg-surface-container-high border-outline-variant text-on-surface-variant";
}
