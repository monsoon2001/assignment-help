import { createClient } from "@/lib/supabase/server";
import HelperProfile from "./profile-form";

export const dynamic = "force-dynamic";

export default async function HelperProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
  const email = user?.email ?? "";
  // Fall back to the Google/OAuth profile photo in auth metadata when the users
  // row has no avatar yet, so the helper always sees their real picture here.
  const metaAvatar =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;
  let avatarUrl: string | null = metaAvatar;
  let bio = "";
  let hourlyRate = 20;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, avatar_url")
      .eq("id", user.id)
      .single();
    if (profile) {
      name = profile.name ?? name;
      avatarUrl = profile.avatar_url ?? metaAvatar;
    }

    const { data: helperProfile } = await supabase
      .from("helper_profiles")
      .select("bio, hourly_rate")
      .eq("user_id", user.id)
      .maybeSingle();
    if (helperProfile) {
      bio = helperProfile.bio ?? "";
      hourlyRate = Number(helperProfile.hourly_rate ?? 20);
    }
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
      initialBio={bio}
    />
  );
}
