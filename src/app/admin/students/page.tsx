import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { User } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { setUserStatus } from "@/app/admin/actions";
import EditUserForm from "@/app/admin/components/edit-user-form";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Students | PeerCraft Admin",
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

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; clear?: string }>;
}) {
  await requireAdmin();
  const { edit: editId, clear } = await searchParams;

  const { data: users, error } = await adminClient
    .from("users")
    .select("id, name, email, avatar_url, role, status, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(200);

  const editing = !clear && editId ? (users ?? []).find((u) => u.id === editId) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">Students</h1>
        <p className="text-on-surface-variant mt-1">Manage student accounts and approvals.</p>
      </div>

      {editing && <EditUserForm user={editing} listPath="students" />}

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : users && users.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Joined</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name ?? "Student"} src={user.avatar_url ?? undefined} size="sm" />
                      <span className="text-sm font-medium text-on-surface">{user.name ?? "Unnamed"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_VARIANT[user.status] ?? "outline"}>
                      {user.status ?? "active"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <form action={setUserStatus}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="status" value={user.status === "suspended" ? "active" : "suspended"} />
                        <Button size="sm" variant={user.status === "suspended" ? "secondary" : "danger"} type="submit">
                          {user.status === "suspended" ? "Activate" : "Suspend"}
                        </Button>
                      </form>
                      <Link href={`/admin/students?edit=${user.id}`}>
                        <Button size="sm" variant="outline">Edit</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState
          icon={<User size={24} className="text-primary" />}
          title="No students yet"
          message="Student accounts will appear here as people sign up."
        />
      )}
    </div>
  );
}