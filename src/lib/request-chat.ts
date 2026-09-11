import { createClient } from "@/lib/supabase/client";
import type { ChatMessageRow } from "@/components/chat/chat-panel";

export async function fetchRequestMessages(
  requestId: string
): Promise<ChatMessageRow[] | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, body, attachment_url, created_at, sender:users(id, name)")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  return (data ?? null) as unknown as ChatMessageRow[] | null;
}

export async function sendRequestMessage(
  requestId: string,
  body: string,
  file?: File | null
): Promise<{ ok: true } | { error: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to send a message." };
  }

  let attachmentUrl: string | null = null;
  if (file) {
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("request-files")
      .upload(path, file);
    if (uploadError) {
      return { error: uploadError.message };
    }
    const { data: publicUrl } = supabase.storage
      .from("request-files")
      .getPublicUrl(path);
    attachmentUrl = publicUrl?.publicUrl ?? path;
  }

  const { error } = await supabase.from("messages").insert({
    request_id: requestId,
    sender_id: user.id,
    body: body.trim() || file?.name || "Attachment",
    attachment_url: attachmentUrl,
  });

  if (error) {
    return { error: error.message };
  }
  return { ok: true };
}