-- Security hardening pass: RLS policies, role escalation fixes, validation,
-- and rate limiting.
--
-- Key changes:
--  * users table no longer exposes full rows publicly (email/status hidden).
--  * signup can NEVER self-assign a privileged role (handle_new_user ignores
--    client-supplied `role` metadata).
--  * column-level grants stop users tampering with their own role/status.
--  * admins get explicit read/write policies on every business table.
--  * financial/ownership columns on orders are frozen for participants.
--  * server-side length CHECKs + per-table insert rate limiting.
--  * storage buckets become private with participant-scoped reads.

-- ============================================================================
-- 1. Admin helper used by the RLS policies below.
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

-- ============================================================================
-- 2. users table: restrict what non-admins can see and change.
-- ============================================================================
revoke all on table public.users from anon, authenticated;

-- Everyone may read the public marketing/profile columns. `role` is included so
-- public helper listings and role-based routing keep working; email, status and
-- raw account metadata are NOT readable by anyone but the row owner via direct
-- session reads (see the update POLICY below which keeps role/status frozen).
grant select (id, name, avatar_url, role, institution, level_of_study, created_at, updated_at)
  on public.users to anon, authenticated;
grant update (name, avatar_url, institution, level_of_study)
  on public.users to authenticated;

drop policy if exists "users_are_publicly_visible" on public.users;
drop policy if exists "users_can_update_own_profile" on public.users;

-- Public browsing + participant display names, limited to the granted columns.
create policy "users_select_public_profiles"
  on public.users for select
  using (true);

-- Admins can read everything through the regular (non-service-role) client too.
create policy "users_select_admin"
  on public.users for select to authenticated
  using (public.is_admin());

-- A user may update their own profile but can never change role, status or the
-- id/email. The with-check re-asserts role/status against the stored row so an
-- attacker cannot promote themselves even through a column the role owns.
create policy "users_update_own_profile"
  on public.users for update to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.users where id = auth.uid())
    and status = (select status from public.users where id = auth.uid())
    and email = (select email from public.users where id = auth.uid())
  );

-- Never trust a role supplied in signup metadata: everyone starts as a student,
-- and is promoted/changed only by an admin (server-side).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url',
    'student'::public.user_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ============================================================================
-- 3. Rate limiting primitives (DB-backed, usable from middleware + RLS).
-- ============================================================================
create table if not exists public.request_rate_limits (
  key      text primary key,
  attempts bigint not null default 0,
  reset_at timestamptz not null default now()
);

alter table public.request_rate_limits enable row level security;
revoke all on table public.request_rate_limits from anon, authenticated;

create or replace function public.rate_limit_ok(
  p_key text,
  p_max bigint,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempts bigint;
begin
  insert into public.request_rate_limits as t (key, attempts, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set attempts = case
          when t.reset_at <= now() then 1
          else t.attempts + 1
        end,
        reset_at = case
          when t.reset_at <= now() then excluded.reset_at
          else t.reset_at
        end
  returning attempts into v_attempts;

  return coalesce(v_attempts, 0) <= p_max;
end;
$$;

revoke all on function public.rate_limit_ok(text, bigint, integer) from public;
grant execute on function public.rate_limit_ok(text, bigint, integer) to anon, authenticated;

-- ============================================================================
-- 4. requests: length checks, hardened insert, admin access.
-- ============================================================================
alter table public.requests
  drop constraint if exists requests_title_length_ck,
  drop constraint if exists requests_description_length_ck,
  add constraint requests_title_length_ck check (char_length(title) between 1 and 300),
  add constraint requests_description_length_ck check (description is null or char_length(description) <= 8000);

drop policy if exists "students_can_manage_own_requests" on public.requests;

-- Insert: own request, targeted at a REAL helper, freshly created, rate-limited.
create policy "students_can_create_requests"
  on public.requests for insert to authenticated
  with check (
    auth.uid() = student_id
    and status = 'requested'
    and helper_id is not null
    and exists (select 1 from public.users u where u.id = helper_id and u.role = 'helper')
    and (select count(*) from public.requests r
         where r.student_id = auth.uid()
           and r.created_at > now() - interval '1 minute') < 10
  );

create policy "students_can_update_own_requests"
  on public.requests for update to authenticated
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "students_can_delete_own_requests"
  on public.requests for delete to authenticated
  using (auth.uid() = student_id);

-- Helpers can see/advance only the requests explicitly assigned to them.
drop policy if exists "helpers_can_view_assigned_requests" on public.requests;
create policy "helpers_can_view_assigned_requests"
  on public.requests for select
  using (helper_id = auth.uid());

-- (helpers_can_advance_request_status from earlier migrations is retained.)

create policy "requests_select_admin" on public.requests for select to authenticated using (public.is_admin());
create policy "requests_update_admin" on public.requests for update to authenticated using (public.is_admin());

-- ============================================================================
-- 5. proposals: price/description checks, rate limit, admin access.
-- ============================================================================
alter table public.proposals
  drop constraint if exists proposals_price_positive_ck,
  drop constraint if exists proposals_description_length_ck,
  add constraint proposals_price_positive_ck check (price > 0),
  add constraint proposals_description_length_ck check (description is null or char_length(description) <= 4000);

drop policy if exists "helpers_can_create_proposals_for_assigned_requests" on public.proposals;
create policy "helpers_can_create_proposals_for_assigned_requests"
  on public.proposals for insert to authenticated
  with check (
    auth.uid() = helper_id
    and exists (
      select 1 from public.requests r
      where r.id = proposals.request_id
        and r.helper_id = auth.uid()
        and r.status in ('requested', 'proposal_sent')
    )
    and (select count(*) from public.proposals p
         where p.helper_id = auth.uid()
           and p.created_at > now() - interval '1 minute') < 20
  );

create policy "proposals_select_admin" on public.proposals for select to authenticated using (public.is_admin());
create policy "proposals_update_admin" on public.proposals for update to authenticated using (public.is_admin());

-- ============================================================================
-- 6. orders: freeze financial/assignment columns for participants, admin access.
-- ============================================================================
drop policy if exists "order_participants_can_update" on public.orders;
create policy "order_participants_can_update"
  on public.orders for update to authenticated
  using (auth.uid() = student_id or auth.uid() = helper_id)
  with check (
    (auth.uid() = student_id or auth.uid() = helper_id)
    and price = (select price from public.orders where id = orders.id)
    and currency = (select currency from public.orders where id = orders.id)
    and helper_id = (select helper_id from public.orders where id = orders.id)
    and student_id = (select student_id from public.orders where id = orders.id)
    and proposal_id = (select proposal_id from public.orders where id = orders.id)
  );

create policy "orders_select_admin" on public.orders for select to authenticated using (public.is_admin());
create policy "orders_update_admin" on public.orders for update to authenticated using (public.is_admin());

-- ============================================================================
-- 7. messages: length cap, insert rate limit, admin access.
-- ============================================================================
alter table public.messages
  drop constraint if exists messages_body_length_ck,
  add constraint messages_body_length_ck check (char_length(body) between 1 and 4000);

drop policy if exists "order_participants_can_send_messages" on public.messages;
drop policy if exists "request_participants_can_send_messages" on public.messages;

create policy "order_participants_can_send_messages"
  on public.messages for insert to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = messages.order_id
        and (o.student_id = auth.uid() or o.helper_id = auth.uid())
        and auth.uid() = sender_id
    )
    and (select count(*) from public.messages m
         where m.sender_id = auth.uid()
           and m.created_at > now() - interval '1 minute') < 60
  );

create policy "request_participants_can_send_messages"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.requests r
      where r.id = messages.request_id
        and (r.student_id = auth.uid() or r.helper_id = auth.uid())
    )
    and (select count(*) from public.messages m
         where m.sender_id = auth.uid()
           and m.created_at > now() - interval '1 minute') < 60
  );

create policy "messages_select_admin" on public.messages for select to authenticated using (public.is_admin());
create policy "messages_update_admin" on public.messages for update to authenticated using (public.is_admin());

-- ============================================================================
-- 8. reviews / deliveries / payments / notifications / helper_profiles / chats.
-- ============================================================================
alter table public.reviews
  drop constraint if exists reviews_comment_length_ck,
  add constraint reviews_comment_length_ck check (comment is null or char_length(comment) <= 2000);

create policy "reviews_select_admin" on public.reviews for select to authenticated using (public.is_admin());

create policy "deliveries_select_admin" on public.deliveries for select to authenticated using (public.is_admin());
create policy "deliveries_update_admin" on public.deliveries for update to authenticated using (public.is_admin());

create policy "payments_select_admin" on public.payments for select to authenticated using (public.is_admin());
create policy "payments_update_admin" on public.payments for update to authenticated using (public.is_admin());

-- Webhook idempotency: one payment record per Stripe payment intent, even if a
-- webhook is delivered more than once or races with another delivery.
create unique index if not exists payments_stripe_payment_intent_key
  on public.payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table public.notifications
  drop constraint if exists notifications_message_length_ck,
  add constraint notifications_message_length_ck check (char_length(message) between 1 and 500);

drop policy if exists "notifications_users_can_update_own" on public.notifications;
create policy "notifications_users_can_update_own"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications_select_admin" on public.notifications for select to authenticated using (public.is_admin());
create policy "notifications_update_admin" on public.notifications for update to authenticated using (public.is_admin());

alter table public.helper_profiles
  drop constraint if exists helper_profiles_bio_length_ck,
  add constraint helper_profiles_bio_length_ck check (bio is null or char_length(bio) <= 2000);

create policy "helper_profiles_select_admin" on public.helper_profiles for select to authenticated using (public.is_admin());
create policy "helper_profiles_update_admin" on public.helper_profiles for update to authenticated using (public.is_admin());

alter table public.admin_messages
  drop constraint if exists admin_messages_body_length_ck,
  add constraint admin_messages_body_length_ck check (char_length(body) between 1 and 4000);

create policy "admin_messages_select_admin" on public.admin_messages for select to authenticated using (public.is_admin());

alter table public.deliveries
  drop constraint if exists deliveries_message_length_ck,
  add constraint deliveries_message_length_ck check (message is null or char_length(message) <= 4000);

create policy "call_logs_select_admin" on public.call_logs for select to authenticated using (public.is_admin());

-- chat_flags was missing request_id / order_id columns that the admin
-- chat-monitor action already writes.
alter table public.chat_flags
  add column if not exists request_id uuid references public.requests (id) on delete cascade,
  add column if not exists order_id uuid references public.orders (id) on delete cascade;

-- ============================================================================
-- 9. Storage: private buckets, size/MIME cap, participant-scoped reads.
-- ============================================================================
update storage.buckets
set public = false,
    file_size_limit = 26214400,
    allowed_mime_types = array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp'
    ]
where id in ('request-files', 'order-files');

drop policy if exists "request_files_public_read" on storage.objects;
drop policy if exists "order_files_public_read" on storage.objects;

-- request-files: an owner, a request participant, or a request-chat participant
-- may read an object. Uploaded paths now match the stored path (the private
-- bucket URL is generated with a signed URL).
create policy "request_files_participant_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'request-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.requests r
        where r.helper_id = auth.uid()
          and name = any(r.file_urls)
      )
      or exists (
        select 1 from public.requests r
        where r.student_id = auth.uid()
          and name = any(r.file_urls)
      )
      or exists (
        select 1 from public.messages m
        join public.requests r on r.id = m.request_id
        where m.attachment_url = name
          and (r.student_id = auth.uid() or r.helper_id = auth.uid())
      )
    )
  );

-- order-files: participants of the order (first path segment) or the uploader.
create policy "order_files_participant_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'order-files'
    and (
      exists (
        select 1 from public.orders o
        where o.id::text = (storage.foldername(name))[1]
          and (o.student_id = auth.uid() or o.helper_id = auth.uid())
      )
      or (storage.foldername(name))[2] = auth.uid()::text
    )
  );

-- ============================================================================
-- 10. anon/authenticated cannot write to the transactional tables directly.
-- ============================================================================
revoke insert, update, delete on public.requests, public.proposals, public.orders,
  public.messages, public.deliveries, public.reviews, public.payments,
  public.notifications, public.helper_profiles, public.admin_messages,
  public.call_logs, public.chat_flags, public.user_warnings, public.users
  from anon;