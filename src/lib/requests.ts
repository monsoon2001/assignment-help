import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

const DRAFT_KEY = "acadivo:pending-request";

export interface NewRequestInput {
  title: string;
  description?: string;
  subject?: string;
  deadline?: string | null;
  country?: string;
  files?: File[];
  helper_id?: string;
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
  if (!input.helper_id) {
    return { error: "Choose a helper to send this request to." };
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
    const { data: publicUrl } = supabase.storage
      .from("request-files")
      .getPublicUrl(path);
    fileUrls.push(publicUrl?.publicUrl ?? path);
  }

  const { data, error } = await supabase
    .from("requests")
    .insert({
      student_id: user.id,
      helper_id: input.helper_id,
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

export async function reassignRequest(
  requestId: string,
  helperId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = createBrowserClient();

  const { error } = await supabase
    .from("requests")
    .update({ helper_id: helperId, status: "requested" })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }
  return { ok: true };
}

export type HelperCandidate = {
  user_id: string;
  rating_avg: number;
  bio: string | null;
  subjects: string[];
  hourly_rate: number | null;
  user: { id: string; name: string | null; avatar_url: string | null } | null;
};

type HelperProfileRow = {
  user_id: string;
  rating_avg: number | null;
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
  user:
    | { id: string; name: string | null; avatar_url: string | null }
    | { id: string; name: string | null; avatar_url: string | null }[]
    | null;
};

/**
 * Loads every helper account from `users` and attaches the `helper_profiles` row
 * when one exists. The account list has to be the source of truth: helpers who
 * signed in with Google and never finished the profile step have no
 * `helper_profiles` row, and querying that table alone hid them completely.
 * Subject matching happens in code so it is case-insensitive and forgiving, and
 * when nothing matches the full list is returned so a student is never stuck.
 *
 * Pass a server Supabase client to fetch during SSR / in a Server Component;
 * by default it uses the browser client.
 */
export async function fetchHelperCandidates(
  subject?: string | null,
  supabase?: SupabaseClient | null
): Promise<{ helpers: HelperCandidate[]; exactMatch: boolean } | { error: string }> {
  const client = supabase ?? createBrowserClient();

  const { data: userRows, error } = await client
    .from("users")
    .select("id, name, avatar_url")
    .eq("role", "helper")
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    return { error: error.message };
  }

  const helperUsers = (userRows ?? []) as { id: string; name: string | null; avatar_url: string | null }[];

  const { data: profileRows } = helperUsers.length
    ? await client
        .from("helper_profiles")
        .select("user_id, rating_avg, bio, subjects, hourly_rate")
        .in(
          "user_id",
          helperUsers.map((u) => u.id)
        )
    : { data: null };

  const profiles = new Map<string, HelperProfileRow>();
  for (const row of (profileRows ?? []) as unknown as HelperProfileRow[]) {
    profiles.set(row.user_id, row);
  }

  const seenNames = new Set<string>();
  const all: HelperCandidate[] = helperUsers
    // The same person can own more than one helper account (e.g. a Google
    // sign-in alongside an email one), so each name is listed once.
    .filter((user) => {
      const key = (user.name ?? "").trim().toLowerCase();
      if (!key) return true;
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    })
    .map((user) => {
      const profile = profiles.get(user.id);
      return {
        user_id: user.id,
        user: { id: user.id, name: user.name, avatar_url: user.avatar_url },
        rating_avg: Number(profile?.rating_avg ?? 0),
        bio: profile?.bio ?? null,
        subjects: profile?.subjects ?? [],
        hourly_rate: profile?.hourly_rate ?? null,
      };
    });

  // Helpers with a filled profile first, best rated at the top.
  all.sort((a, b) => {
    const rated = Number(b.subjects.length > 0) - Number(a.subjects.length > 0);
    if (rated !== 0) return rated;
    if (b.rating_avg !== a.rating_avg) return b.rating_avg - a.rating_avg;
    return (a.user?.name ?? "").localeCompare(b.user?.name ?? "");
  });

  const needle = subject?.trim().toLowerCase();
  if (!needle) {
    return { helpers: all, exactMatch: true };
  }

  const scored = all
    .map((helper) => {
      const subjects = helper.subjects.map((s) => s.trim().toLowerCase());
      const exact = subjects.some((s) => s === needle);
      const partial = subjects.some((s) => s.includes(needle) || needle.includes(s));
      return { helper, exact, partial };
    })
    .filter((entry) => entry.exact || entry.partial)
    // Exact subject matches first, then the highest rated.
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.helper.rating_avg - a.helper.rating_avg);

  if (scored.length === 0) {
    return { helpers: all, exactMatch: false };
  }

  return { helpers: scored.map((entry) => entry.helper), exactMatch: true };
}
