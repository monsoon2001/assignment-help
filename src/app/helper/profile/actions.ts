"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface HelperProfileResult {
  ok: boolean;
  message: string;
}

export async function saveHelperProfile(
  _prev: HelperProfileResult,
  formData: FormData
): Promise<HelperProfileResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const hourlyRate = Number(formData.get("hourlyRate"));
  const subjects = formData
    .getAll("subjects")
    .map((s) => String(s).trim())
    .filter(Boolean);

  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  const updates: Record<string, unknown> = {};
  if (fullName) updates.name = fullName;
  if (bio) updates.bio = bio;
  if (Number.isFinite(hourlyRate) && hourlyRate >= 0) {
    updates.hourly_rate = hourlyRate;
  }

  const { error: helperError } = await supabase
    .from("helper_profiles")
    .update({
      bio: bio ? bio : null,
      subjects,
      hourly_rate: Number.isFinite(hourlyRate) && hourlyRate >= 0 ? hourlyRate : 20,
    })
    .eq("user_id", user.id);

  if (helperError) return { ok: false, message: helperError.message };

  if (Object.keys(updates).length > 0) {
    const { error: userError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);
    if (userError) return { ok: false, message: userError.message };
  }

  revalidatePath("/helper/profile");
  revalidatePath(`/helpers/${user.id}`);
  revalidatePath("/browse-helpers");
  return { ok: true, message: "Profile saved." };
}