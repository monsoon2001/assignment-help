/**
 * The single status → colour mapping for the whole app. Every student, helper
 * and admin screen reads from here (via the shared StatusBadge) so a given
 * state always shows the same text and colour.
 */
export type StatusTone =
  "slate" | "blue" | "blueStrong" | "amber" | "orange" | "indigo" | "green" | "red";

export interface StatusMeta {
  label: string;
  tone: StatusTone;
}

const ORDER_STATUS: Record<string, StatusMeta> = {
  payment_pending: { label: "Payment Pending", tone: "blueStrong" },
  in_progress: { label: "In Progress", tone: "amber" },
  delivered: { label: "Delivered", tone: "indigo" },
  revision_requested: { label: "Revision Requested", tone: "orange" },
  completed: { label: "Completed", tone: "green" },
  disputed: { label: "Under Review", tone: "red" },
};

const REQUEST_STATUS: Record<string, StatusMeta> = {
  requested: { label: "Open", tone: "slate" },
  proposal_sent: { label: "Reviewing", tone: "blue" },
  accepted: { label: "Accepted", tone: "blueStrong" },
  declined: { label: "Declined", tone: "slate" },
  cancelled: { label: "Cancelled", tone: "slate" },
};

const PROPOSAL_STATUS: Record<string, StatusMeta> = {
  pending: { label: "Pending", tone: "blue" },
  accepted: { label: "Accepted", tone: "blueStrong" },
  declined: { label: "Declined", tone: "slate" },
};

const PAYMENT_STATUS: Record<string, StatusMeta> = {
  paid: { label: "Paid", tone: "green" },
  pending: { label: "Pending", tone: "blueStrong" },
  processing: { label: "Processing", tone: "blueStrong" },
  refunded: { label: "Refunded", tone: "red" },
};

const USER_STATUS: Record<string, StatusMeta> = {
  active: { label: "Active", tone: "green" },
  suspended: { label: "Suspended", tone: "red" },
  pending: { label: "Pending", tone: "blueStrong" },
};

export function orderStatusMeta(status: string | null | undefined): StatusMeta {
  return ORDER_STATUS[status ?? ""] ?? { label: status ?? "—", tone: "slate" };
}

export function requestStatusMeta(status: string | null | undefined): StatusMeta {
  return REQUEST_STATUS[status ?? ""] ?? { label: status ?? "—", tone: "slate" };
}

export function proposalStatusMeta(status: string | null | undefined): StatusMeta {
  return PROPOSAL_STATUS[status ?? ""] ?? { label: status ?? "—", tone: "slate" };
}

export function paymentStatusMeta(status: string | null | undefined): StatusMeta {
  return PAYMENT_STATUS[status ?? ""] ?? { label: status ?? "—", tone: "slate" };
}

export function userStatusMeta(status: string | null | undefined): StatusMeta {
  return USER_STATUS[status ?? ""] ?? { label: status ?? "—", tone: "slate" };
}

export const orderStatusTone = (status: string | null | undefined): StatusTone =>
  orderStatusMeta(status).tone;

export const requestStatusTone = (status: string | null | undefined): StatusTone =>
  requestStatusMeta(status).tone;

export const proposalStatusTone = (status: string | null | undefined): StatusTone =>
  proposalStatusMeta(status).tone;

export const paymentStatusTone = (status: string | null | undefined): StatusTone =>
  paymentStatusMeta(status).tone;

export const userStatusTone = (status: string | null | undefined): StatusTone =>
  userStatusMeta(status).tone;
