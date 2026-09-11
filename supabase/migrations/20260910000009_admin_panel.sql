-- Phase 8: Admin panel
--  * users.status lets admins approve / suspend accounts
--  * handle_new_user now reads the signup role from user metadata
--  * admin_messages is a standalone realtime chat channel (not tied to an order)

-- 1. Account status for approve / suspend flows.
alter table public.users
  add column status text not null default 'active'
  check (status in ('active', 'suspended', 'pending'));

-- 2. Respect the role provided at signup (so helper/admin accounts can exist).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  v_role := coalesce(
    (new.raw_user_meta_data ->> 'role')::public.user_role,
    'student'::public.user_role
  );

  insert into public.users (id, email, name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url',
    v_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3. Admin <-> helper support channel (standalone from order chat).
create table public.admin_messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.users (id) on delete cascade,
  recipient_id uuid not null references public.users (id) on delete cascade,
  body         text not null,
  created_at   timestamptz not null default now()
);

create index idx_admin_messages_sender on public.admin_messages (sender_id, created_at);
create index idx_admin_messages_recipient on public.admin_messages (recipient_id, created_at);

alter table public.admin_messages enable row level security;

-- Only the two people involved in a conversation can read it.
create policy "admin_messages_participants_can_read"
  on public.admin_messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Either an admin messaging anyone, or a helper replying to an admin.
create policy "admin_messages_participants_can_insert"
  on public.admin_messages for insert
  with check (
    auth.uid() = sender_id
    and (
      exists (
        select 1 from public.users sender
        where sender.id = auth.uid() and sender.role = 'admin'
      )
      or exists (
        select 1 from public.users recipient
        where recipient.id = admin_messages.recipient_id and recipient.role = 'admin'
      )
    )
  );

-- 4. Real-time: broadcast admin chat to both participants.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'admin_messages'
    ) then
      alter publication supabase_realtime add table public.admin_messages;
    end if;
  end if;
end $$;