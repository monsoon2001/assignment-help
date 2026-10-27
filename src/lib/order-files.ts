import { createClient } from "@/lib/supabase/client";

export async function uploadOrderFile(
  orderId: string,
  file: File
): Promise<string> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be signed in.");
  }
  if (file.size === 0) {
    throw new Error(`${file.name} is empty. Choose a file that contains content.`);
  }

  let content: ArrayBuffer;
  try {
    content = await file.arrayBuffer();
  } catch (error) {
    const reason = error instanceof Error ? ` ${error.message}` : "";
    throw new Error(`We couldn't read ${file.name}.${reason}`);
  }

  const path = `${orderId}/${user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("order-files").upload(path, content, {
    contentType: file.type || "application/octet-stream",
  });
  if (error) {
    throw new Error(error.message);
  }
  // Store the bare object path: the bucket is private and downloads go through
  // a participant-checked signed URL (/api/files/url).
  return path;
}

export async function formatBytes(bytes: number): Promise<string> {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}