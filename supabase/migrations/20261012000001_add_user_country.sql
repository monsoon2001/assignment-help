-- Approximate display currency: store the user's country on their profile.
--
-- The country is captured from the request IP at sign-up (best-effort) and can
-- be edited on the student profile. It is used ONLY to choose an approximate
-- display currency under CAD quotes; the amount charged is always CAD.

alter table public.users
  add column if not exists country text;

comment on column public.users.country is
  'ISO 3166-1 alpha-2 country. Display-only hint for the approximate currency line; never affects the charged CAD amount.';

-- The "users_are_publicly_visible" (SELECT) and "users_can_update_own_profile"
-- (UPDATE, auth.uid() = id) policies already cover row access, so we only need
-- column-level grants for the new column.
grant select (country) on public.users to anon, authenticated;
grant update (country) on public.users to authenticated;
grant select (country) on public.users to service_role;
grant update (country) on public.users to service_role;

-- ROLLBACK
-- revoke update (country) on public.users from service_role;
-- revoke select (country) on public.users from service_role;
-- revoke update (country) on public.users from authenticated;
-- revoke select (country) on public.users from anon, authenticated;
-- alter table public.users drop column if exists country;
