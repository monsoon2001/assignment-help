create or replace function public.submit_or_revise_proposal(
  p_request_id uuid,
  p_price numeric,
  p_currency text,
  p_description text,
  p_revisions_included integer
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_helper_id uuid := auth.uid();
  v_request public.requests%rowtype;
  v_proposal public.proposals%rowtype;
  v_proposal_id uuid;
  v_revised boolean := false;
begin
  if v_helper_id is null then
    raise exception 'You must be signed in to send a proposal.';
  end if;

  if not exists (
    select 1 from public.users u
    where u.id = v_helper_id and u.role = 'helper'
  ) then
    raise exception 'Only assigned helpers can send proposals.';
  end if;

  if p_price is null or p_price <= 0 or p_price <> trunc(p_price) then
    raise exception 'Enter a positive whole-number proposal price.';
  end if;
  if p_currency is null or upper(trim(p_currency)) !~ '^[A-Z]{3}$' then
    raise exception 'Choose a valid proposal currency.';
  end if;
  if p_revisions_included is null or p_revisions_included < 0 then
    raise exception 'The included revision count cannot be negative.';
  end if;
  if p_description is not null and char_length(p_description) > 4000 then
    raise exception 'The proposal message must be 4000 characters or fewer.';
  end if;
  if (
    select count(*)
    from public.proposals p
    where p.helper_id = v_helper_id
      and p.created_at > now() - interval '1 minute'
  ) >= 20 then
    raise exception 'You have sent too many proposals recently. Please wait a minute and try again.';
  end if;

  select r.* into v_request
  from public.requests r
  where r.id = p_request_id
    and r.helper_id = v_helper_id
  for update;

  if not found then
    raise exception 'This request is not assigned to you.';
  end if;
  if v_request.status not in ('requested', 'proposal_sent', 'declined') then
    raise exception 'This request has already been resolved.';
  end if;

  select p.* into v_proposal
  from public.proposals p
  where p.request_id = p_request_id
    and p.helper_id = v_helper_id
  for update;

  if found then
    if v_proposal.status <> 'declined' then
      raise exception 'A quote has already been sent. Wait for the student to request a revision.';
    end if;
    if exists (
      select 1 from public.orders o where o.proposal_id = v_proposal.id
    ) then
      raise exception 'This declined proposal still has an order and cannot be replaced.';
    end if;

    delete from public.proposals where id = v_proposal.id;
    v_revised := true;
  end if;

  insert into public.proposals (
    request_id,
    helper_id,
    price,
    currency,
    description,
    revisions_included,
    expires_at,
    status
  )
  values (
    p_request_id,
    v_helper_id,
    p_price,
    upper(trim(p_currency)),
    nullif(trim(p_description), ''),
    p_revisions_included,
    now() + interval '24 hours',
    'pending'
  )
  returning id into v_proposal_id;

  update public.requests
  set status = 'proposal_sent'
  where id = p_request_id;

  return jsonb_build_object('id', v_proposal_id, 'revised', v_revised);
end;
$$;

revoke all on function public.submit_or_revise_proposal(uuid, numeric, text, text, integer)
  from public;
grant execute on function public.submit_or_revise_proposal(uuid, numeric, text, text, integer)
  to authenticated;

create or replace function public.remove_pending_proposal_for_revision(
  p_proposal_id uuid,
  p_request_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_student_id uuid;
  v_proposal public.proposals%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select r.student_id into v_student_id
  from public.requests r
  where r.id = p_request_id
  for update;

  if not found or v_student_id <> auth.uid() then
    raise exception 'Request not found for this student';
  end if;

  select p.* into v_proposal
  from public.proposals p
  where p.id = p_proposal_id
    and p.request_id = p_request_id
  for update;

  if not found then
    return true;
  end if;
  if v_proposal.status <> 'pending' then
    raise exception 'This proposal is no longer awaiting a revision request';
  end if;
  if exists (
    select 1 from public.orders o where o.proposal_id = v_proposal.id
  ) then
    raise exception 'This proposal has an order and cannot be reset for revision';
  end if;

  delete from public.proposals where id = v_proposal.id;

  update public.requests
  set status = case
    when exists (
      select 1 from public.proposals p
      where p.request_id = p_request_id and p.status = 'accepted'
    ) then 'accepted'::public.request_status
    when exists (
      select 1 from public.proposals p
      where p.request_id = p_request_id and p.status = 'pending'
    ) then 'proposal_sent'::public.request_status
    else 'requested'::public.request_status
  end
  where id = p_request_id
    and status in ('accepted', 'proposal_sent');

  return true;
end;
$$;

revoke all on function public.remove_pending_proposal_for_revision(uuid, uuid) from public;
grant execute on function public.remove_pending_proposal_for_revision(uuid, uuid) to authenticated;

create or replace function public.decline_unpaid_proposal(
  p_proposal_id uuid,
  p_request_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = 'public'
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
  if v_status <> 'accepted' then
    raise exception 'Proposal is not an unpaid accepted proposal';
  end if;

  select id, status
  into v_order_id, v_order_status
  from public.orders
  where proposal_id = p_proposal_id
  for update;

  if not found or v_order_status <> 'payment_pending' then
    raise exception 'Proposal can no longer be reset for revision';
  end if;
  if exists (
    select 1
    from public.payments
    where order_id = v_order_id
      and status in ('pending', 'paid')
  ) then
    raise exception 'Payment is processing or complete; proposal cannot be reset';
  end if;

  delete from public.orders where id = v_order_id;
  delete from public.proposals where id = p_proposal_id;

  update public.requests
  set status = case
    when exists (
      select 1 from public.proposals p
      where p.request_id = v_request_id and p.status = 'accepted'
    ) then 'accepted'::public.request_status
    when exists (
      select 1 from public.proposals p
      where p.request_id = v_request_id and p.status = 'pending'
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
