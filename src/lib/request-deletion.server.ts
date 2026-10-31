import "server-only";
import { pathFromStoredUrl } from "@/lib/signed-files";
import { adminClient } from "@/lib/supabase/admin";

export async function getRequestFilePaths(requestId: string): Promise<string[]> {
  const { data: request, error: requestError } = await adminClient
    .from("requests")
    .select("file_urls")
    .eq("id", requestId)
    .single();
  if (requestError) {
    throw new Error("Unable to load request files before deletion.");
  }

  const { data: messages, error: messagesError } = await adminClient
    .from("messages")
    .select("attachment_url")
    .eq("request_id", requestId)
    .not("attachment_url", "is", null);
  if (messagesError) {
    throw new Error("Unable to load chat attachments before deletion.");
  }

  return [
    ...new Set(
      [...request.file_urls, ...(messages ?? []).map(({ attachment_url }) => attachment_url)]
        .map((path) => (path ? pathFromStoredUrl(path) : null))
        .filter((path): path is string => path !== null),
    ),
  ];
}

export async function removeRequestFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const { error } = await adminClient.storage.from("request-files").remove(paths);
  if (error) {
    throw new Error("The request was deleted, but some attached files could not be removed.");
  }
}
