-- Admin audit log: every sensitive admin action is recorded with the acting
-- admin, the action, the target, and JSON details.

create table public.admin_audit_log (
  id         uuid primary key default gen_random_uuid(),
  admin_id   uuid not null references public.users (id) on delete cascade,
  action     text not null,
  target_id  text,
  details    jsonb,
  created_at timestamptz not null default now()
);

create index idx_admin_audit_log_admin on public.admin_audit_log (admin_id, created_at desc);
create index idx_admin_audit_log_target on public.admin_audit_log (target_id);

alter table public.admin_audit_log enable row level security;

-- Only admins may read/write the audit trail. Writes come from server actions
-- via the service-role client (bypassing RLS), so the policy here defends
-- against direct client tampering/reading.
create policy "admin_audit_log_select_admin"
  on public.admin_audit_log for select to authenticated
  using (public.is_admin());

create policy "admin_audit_log_insert_admin"
  on public.admin_audit_log for insert to authenticated
  with check (public.is_admin());

revoke all on public.admin_audit_log from anon;