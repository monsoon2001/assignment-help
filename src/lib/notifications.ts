import { createClient } from "@/lib/supabase/client";

// Marks every notification for the current user that links to this view as
// read, so the bell badge clears as soon as the conversation is opened.
export function markThreadNotificationsRead(link: string) {
  if (!link) return;
  const supabase = createClient();
  void supabase.from("notifications").update({ read: true }).eq("link", link).eq("read", false);
}

export function markOrderNotificationsRead(orderId: string) {
  if (!orderId) return;
  const supabase = createClient();
  void supabase
    .from("notifications")
    .update({ read: true })
    .eq("order_id", orderId)
    .eq("read", false);
}

export function markRequestNotificationsRead(requestId: string) {
  if (!requestId) return;
  const supabase = createClient();
  void supabase
    .from("notifications")
    .update({ read: true })
    .eq("request_id", requestId)
    .eq("read", false);
}

// Message notifications are tied to an order; mark them read while the order
// chat is open and visible so new ones clear without a refresh.
export function markOrderMessageNotificationsRead(orderId: string) {
  if (!orderId) return;
  const supabase = createClient();
  void supabase
    .from("notifications")
    .update({ read: true })
    .eq("order_id", orderId)
    .eq("type", "message")
    .eq("read", false);
}
