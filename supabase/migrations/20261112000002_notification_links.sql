-- Store related order/request IDs on notifications so they can be marked read
-- precisely when a user opens or acts on the related item.
alter table public.notifications
  add column if not exists order_id uuid references public.orders (id) on delete cascade,
  add column if not exists request_id uuid references public.requests (id) on delete cascade;

create index if not exists idx_notifications_order_unread
  on public.notifications (user_id, order_id) where read = false and order_id is not null;
create index if not exists idx_notifications_request_unread
  on public.notifications (user_id, request_id) where read = false and request_id is not null;

-- 1) Proposal sent -> notify student, link to request, related request.
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
    insert into public.notifications (user_id, type, message, link, request_id)
    values (
      v_student,
      'proposal',
      format('A helper sent you a proposal for "%s".', v_title),
      '/requests/' || new.request_id::text,
      new.request_id
    );
  end if;
  return new;
end;
$$;

-- 2) Payment confirmed -> notify helper, related order.
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
    insert into public.notifications (user_id, type, message, link, order_id)
    values (
      v_helper,
      'payment',
      'Payment confirmed. A new order is ready to start.',
      '/helper/orders/' || new.order_id::text,
      new.order_id
    );
  end if;
  return new;
end;
$$;

-- 3) New chat message -> notify other participant, related order.
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

  insert into public.notifications (user_id, type, message, link, order_id)
  values (
    v_other,
    'message',
    'You have a new message in your order workspace.',
    case when v_other_role = 'helper'
      then '/helper/orders/' || new.order_id::text
      else '/orders/' || new.order_id::text
    end,
    new.order_id
  );
  return new;
end;
$$;

-- 4) Delivery submitted -> notify student, related order.
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
    insert into public.notifications (user_id, type, message, link, order_id)
    values (
      v_student,
      'delivery',
      'A helper delivered work for your order — review it now.',
      '/orders/' || new.order_id::text,
      new.order_id
    );
  end if;
  return new;
end;
$$;

-- 5) Revision requested -> notify helper, related order.
create or replace function public.notify_revision_requested()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'revision_requested' and old.status = 'delivered' then
    insert into public.notifications (user_id, type, message, link, order_id)
    values (
      new.helper_id,
      'revision',
      'A student requested a revision on your order.',
      '/helper/orders/' || new.id::text,
      new.id
    );
  end if;
  return new;
end;
$$;

-- 6) Order completed -> notify helper, related order.
create or replace function public.notify_order_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status = 'delivered' then
    insert into public.notifications (user_id, type, message, link, order_id)
    values (
      new.helper_id,
      'completed',
      'An order was completed. Great work!',
      '/helper/orders/' || new.id::text,
      new.id
    );
  end if;
  return new;
end;
$$;

-- New request assigned/reassigned -> notify helper, related request.
create or replace function public.notify_new_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_name text;
begin
  if new.helper_id is null
     or (tg_op = 'UPDATE' and old.helper_id is not distinct from new.helper_id) then
    return new;
  end if;

  select u.name into v_student_name from public.users u where u.id = new.student_id;

  insert into public.notifications (user_id, type, message, link, request_id)
  values (
    new.helper_id,
    'request',
    format(
      'A student%s sent you a request: "%s".',
      case when v_student_name is not null then ' (' || v_student_name || ')' else '' end,
      coalesce(nullif(trim(new.title), ''), 'New request')
    ),
    '/helper/requests/' || new.id::text,
    new.id
  );
  return new;
end;
$$;
