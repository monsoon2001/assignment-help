"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AdminProfileResult {
  ok: boolean;
  message: string;
}

export async function saveAdminProfile(
  _prev: AdminProfileResult,
  formData: FormData,
): Promise<AdminProfileResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (!fullName) return { ok: false, message: "Enter your name." };

  // Only the signed-in admin's own name is updated. Role, status and email are
  // left untouched, so this cannot change anyone else's account.
  const { error } = await supabase.from("users").update({ name: fullName }).eq("id", user.id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/profile");
  return { ok: true, message: "Profile saved." };
}
