export type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "outline";

export interface StatusMeta {
  label: string;
  variant: BadgeVariant;
}

const ORDER_STATUS: Record<string, StatusMeta> = {
  payment_pending: { label: "Payment Pending", variant: "warning" },
  in_progress: { label: "In Progress", variant: "primary" },
  delivered: { label: "Delivered", variant: "success" },
  revision_requested: { label: "Revision Requested", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Under Review", variant: "danger" },
};

const REQUEST_STATUS: Record<string, StatusMeta> = {
  requested: { label: "Open", variant: "primary" },
  proposal_sent: { label: "Reviewing", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

const PROPOSAL_STATUS: Record<string, StatusMeta> = {
  pending: { label: "Pending", variant: "primary" },
  accepted: { label: "Accepted", variant: "success" },
  declined: { label: "Declined", variant: "outline" },
};

const PAYMENT_STATUS: Record<string, StatusMeta> = {
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  processing: { label: "Processing", variant: "warning" },
  refunded: { label: "Refunded", variant: "danger" },
};

const USER_STATUS: Record<string, StatusMeta> = {
  active: { label: "Active", variant: "success" },
  suspended: { label: "Suspended", variant: "danger" },
  pending: { label: "Pending", variant: "warning" },
};

export function orderStatusMeta(status: string | null | undefined): StatusMeta {
  return ORDER_STATUS[status ?? ""] ?? { label: status ?? "—", variant: "outline" };
}

export function requestStatusMeta(status: string | null | undefined): StatusMeta {
  return REQUEST_STATUS[status ?? ""] ?? { label: status ?? "—", variant: "outline" };
}

export function proposalStatusMeta(status: string | null | undefined): StatusMeta {
  return PROPOSAL_STATUS[status ?? ""] ?? { label: status ?? "—", variant: "outline" };
}

export function paymentStatusMeta(status: string | null | undefined): StatusMeta {
  return PAYMENT_STATUS[status ?? ""] ?? { label: status ?? "—", variant: "outline" };
}

export function userStatusMeta(status: string | null | undefined): StatusMeta {
  return USER_STATUS[status ?? ""] ?? { label: status ?? "—", variant: "outline" };
}

export const orderStatusVariant = (status: string | null | undefined): BadgeVariant =>
  orderStatusMeta(status).variant;

export const requestStatusVariant = (status: string | null | undefined): BadgeVariant =>
  requestStatusMeta(status).variant;

export const proposalStatusVariant = (status: string | null | undefined): BadgeVariant =>
  proposalStatusMeta(status).variant;

export const paymentStatusVariant = (status: string | null | undefined): BadgeVariant =>
  paymentStatusMeta(status).variant;

export const userStatusVariant = (status: string | null | undefined): BadgeVariant =>
  userStatusMeta(status).variant;