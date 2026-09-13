-- Phase: Voice call logs between admins and helpers.
-- Records every call attempt so both sides can audit missed calls,
-- declined calls, and total talk time (answered calls).

create table public.call_logs (
  id               uuid primary key default gen_random_uuid(),
  caller_id        uuid not null references auth.users (id) on delete cascade,
  callee_id        uuid not null references auth.users (id) on delete cascade,
  direction        text not null check (direction in ('outgoing', 'incoming')),
  status           text not null check (
                     status in ('ringing', 'answered', 'missed', 'declined', 'cancelled', 'busy', 'failed')
                   ),
  started_at       timestamptz not null default now(),
  answered_at      timestamptz,
  ended_at         timestamptz,
  duration_seconds int not null default 0
);

create index idx_call_logs_caller on public.call_logs (caller_id, started_at desc);
create index idx_call_logs_callee on public.call_logs (callee_id, started_at desc);

alter table public.call_logs enable row level security;

-- Each participant can read and write their own call history.
create policy "call_logs_participants_select"
  on public.call_logs for select
  using (auth.uid() = caller_id or auth.uid() = callee_id);

create policy "call_logs_participants_insert"
  on public.call_logs for insert
  with check (auth.uid() = caller_id or auth.uid() = callee_id);

create policy "call_logs_participants_update"
  on public.call_logs for update
  using (auth.uid() = caller_id or auth.uid() = callee_id);

-- Real-time: keep call history views refreshing as calls are recorded.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'call_logs'
    ) then
      alter publication supabase_realtime add table public.call_logs;
    end if;
  end if;
end $$;