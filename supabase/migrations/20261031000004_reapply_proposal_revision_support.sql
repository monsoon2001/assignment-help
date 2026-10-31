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
      raise exception 'This proposal is locked and can no longer be edited (current status: %).',
        v_proposal.status;
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

revoke all on function public.submit_or_revise_proposal(uuid, numeric, text, text, integer)
  from public;
grant execute on function public.submit_or_revise_proposal(uuid, numeric, text, text, integer)
  to authenticated;
