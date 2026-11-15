import { Mail, Shield } from "lucide-react";
import Card from "@/components/ui/card";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import AdminProfileForm from "./admin-profile-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
  const email = user?.email ?? "";
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, avatar_url")
      .eq("id", user.id)
      .single();
    if (profile) {
      name = profile.name ?? name;
      avatarUrl = profile.avatar_url;
    }
  }

  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  const displayName = name || "Platform Admin";

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">Admin Profile</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Manage your admin account details</p>
      </div>

      <Card className="p-6 flex items-center gap-5">
        <Avatar name={displayName} size="lg" src={avatarUrl ?? undefined} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-bold text-xl text-on-surface">{displayName}</h2>
            <Badge variant="primary">
              <Shield size={12} /> Administrator
            </Badge>
          </div>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
            <Mail size={14} /> {email}
          </p>
        </div>
      </Card>

      <AdminProfileForm firstName={firstName} lastName={lastName} email={email} />
    </div>
  );
}
