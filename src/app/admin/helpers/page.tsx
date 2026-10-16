import Link from "next/link";
import type { Metadata } from "next";
import Card from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import Avatar from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { Crown, UserCheck, Users } from "lucide-react";
import { requireAdmin, adminClient } from "@/lib/admin";
import { setUserStatus } from "@/app/admin/actions";
import { userStatusTone } from "@/lib/status-meta";
import EditUserForm from "@/app/admin/components/edit-user-form";
import ActiveHelperRadio from "@/app/admin/components/active-helper-radio";
import { EmptyState } from "@/components/ui/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Helpers | Acadivo Admin",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminHelpersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; clear?: string }>;
}) {
  await requireAdmin();
  const { edit: editId, clear } = await searchParams;

  const [{ data: users, error }, { data: settings }] = await Promise.all([
    adminClient
      .from("users")
      .select("id, name, email, avatar_url, role, status, created_at")
      .eq("role", "helper")
      .order("created_at", { ascending: false })
      .limit(200),
    adminClient.from("platform_settings").select("active_helper_id").eq("id", true).maybeSingle(),
  ]);

  const activeHelperId = settings?.active_helper_id ?? null;
  const helpers = users ?? [];
  const activeHelper = helpers.find((u) => u.id === activeHelperId) ?? null;
  const editing = !clear && editId ? helpers.find((u) => u.id === editId) : null;
  const pendingCount = helpers.filter((u) => u.status === "pending").length;
  const activeCount = helpers.filter((u) => u.status === "active").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Helpers</h1>
          <p className="text-on-surface-variant mt-1">Approve, suspend, and manage helper profiles.</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge tone="green">{activeCount} active</StatusBadge>
          {pendingCount > 0 && <StatusBadge tone="blueStrong">{pendingCount} pending</StatusBadge>}
        </div>
      </div>

      {/* Routing control — the single helper every new request is sent to. */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between bg-primary-tint/60">
          <div className="flex items-center gap-4 min-w-0">
            <span className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
              <Crown size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Active helper · request routing</p>
              {activeHelper ? (
                <div className="mt-0.5 flex items-center gap-2 min-w-0">
                  <Avatar name={activeHelper.name ?? "Helper"} src={activeHelper.avatar_url ?? undefined} role="helper" size="sm" />
                  <p className="font-display font-semibold text-on-surface truncate">
                    {activeHelper.name ?? "Unnamed helper"}
                  </p>
                  <StatusBadge tone="green">Receiving requests</StatusBadge>
                </div>
              ) : (
                <p className="font-display font-semibold text-on-surface mt-0.5">No active helper set</p>
              )}
              <p className="text-sm text-on-surface-variant mt-1">
                Every new student request is routed to this helper. Switch it when one helper is unavailable.
              </p>
            </div>
          </div>
          {activeHelper && !editing && (
            <span className="text-xs text-on-surface-variant sm:text-right shrink-0">{activeHelper.email}</span>
          )}
        </div>
      </Card>

      {editing && <EditUserForm user={editing} listPath="helpers" />}

      {error ? (
        <Card className="p-6 text-sm text-error">{error.message}</Card>
      ) : helpers.length > 0 ? (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Helper</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Active helper</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Joined</th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 sm:px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {helpers.map((user) => {
                const isActive = user.id === activeHelperId;
                return (
                  <tr
                    key={user.id}
                    className={`border-b border-outline-variant/20 last:border-0 transition-colors ${
                      isActive ? "bg-primary-tint/40" : "hover:bg-surface-container-low/50"
                    }`}
                  >
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name ?? "Helper"} src={user.avatar_url ?? undefined} role="helper" size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-on-surface truncate">{user.name ?? "Unnamed"}</p>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary-container text-on-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0">
                                <Crown size={10} />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <ActiveHelperRadio helperId={user.id} active={isActive} />
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-on-surface-variant">{formatDate(user.created_at)}</td>
                    <td className="px-3 sm:px-6 py-4">
                      <StatusBadge tone={userStatusTone(user.status)}>{user.status ?? "active"}</StatusBadge>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
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
                            {user.status === "suspended" ? "Unsuspend" : "Suspend"}
                          </Button>
                        </form>
                        <Link href={`/admin/helpers?edit=${user.id}`}>
                          <Button size="sm" variant="ghost" type="button">Edit</Button>
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
          message="Helper accounts appear here so you can approve them and choose who receives new requests."
          actionHref="/admin/students"
          actionLabel="View students"
        />
      )}

      {helpers.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Users size={13} className="text-primary" />
          {helpers.length} helper account{helpers.length === 1 ? "" : "s"} total. The active helper receives all new requests.
        </p>
      )}
    </div>
  );
}
