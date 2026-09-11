-- Phase 7: Notifications
-- A per-user inbox that gets filled automatically when key platform events
-- happen (proposal, payment, message, delivery, revision, completion).

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  type        text not null default 'system',
  message     text not null,
  link        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user_id on public.notifications (user_id, created_at desc);
create index idx_notifications_unread on public.notifications (user_id) where read = false;

alter table public.notifications enable row level security;

-- A user can read and mark their own notifications as read; only the system
-- (through the triggers below) creates them.
create policy "notifications_users_can_read_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_users_can_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Automatic notification triggers
-- ---------------------------------------------------------------------------

-- 1. A helper sends a proposal -> notify the student who owns the request.
create or replace function public.notify_proposal_sent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid;
  v_title text;
begin
  select r.student_id, coalesce(r.title, 'your request')
    into v_student, v_title
  from public.requests r
  where r.id = new.request_id;

  if v_student is not null and v_student <> auth.uid() then
    insert into public.notifications (user_id, type, message, link)
    values (
      v_student,
      'proposal',
      format('A helper sent you a proposal for "%s".', v_title),
      '/requests'
    );
  end if;
  return new;
end;
$$;

create trigger notify_proposal_sent_trg
  after insert on public.proposals
  for each row execute function public.notify_proposal_sent();

-- 2. Payment confirmed -> notify the helper that work can begin.
create or replace function public.notify_payment_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_helper uuid;
begin
  select o.helper_id into v_helper
  from public.orders o
  where o.id = new.order_id;

  if v_helper is not null then
    insert into public.notifications (user_id, type, message, link)
    values (
      v_helper,
      'payment',
      'Payment confirmed. A new order is ready to start.',
      '/helper/orders/' || new.order_id::text
    );
  end if;
  return new;
end;
$$;

create trigger notify_payment_confirmed_trg
  after insert on public.payments
  for each row execute function public.notify_payment_confirmed();

-- 3. A new chat message -> notify the other participant on the order.
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_other uuid;
  v_other_role text;
begin
  select case when o.student_id = new.sender_id then o.helper_id else o.student_id end
    into v_other
  from public.orders o
  where o.id = new.order_id;

  if v_other is null or v_other = new.sender_id then
    return new;
  end if;

  select u.role into v_other_role from public.users u where u.id = v_other;

  insert into public.notifications (user_id, type, message, link)
  values (
    v_other,
    'message',
    'You have a new message in your order workspace.',
    case when v_other_role = 'helper'
      then '/helper/orders/' || new.order_id::text
      else '/orders/' || new.order_id::text
    end
  );
  return new;
end;
$$;

create trigger notify_new_message_trg
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- 4. Work is delivered -> notify the student to review it.
create or replace function public.notify_delivery_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid;
begin
  select o.student_id into v_student
  from public.orders o
  where o.id = new.order_id;

  if v_student is not null then
    insert into public.notifications (user_id, type, message, link)
    values (
      v_student,
      'delivery',
      'A helper delivered work for your order — review it now.',
      '/orders/' || new.order_id::text
    );
  end if;
  return new;
end;
$$;

create trigger notify_delivery_submitted_trg
  after insert on public.deliveries
  for each row execute function public.notify_delivery_submitted();

-- 5. A student requests a revision -> notify the helper.
create or replace function public.notify_revision_requested()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'revision_requested' and old.status = 'delivered' then
    insert into public.notifications (user_id, type, message, link)
    values (
      new.helper_id,
      'revision',
      'A student requested a revision on your order.',
      '/helper/orders/' || new.id::text
    );
  end if;
  return new;
end;
$$;

create trigger notify_revision_requested_trg
  after update on public.orders
  for each row execute function public.notify_revision_requested();

-- 6. An order is completed -> notify the helper.
create or replace function public.notify_order_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status = 'delivered' then
    insert into public.notifications (user_id, type, message, link)
    values (
      new.helper_id,
      'completed',
      'An order was completed. Great work!',
      '/helper/orders/' || new.id::text
    );
  end if;
  return new;
end;
$$;

create trigger notify_order_completed_trg
  after update on public.orders
  for each row execute function public.notify_order_completed();

-- Real-time: broadcast new notifications so badge counts stay live.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
      alter publication supabase_realtime add table public.notifications;
    end if;
  end if;
end $$;