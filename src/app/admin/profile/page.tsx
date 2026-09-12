import { Mail, Shield, GraduationCap } from "lucide-react";
import Card from "@/components/ui/card";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "";
  let email = user?.email ?? "";
  let avatarUrl: string | null = null;

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
            <Badge variant="primary"><Shield size={12} /> Administrator</Badge>
          </div>
          <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
            <Mail size={14} /> {email}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold text-on-surface mb-1">Account Information</h3>
        <p className="text-xs text-on-surface-variant mb-5">Your identity is verified. Email cannot be changed.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" defaultValue={firstName} />
          <Input label="Last Name" defaultValue={lastName} />
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-on-surface">Email</label>
            <div className="w-full h-11 flex items-center px-3.5 gap-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface-variant">
              <Mail size={16} className="shrink-0 text-on-surface-variant" />
              <span className="truncate">{email || "—"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-5 pt-5 border-t border-outline-variant">
          <GraduationCap size={15} className="text-primary shrink-0" />
          <p className="text-xs text-on-surface-variant">
            Admin credentials are provisioned by the platform team. Contact your setup owner for any account changes.
          </p>
        </div>
        <Button className="mt-4">Save Changes</Button>
      </Card>
    </div>
  );
}