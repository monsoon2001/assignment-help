import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import {
  isStorageBucket,
  pathFromStoredUrl,
  SIGNED_URL_TTL_SECONDS,
  type StorageBucket,
} from "@/lib/signed-files";

/**
 * Server-side signed URL for an admin view. Admins are verified by the admin
 * route guard; this helper never trusts the stored value blindly (it extracts
 * the bare object path) and returns null on any failure.
 */
export async function createSignedFileUrl(
  stored: string,
  bucket: StorageBucket
): Promise<string | null> {
  const path = pathFromStoredUrl(stored);
  if (!path || !isStorageBucket(bucket)) return null;
  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}