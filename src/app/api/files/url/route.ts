import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import {
  isStorageBucket,
  pathFromStoredUrl,
  pathVariants,
  SIGNED_URL_TTL_SECONDS,
  type StorageBucket,
} from "@/lib/signed-files";

export const dynamic = "force-dynamic";

/**
 * Issues a short-lived signed URL for a private storage object AFTER verifying
 * the caller is a participant (uploader, request student/helper, or order
 * student/helper). Buckets are private, so files otherwise 403; nothing here is
 * gated on a public URL existing.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const bucket = url.searchParams.get("bucket");
  const rawPath = url.searchParams.get("path") ?? "";
  const download = url.searchParams.get("download");

  if (!bucket || !isStorageBucket(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }
  // Accepts either a bare object path or a legacy full public URL.
  const path = pathFromStoredUrl(rawPath);
  if (!path) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authorized = await canRead(supabase, user.id, bucket, path);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUrl(
      path,
      SIGNED_URL_TTL_SECONDS,
      download ? { download: download === "1" ? true : download } : undefined,
    );
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }

  return NextResponse.json({ url: data.signedUrl });
}

type ParticipantClient = Awaited<ReturnType<typeof createClient>>;

async function canRead(
  supabase: ParticipantClient,
  userId: string,
  bucket: StorageBucket,
  path: string,
): Promise<boolean> {
  // Uploader's own folder: `<uid>/...` (request-files) or `<orderId>/<uid>/...`
  // (order-files, uploader is the second segment).
  if (bucket === "request-files" && path.startsWith(`${userId}/`)) {
    return true;
  }
  if (bucket === "order-files" && path.split("/")[1] === userId) {
    return true;
  }

  // Attachments referenced by messages the caller can see (RLS already limits
  // these rows to request/order participants).
  const { data: messages } = await supabase
    .from("messages")
    .select("attachment_url, request_id, order_id")
    .not("attachment_url", "is", null);
  if (
    (messages ?? []).some((m) =>
      pathVariants((m as { attachment_url: string }).attachment_url).has(path),
    )
  ) {
    return true;
  }

  if (bucket === "request-files") {
    // Files attached to requests the caller owns or is assigned to.
    const { data: requests } = await supabase
      .from("requests")
      .select("file_urls")
      .or(`student_id.eq.${userId},helper_id.eq.${userId}`);
    if (
      (requests ?? []).some((r) =>
        ((r as { file_urls: string[] }).file_urls ?? []).some((v) => pathVariants(v).has(path)),
      )
    ) {
      return true;
    }
  }

  if (bucket === "order-files") {
    // Files inside the order's folder (deliveries + order-chat attachments) are
    // readable by the order's student or helper.
    const orderId = path.split("/")[0];
    if (orderId) {
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("id", orderId)
        .or(`student_id.eq.${userId},helper_id.eq.${userId}`)
        .maybeSingle();
      if (order) return true;
    }
  }

  return false;
}
