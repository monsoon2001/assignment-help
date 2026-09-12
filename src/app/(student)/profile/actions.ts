"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface StudentProfileResult {
  ok: boolean;
  message: string;
}

export async function saveStudentProfile(
  _prev: StudentProfileResult,
  formData: FormData
): Promise<StudentProfileResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const institution = String(formData.get("institution") ?? "").trim();
  const level = String(formData.get("levelOfStudy") ?? "").trim();

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const updates: Record<string, unknown> = {};
  if (fullName) updates.name = fullName;
  updates.institution = institution || null;
  updates.level_of_study = level || null;

  const { error } = await supabase.from("users").update(updates).eq("id", user.id);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile saved." };
}