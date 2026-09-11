import { createClient } from "@/lib/supabase/client";

const DRAFT_KEY = "peercraft:pending-request";

export interface NewRequestInput {
  title: string;
  description?: string;
  subject?: string;
  deadline?: string | null;
  files?: File[];
  helper_id?: string;
}

export type PendingRequestDraft = {
  service?: string;
  subject?: string;
  level?: string;
  deadlineKey?: string;
  deadline?: string;
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

export async function submitRequest(
  input: NewRequestInput
): Promise<{ id: string } | { error: string }> {
  const supabase = createClient();

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
  const supabase = createClient();

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
  user: { id: string; name: string | null; avatar_url: string | null } | null;
};

export async function fetchHelperCandidates(
  subject?: string | null
): Promise<{ helpers: HelperCandidate[] } | { error: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, name, avatar_url, helper_profiles(user_id, rating_avg, bio, subjects)")
    .eq("role", "helper")
    .order("name", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  const raw = (data ?? []) as unknown as {
    id: string;
    name: string | null;
    avatar_url: string | null;
    helper_profiles:
      | { user_id: string; rating_avg: number; bio: string | null; subjects: string[] }[]
      | { user_id: string; rating_avg: number; bio: string | null; subjects: string[] }
      | null;
  }[];

  const helpers: HelperCandidate[] = raw.map((u) => {
    const profile = Array.isArray(u.helper_profiles)
      ? (u.helper_profiles[0] ?? null)
      : (u.helper_profiles ?? null);
    return {
      user_id: u.id,
      user: { id: u.id, name: u.name, avatar_url: u.avatar_url },
      rating_avg: profile?.rating_avg ?? 0,
      bio: profile?.bio ?? null,
      subjects: profile?.subjects ?? [],
    };
  });

  const needle = (subject ?? "").trim();
  if (!needle) return { helpers };

  const primary = needle.split(/\s+/)[0].toLowerCase();
  const matches = helpers.filter(
    (h) =>
      h.subjects.some(
        (s) =>
          s.toLowerCase().includes(needle.toLowerCase()) ||
          needle.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(primary)
      )
  );

  return { helpers: matches.length > 0 ? matches : helpers };
}