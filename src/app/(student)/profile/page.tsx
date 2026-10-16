import { createClient } from "@/lib/supabase/server";
import StudentProfileForm from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
  const email = user?.email ?? "";
  // Google/OAuth accounts carry the real profile photo in auth metadata. Fall
  // back to it when the users row has not been backfilled yet, and persist it so
  // every other surface picks it up too.
  const metaAvatar =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;
  let avatarUrl: string | null = metaAvatar;
  let memberSince: number | null = null;
  let institution = "";
  let levelOfStudy = "";
  let country = "";

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, avatar_url, created_at, institution, level_of_study, country")
      .eq("id", user.id)
      .single();
    if (profile) {
      name = profile.name ?? name;
      avatarUrl = profile.avatar_url ?? metaAvatar;
      memberSince = new Date(profile.created_at).getFullYear();
      institution = profile.institution ?? "";
      levelOfStudy = profile.level_of_study ?? "";
      country = profile.country ?? "";

      if (!profile.avatar_url && metaAvatar) {
        await supabase.from("users").update({ avatar_url: metaAvatar }).eq("id", user.id);
      }
    }
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  return (
    <StudentProfileForm
      name={name}
      email={email}
      avatarUrl={avatarUrl}
      firstName={firstName}
      lastName={lastName}
      institution={institution}
      levelOfStudy={levelOfStudy}
      country={country}
      memberSince={memberSince}
    />
  );
}