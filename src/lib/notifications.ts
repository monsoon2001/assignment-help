import { createClient } from "@/lib/supabase/client";

// Marks every notification for the current user that links to this view as
// read, so the bell badge clears as soon as the conversation is opened.
export function markThreadNotificationsRead(link: string) {
  if (!link) return;
  const supabase = createClient();
  void supabase
    .from("notifications")
    .update({ read: true })
    .eq("link", link)
    .eq("read", false);
}