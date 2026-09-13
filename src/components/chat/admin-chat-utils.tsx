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

export type TimelineItem =
  | { kind: "message"; msg: AdminMessage }
  | { kind: "call"; log: CallLog };

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
  if (status === "answered") return <PhoneCall size={13} className="text-emerald-600" />;
  if (status === "missed" || status === "failed") return <PhoneMissed size={13} className="text-red-500" />;
  if (status === "declined" || status === "busy") return <PhoneOff size={13} className="text-amber-600" />;
  if (status === "cancelled") return <PhoneOff size={13} className="text-on-surface-variant" />;
  return <Phone size={13} className="text-on-surface-variant" />;
}

export function callColor(status: string) {
  if (status === "answered") return "bg-emerald-50 border-emerald-200 text-emerald-800";
  if (status === "missed" || status === "failed") return "bg-red-50 border-red-200 text-red-700";
  if (status === "declined" || status === "busy") return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-surface-container-high border-outline-variant text-on-surface-variant";
}