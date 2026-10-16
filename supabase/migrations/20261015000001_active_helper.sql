-- Active helper routing.
--
-- The platform routes every new task request to a single "active" helper
-- account. Admins switch which helper is active from /admin/helpers so that if
-- one helper is unavailable, all new requests go to the other one.
--
-- The chosen helper id lives on the admin-only platform_settings row. Student
-- clients cannot read that table directly (it is revoked from anon/authenticated),
-- so a SECURITY DEFINER function exposes just the single uuid they need to
-- target a request at.
--
-- All statements are idempotent. A ROLLBACK block is at the bottom.

-- ============================================================================
-- 1. Which helper receives new requests.
-- ============================================================================
alter table public.platform_settings
  add column if not exists active_helper_id uuid references public.users (id) on delete set null;

-- Default to the currently designated helper so behaviour is unchanged until an
-- admin switches it.
update public.platform_settings
set active_helper_id = coalesce(active_helper_id, '7c981abd-85b5-4005-86c0-9cfffd6d9bf1'),
    updated_at = now()
where id = true;

comment on column public.platform_settings.active_helper_id is
  'Helper account that receives every new request. Set from /admin/helpers.';

-- ============================================================================
-- 2. Public read path: the active helper id, and nothing else from the table.
-- ============================================================================
create or replace function public.active_helper_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select active_helper_id from public.platform_settings where id = true;
$$;

revoke all on function public.active_helper_id() from public;
grant execute on function public.active_helper_id() to anon, authenticated, service_role;

-- ============================================================================
-- ROLLBACK (run manually to revert this migration)
-- ----------------------------------------------------------------------------
-- drop function if exists public.active_helper_id();
-- alter table public.platform_settings drop column if exists active_helper_id;
-- ============================================================================
