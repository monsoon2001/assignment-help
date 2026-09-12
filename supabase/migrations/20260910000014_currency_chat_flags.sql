-- Currency support + admin chat safety (flags & warnings)

-- 1. Currencies on proposals and orders.
alter table public.proposals
  add column currency text not null default 'USD';

alter table public.orders
  add column currency text not null default 'USD';

alter table public.payments
  add column currency text not null default 'USD';

-- 2. Chat flags: a message can be flagged for off-platform contact attempts.
create type public.chat_flag_status as enum ('pending', 'confirmed', 'dismissed');

create table public.chat_flags (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references public.messages (id) on delete cascade,
  reason     text not null,
  status     public.chat_flag_status not null default 'pending',
  flagged_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_chat_flags_status on public.chat_flags (status, created_at desc);

-- 3. Warnings issued to a user for policy violations.
create table public.user_warnings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  message_id uuid references public.messages (id) on delete set null,
  reason     text not null,
  issued_by  uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_user_warnings_user on public.user_warnings (user_id, created_at desc);

alter table public.chat_flags enable row level security;
alter table public.user_warnings enable row level security;

-- Admins can manage flags; users can read their own warnings.
create policy "chat_flags_admins_can_all"
  on public.chat_flags for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "user_warnings_admins_can_all"
  on public.user_warnings for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  )
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "user_warnings_users_can_read_own"
  on public.user_warnings for select
  using (auth.uid() = user_id);

-- 4. Auto-flag messages that look like off-platform contact attempts.
create or replace function public.flag_suspicious_messages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reason text;
begin
  if new.body ~* '(whatsapp|telegram|viber|signal|discord|skype|instagram|snapchat|cashapp|paypal|zelle)' then
    v_reason := 'Off-platform messaging or payment app mentioned';
  elsif new.body ~* '(\+?\d[0-9\s\-().]{6,}\d)' then
    v_reason := 'Phone number shared';
  elsif new.body ~* '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})' then
    v_reason := 'Email address shared';
  elsif new.body ~* '(call me|text me|dm me|contact me|email me|message me outside|meet outside|off platform|off the platform|outside the platform|connect outside|move off)' then
    v_reason := 'Attempted to take the conversation off-platform';
  else
    return new;
  end if;

  insert into public.chat_flags (message_id, reason, status)
  values (new.id, v_reason, 'pending');
  return new;
end;
$$;

create trigger flag_suspicious_messages_trg
  after insert on public.messages
  for each row execute function public.flag_suspicious_messages();

-- Backfill: flag existing messages that look like off-platform contact attempts.
insert into public.chat_flags (message_id, reason, status)
select m.id,
       case
         when m.body ~* '(whatsapp|telegram|viber|signal|discord|skype|instagram|snapchat|cashapp|paypal|zelle)' then 'Off-platform messaging or payment app mentioned'
         when m.body ~* '(\+?\d[0-9\s\-().]{6,}\d)' then 'Phone number shared'
         when m.body ~* '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})' then 'Email address shared'
         when m.body ~* '(call me|text me|dm me|contact me|email me|message me outside|meet outside|off platform|off the platform|outside the platform|connect outside|move off)' then 'Attempted to take the conversation off-platform'
       end,
       'pending'
from public.messages m
where m.body is not null
  and not exists (select 1 from public.chat_flags cf where cf.message_id = m.id)
  and (
    m.body ~* '(whatsapp|telegram|viber|signal|discord|skype|instagram|snapchat|cashapp|paypal|zelle)'
    or m.body ~* '(\+?\d[0-9\s\-().]{6,}\d)'
    or m.body ~* '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
    or m.body ~* '(call me|text me|dm me|contact me|email me|message me outside|meet outside|off platform|off the platform|outside the platform|connect outside|move off)'
  );