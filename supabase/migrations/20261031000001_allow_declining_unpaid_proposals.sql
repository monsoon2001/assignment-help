create table public.order_checkout_sessions (
  session_id text primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.order_checkout_sessions enable row level security;

create index idx_order_checkout_sessions_order_id
  on public.order_checkout_sessions (order_id);

create or replace function public.decline_unpaid_proposal(
  p_proposal_id uuid,
  p_request_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_request_id uuid;
  v_status public.proposal_status;
  v_order_id uuid;
  v_order_status public.order_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select p.status, p.request_id, r.student_id
  into v_status, v_request_id, v_student_id
  from public.proposals p
  join public.requests r on r.id = p.request_id
  where p.id = p_proposal_id
    and p.request_id = p_request_id
  for update of p, r;

  if not found or v_student_id <> auth.uid() then
    raise exception 'Proposal not found for this student';
  end if;

  if v_status = 'declined' then
    return true;
  end if;
  if v_status not in ('pending', 'accepted') then
    raise exception 'Proposal has already been resolved';
  end if;

  if v_status = 'accepted' then
    select id, status
    into v_order_id, v_order_status
    from public.orders
    where proposal_id = p_proposal_id
    for update;

    if not found or v_order_status <> 'payment_pending' then
      raise exception 'Proposal can no longer be declined';
    end if;
    if exists (
      select 1
      from public.payments
      where order_id = v_order_id
        and status = 'paid'
    ) then
      raise exception 'Proposal has already been paid';
    end if;

    delete from public.orders where id = v_order_id;
  end if;

  update public.proposals
  set status = 'declined'
  where id = p_proposal_id;

  update public.requests
  set status = case
    when exists (
      select 1
      from public.proposals
      where request_id = v_request_id
        and status = 'accepted'
    ) then 'accepted'::public.request_status
    when exists (
      select 1
      from public.proposals
      where request_id = v_request_id
        and status = 'pending'
    ) then 'proposal_sent'::public.request_status
    else 'requested'::public.request_status
  end
  where id = v_request_id
    and status in ('accepted', 'proposal_sent');

  return true;
end;
$$;

revoke all on function public.decline_unpaid_proposal(uuid, uuid) from public;
grant execute on function public.decline_unpaid_proposal(uuid, uuid) to authenticated;
