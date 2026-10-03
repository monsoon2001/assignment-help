import { adminClient } from "@/lib/supabase/admin";

/**
 * Record a sensitive admin action in the audit trail. Call from server actions
 * after requireAdmin() has verified the acting user is an admin. Uses the
 * service-role client so RLS (which would otherwise hide rows) never interferes.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  targetId?: string | null,
  details?: Record<string, unknown> | null
): Promise<void> {
  if (!adminId) return;
  try {
    await adminClient.from("admin_audit_log").insert({
      admin_id: adminId,
      action,
      target_id: targetId ?? null,
      details: details && Object.keys(details).length > 0 ? details : null,
    });
  } catch (err) {
    // Audit logging must never block the admin action it records.
    console.error("admin_audit_log insert failed", err);
  }
}