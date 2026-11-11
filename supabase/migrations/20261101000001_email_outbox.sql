create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  recipient_user_id uuid references auth.users(id) on delete set null,
  to_email text not null,
  subject text not null,
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  dedupe_key text not null unique,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.email_outbox enable row level security;

create policy "email_outbox_admin_only"
  on public.email_outbox
  for all
  using (false)
  with check (false);

create index if not exists email_outbox_status_created_idx
  on public.email_outbox (status, created_at);