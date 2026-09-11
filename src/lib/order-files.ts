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

  const path = `${orderId}/${user.id}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("order-files").upload(path, file);
  if (error) {
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from("order-files").getPublicUrl(path);
  return data.publicUrl;
}

export async function formatBytes(bytes: number): Promise<string> {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}