export type NotifyEvent =
  | "request.created"
  | "proposal.created"
  | "proposal.declined"
  | "order.delivered"
  | "order.revision_requested"
  | "order.completed";

/**
 * Fire-and-forget ping to the fan-out endpoint after a browser-originated
 * activity succeeds. The server re-reads the row and emails the student, helper
 * and admins, so the client only needs to send the event + row id. Failures are
 * ignored — notifications must never block the user.
 */
export function notifyActivity(event: NotifyEvent, id: string): void {
  if (typeof window === "undefined" || !id) return;
  void fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, id }),
    keepalive: true,
  }).catch(() => {});
}
