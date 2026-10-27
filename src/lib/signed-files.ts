/**
 * Storage buckets are private (harden migration 20260913000005). Files must be
 * downloaded through short-lived signed URLs that are issued only after a
 * server-side participant check — never through the old public URLs.
 *
 * Uploads now store BARE object paths (e.g. `<uid>/<uuid>-<name>` or
 * `<orderId>/<uid>/<uuid>-<name>`); legacy rows may contain the full public URL
 * they got from getPublicUrl(). pathFromStoredUrl() normalizes both forms.
 */

export const STORAGE_BUCKETS = ["request-files", "order-files"] as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export const SIGNED_URL_TTL_SECONDS = 15 * 60;

export function isStorageBucket(value: string): value is StorageBucket {
  return (STORAGE_BUCKETS as readonly string[]).includes(value);
}

/** Extracts the bare storage object path from a stored URL/path value. */
export function pathFromStoredUrl(value: string): string | null {
  if (!value) return null;
  try {
    // Legacy full public/signed URL: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "object");
    if (idx === -1) return null;
    const after = parts.slice(idx + 1); // ["public"|"sign", <bucket>, ...path]
    const bucket = after[1];
    if (bucket && isStorageBucket(bucket)) {
      const path = after.slice(2).join("/");
      return sanitizeObjectPath(path);
    }
    return null;
  } catch {
    // Not a URL — assume it is already a bare object path.
    return sanitizeObjectPath(value);
  }
}

/** Rejects path traversal / control characters / oversized paths. */
export function sanitizeObjectPath(path: string): string | null {
  if (!path || path.length > 512) return null;
  if (path.startsWith("/") || path.includes("\\")) return null;
  if (/[\u0000-\u001f\u007f]/.test(path)) return null;
  const segments = path.split("/");
  if (segments.some((s) => s === "" || s === "." || s === "..")) return null;
  return path;
}

/** The set of values (raw + normalized) that identify one stored file. */
export function pathVariants(stored: string | null | undefined): Set<string> {
  const set = new Set<string>();
  if (!stored) return set;
  set.add(stored);
  const bare = pathFromStoredUrl(stored);
  if (bare) set.add(bare);
  return set;
}

/** Human-readable file name from a stored URL/path (survives bare paths). */
export function fileNameFromStoredUrl(stored: string): string {
  const bare = pathFromStoredUrl(stored);
  const source = bare ?? stored;
  const last = source.split("/").pop() || "file";
  try {
    return decodeURIComponent(last.replace(/^[a-f0-9-]{36}-/, ""));
  } catch {
    return last;
  }
}
