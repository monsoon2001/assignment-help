import { createClient } from "@/lib/supabase/server";
import StudentProfileForm from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
  let email = user?.email ?? "";
  let avatarUrl: string | null = null;
  let memberSince: number | null = null;
  let institution = "";
  let levelOfStudy = "";

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, email, avatar_url, created_at, institution, level_of_study")
      .eq("id", user.id)
      .single();
    if (profile) {
      name = profile.name ?? name;
      email = profile.email ?? email;
      avatarUrl = profile.avatar_url;
      memberSince = new Date(profile.created_at).getFullYear();
      institution = profile.institution ?? "";
      levelOfStudy = profile.level_of_study ?? "";
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
      memberSince={memberSince}
    />
  );
}