-- Phase 2/3: Targeted student request flow
-- A student picks ONE helper (not a broadcast), chat starts on the request
-- before any price is agreed, and a 2-hour window lets the student re-pick
-- an unresponsive helper.

-- 1. requests: assigned helper + when the request was sent to them.
alter table public.requests
  add column helper_id uuid references public.users (id) on delete set null,
  add column sent_at timestamptz;

create index idx_requests_helper_id on public.requests (helper_id);

-- 2. messages: allow request-scoped threads (chat before an order exists).
alter table public.messages
  add column request_id uuid references public.requests (id) on delete cascade;

-- order_id was NOT NULL; request threads have no order yet.
alter table public.messages alter column order_id drop not null;

create index idx_messages_request_id on public.messages (request_id);

-- 3. Auto-set sent_at whenever a helper is (re)assigned to a request.
create or replace function public.set_request_sent_at()
returns trigger
language plpgsql
as $$
begin
  if new.helper_id is not null
     and (tg_op = 'INSERT' or old.helper_id is distinct from new.helper_id) then
    new.sent_at = now();
  end if;
  return new;
end;
$$;

create trigger requests_set_sent_at
  before insert or update on public.requests
  for each row execute function public.set_request_sent_at();

-- 4. RLS: targeted, not broadcast.
--    A helper can only see requests explicitly sent to them.
drop policy if exists "helpers_can_view_open_requests" on public.requests;
create policy "helpers_can_view_assigned_requests"
  on public.requests for select
  using (helper_id = auth.uid());

--    A helper can only propose on requests assigned to them.
drop policy if exists "helpers_can_create_proposals" on public.proposals;
create policy "helpers_can_create_proposals_for_assigned_requests"
  on public.proposals for insert
  with check (
    auth.uid() = helper_id
    and exists (
      select 1 from public.requests r
      where r.id = proposals.request_id
        and r.helper_id = auth.uid()
        and r.status in ('requested', 'proposal_sent')
    )
  );

-- 5. Request-scoped chat RLS (the request's student or assigned helper).
create policy "request_participants_can_view_messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.requests r
      where r.id = messages.request_id
        and (r.student_id = auth.uid() or r.helper_id = auth.uid())
    )
  );

create policy "request_participants_can_send_messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.requests r
      where r.id = messages.request_id
        and (r.student_id = auth.uid() or r.helper_id = auth.uid())
    )
  );

-- 6. Notify the other participant when someone messages on a request thread.
create or replace function public.notify_request_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_other uuid;
  v_other_role text;
begin
  select case when r.student_id = new.sender_id then r.helper_id else r.student_id end
    into v_other
  from public.requests r
  where r.id = new.request_id;

  if v_other is null or v_other = new.sender_id then
    return new;
  end if;

  select u.role into v_other_role from public.users u where u.id = v_other;

  insert into public.notifications (user_id, type, message, link)
  values (
    v_other,
    'message',
    'You have a new message on a request thread.',
    case when v_other_role = 'helper'
      then '/helper/requests/' || new.request_id::text
      else '/requests/' || new.request_id::text
    end
  );
  return new;
end;
$$;

create trigger notify_request_message_trg
  after insert on public.messages
  for each row when (new.request_id is not null)
  execute function public.notify_request_message();