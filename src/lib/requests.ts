import { createClient as createBrowserClient } from "@/lib/supabase/client";

const DRAFT_KEY = "acadivo:pending-request";

/**
 * The platform routes every new task request to a single designated helper
 * account. Students no longer browse or choose a helper. Override the account
 * with NEXT_PUBLIC_DESIGNATED_HELPER_ID (the default is Sanchita Acharya /
 * sanchitaa286@gmail.com).
 */
export const DESIGNATED_HELPER_ID =
  process.env.NEXT_PUBLIC_DESIGNATED_HELPER_ID?.trim() ||
  "7c981abd-85b5-4005-86c0-9cfffd6d9bf1";

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
  input: NewRequestInput
): Promise<{ id: string } | { error: string }> {
  const supabase = createBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to submit a request." };
  }

  const fileUrls: string[] = [];
  for (const file of input.files ?? []) {
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("request-files")
      .upload(path, file);
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
      helper_id: DESIGNATED_HELPER_ID,
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
  return { id: data.id };
}
