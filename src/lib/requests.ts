import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { notifyActivity } from "@/lib/notify-client";

const DRAFT_KEY = "acadivo:pending-request";

/**
 * Fallback helper account. The live choice is stored in platform_settings and
 * can be switched by an admin from /admin/helpers; this constant is only used
 * when that lookup is unavailable. Students never browse or choose a helper.
 * Override with NEXT_PUBLIC_DESIGNATED_HELPER_ID (default: Sanchita Acharya /
 * sanchitaa286@gmail.com).
 */
export const DESIGNATED_HELPER_ID =
  process.env.NEXT_PUBLIC_DESIGNATED_HELPER_ID?.trim() || "7c981abd-85b5-4005-86c0-9cfffd6d9bf1";

/**
 * The helper every new request is routed to right now. Admins switch the active
 * helper from /admin/helpers; falls back to DESIGNATED_HELPER_ID if the read
 * fails so submitting a request can never be blocked by a transient error.
 */
export async function getActiveHelperId(): Promise<string> {
  const supabase = createBrowserClient();
  const { data } = await supabase.rpc("active_helper_id");
  return typeof data === "string" && data.length > 0 ? data : DESIGNATED_HELPER_ID;
}

export interface NewRequestInput {
  title: string;
  description?: string;
  subject?: string;
  deadline?: string | null;
  country?: string;
  files?: File[];
}

export type PendingRequestDraft = {
  service?: string;
  subject?: string;
  level?: string;
  deadlineKey?: string;
  deadline?: string;
  dueTime?: string;
  wordCount?: string;
  details?: string;
};

export function savePendingDraft(draft: PendingRequestDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadPendingDraft(): PendingRequestDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRequestDraft;
  } catch {
    return null;
  }
}

export function clearPendingDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

const DRAFT_FILES_DB = "acadivo:draft-files";
const DRAFT_FILES_STORE = "files";
const DRAFT_FILES_KEY = "pending";

function openDraftStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFT_FILES_DB, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DRAFT_FILES_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readDraftFiles(): Promise<File[]> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return [];
  try {
    const db = await openDraftStore();
    const tx = db.transaction(DRAFT_FILES_STORE, "readonly");
    const request = tx.objectStore(DRAFT_FILES_STORE).get(DRAFT_FILES_KEY);
    return new Promise<File[]>((resolve) => {
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveDraftFiles(files: File[]) {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  try {
    const db = await openDraftStore();
    const tx = db.transaction(DRAFT_FILES_STORE, "readwrite");
    tx.objectStore(DRAFT_FILES_STORE).put(files, DRAFT_FILES_KEY);
  } catch {
    /* best-effort */
  }
}

export async function clearDraftFiles() {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  try {
    const db = await openDraftStore();
    const tx = db.transaction(DRAFT_FILES_STORE, "readwrite");
    tx.objectStore(DRAFT_FILES_STORE).delete(DRAFT_FILES_KEY);
  } catch {
    /* best-effort */
  }
}

/** Restores files saved by the estimate form across the redirect. */
export async function loadDraftFiles(): Promise<File[]> {
  return readDraftFiles();
}

export async function submitRequest(
  input: NewRequestInput,
): Promise<{ id: string } | { error: string }> {
  const supabase = createBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to submit a request." };
  }

  const helperId = await getActiveHelperId();

  const fileUrls: string[] = [];
  for (const file of input.files ?? []) {
    if (file.size === 0) {
      return { error: `${file.name} is empty. Please choose a file that contains content.` };
    }

    let content: ArrayBuffer;
    try {
      content = await file.arrayBuffer();
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      return { error: `We couldn't read ${file.name}.${reason}` };
    }

    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("request-files")
      .upload(path, content, {
        contentType: file.type || "application/octet-stream",
      });
    if (uploadError) {
      return { error: uploadError.message };
    }
    // Store the bare object path: the bucket is private and downloads go
    // through a participant-checked signed URL (/api/files/url).
    fileUrls.push(path);
  }

  const { data, error } = await supabase
    .from("requests")
    .insert({
      student_id: user.id,
      helper_id: helperId,
      title: input.title,
      description: input.description ?? null,
      subject: input.subject ?? null,
      country: input.country ?? null,
      deadline: input.deadline ?? null,
      file_urls: fileUrls,
      status: "requested",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }
  notifyActivity("request.created", data.id);
  return { id: data.id };
}
