import { createClient } from "@/lib/supabase/server";
import HelperProfile from "./profile-form";

export const dynamic = "force-dynamic";

export default async function HelperProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
  let email = user?.email ?? "";
  let avatarUrl: string | null = null;
  let bio = "";
  let subjects: string[] = [];
  let hourlyRate = 20;
  let rating = 0;
  let reviewCount = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, email, avatar_url")
      .eq("id", user.id)
      .single();
    if (profile) {
      name = profile.name ?? name;
      email = profile.email ?? email;
      avatarUrl = profile.avatar_url;
    }

    const { data: helperProfile } = await supabase
      .from("helper_profiles")
      .select("bio, subjects, hourly_rate, rating_avg")
      .eq("user_id", user.id)
      .maybeSingle();
    if (helperProfile) {
      bio = helperProfile.bio ?? "";
      subjects = helperProfile.subjects ?? [];
      hourlyRate = Number(helperProfile.hourly_rate ?? 20);
      rating = Number(helperProfile.rating_avg ?? 0);
    }

    const { count } = await supabase
      .from("helper_reviews")
      .select("id", { count: "exact", head: true })
      .eq("helper_id", user.id);
    reviewCount = count ?? 0;
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  return (
    <HelperProfile
      name={name}
      avatarUrl={avatarUrl}
      firstName={firstName}
      lastName={lastName}
      email={email}
      hourlyRate={hourlyRate}
      rating={rating}
      reviewCount={reviewCount}
      initialBio={bio}
      initialSubjects={subjects.length > 0 ? subjects : undefined}
    />
  );
}