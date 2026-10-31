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
    if v_proposal.status not in ('pending', 'declined') then
      raise exception 'This proposal is locked and can no longer be edited.';
    end if;
    if exists (
      select 1 from public.orders o where o.proposal_id = v_proposal.id
    ) then
      raise exception 'This proposal is locked because an order already exists.';
    end if;

    update public.proposals
    set price = p_price,
        currency = upper(trim(p_currency)),
        description = nullif(trim(p_description), ''),
        revisions_included = p_revisions_included,
        expires_at = now() + interval '24 hours',
        status = 'pending',
        created_at = now()
    where id = v_proposal.id
    returning id into v_proposal_id;
    v_revised := true;
  else
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
  end if;

  update public.requests
  set status = 'proposal_sent'
  where id = p_request_id;

  return jsonb_build_object('id', v_proposal_id, 'revised', v_revised);
end;
$$;

revoke all on function public.submit_or_revise_proposal(uuid, numeric, text, text, integer) from public;
grant execute on function public.submit_or_revise_proposal(uuid, numeric, text, text, integer) to authenticated;

create or replace function public.accept_proposal_with_charge(
  p_proposal_id uuid,
  p_student_id uuid,
  p_expected_price numeric,
  p_expected_currency text,
  p_charge_currency text,
  p_charge_amount numeric
)
returns uuid
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_request_id uuid;
  v_request public.requests%rowtype;
  v_proposal public.proposals%rowtype;
  v_order_id uuid;
begin
  select p.request_id into v_request_id
  from public.proposals p
  where p.id = p_proposal_id;

  if not found then
    raise exception 'Proposal not found.';
  end if;

  select r.* into v_request
  from public.requests r
  where r.id = v_request_id
  for update;

  if not found then
    raise exception 'Request not found.';
  end if;

  select p.* into v_proposal
  from public.proposals p
  where p.id = p_proposal_id
    and p.request_id = v_request_id
  for update;

  if not found then
    raise exception 'Proposal not found.';
  end if;
  if v_request.student_id <> p_student_id then
    raise exception 'You can only accept proposals on your own requests.';
  end if;
  if v_proposal.status <> 'pending' then
    raise exception 'This proposal can no longer be accepted.';
  end if;
  if v_request.status not in ('requested', 'proposal_sent') then
    raise exception 'This request has already been resolved.';
  end if;
  if v_proposal.price is distinct from p_expected_price
     or v_proposal.currency is distinct from p_expected_currency then
    raise exception 'The quote changed. Review the revised proposal before accepting.';
  end if;
  if p_charge_amount is null or p_charge_amount <= 0
     or p_charge_currency is null or upper(trim(p_charge_currency)) !~ '^[A-Z]{3}$' then
    raise exception 'Invalid local charge.';
  end if;

  insert into public.orders (
    proposal_id,
    student_id,
    helper_id,
    status,
    price,
    currency,
    base_amount,
    base_currency,
    charge_currency,
    charge_amount,
    charge_locked_at,
    deadline
  )
  values (
    v_proposal.id,
    v_request.student_id,
    v_proposal.helper_id,
    'payment_pending',
    v_proposal.price,
    v_proposal.currency,
    v_proposal.price,
    v_proposal.currency,
    upper(trim(p_charge_currency)),
    p_charge_amount,
    now(),
    v_request.deadline
  )
  returning id into v_order_id;

  update public.proposals
  set status = 'accepted'
  where id = v_proposal.id;

  update public.requests
  set status = 'accepted'
  where id = v_request.id;

  return v_order_id;
end;
$$;

revoke all on function public.accept_proposal_with_charge(uuid, uuid, numeric, text, text, numeric) from public, anon, authenticated;
grant execute on function public.accept_proposal_with_charge(uuid, uuid, numeric, text, text, numeric) to service_role;
