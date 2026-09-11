import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { Star, UserCheck } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { setUserStatus } from "@/app/admin/actions";
import EditUserForm from "@/app/admin/components/edit-user-form";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Helpers | PeerCraft Admin",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "outline"> = {
  active: "success",
  suspended: "danger",
  pending: "warning",
};

export default async function AdminHelpersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; clear?: string }>;
}) {
  await requireAdmin();
  const { edit: editId, clear } = await searchParams;

  const { data: users, error } = await adminClient
    .from("users")
    .select("id, name, email, avatar_url, role, status, created_at, profile:helper_profiles(subjects, rating_avg, bio)")
    .eq("role", "helper")
    .order("created_at", { ascending: false })
    .limit(200);

  const editing = !clear && editId ? (users ?? []).find((u) => u.id === editId) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">Helpers</h1>
        <p className="text-on-surface-variant mt-1">Approve, suspend, and manage helper profiles.</p>
      </div>

      {editing && <EditUserForm user={editing} listPath="helpers" />}

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : users && users.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Helper</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Subjects</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Rating</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Joined</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const profile = user.profile as unknown as { subjects?: string[]; rating_avg?: number; bio?: string } | null;
                return (
                  <tr key={user.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name ?? "Helper"} src={user.avatar_url ?? undefined} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-on-surface">{user.name ?? "Unnamed"}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(profile?.subjects ?? []).slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-surface-container-low text-xs text-on-surface-variant">
                            {s}
                          </span>
                        ))}
                        {(profile?.subjects?.length ?? 0) === 0 && <span className="text-xs text-on-surface-variant">No subjects set</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface">
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        {Number(profile?.rating_avg ?? 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_VARIANT[user.status] ?? "outline"}>{user.status ?? "active"}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "pending" && (
                          <form action={setUserStatus}>
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="status" value="active" />
                            <Button size="sm" variant="secondary" type="submit">Approve</Button>
                          </form>
                        )}
                        <form action={setUserStatus}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="status" value={user.status === "suspended" ? "active" : "suspended"} />
                          <Button size="sm" variant={user.status === "suspended" ? "secondary" : "danger"} type="submit">
                            {user.status === "suspended" ? "Activate" : "Suspend"}
                          </Button>
                        </form>
                        <Link href={`/admin/helpers?edit=${user.id}`}>
                          <Button size="sm" variant="outline">Edit</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState
          icon={<UserCheck size={24} className="text-primary" />}
          title="No helpers yet"
          message="Helper accounts will appear here as helpers join the platform."
        />
      )}
    </div>
  );
}