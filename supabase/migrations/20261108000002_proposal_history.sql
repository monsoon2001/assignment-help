-- Proposal history + student response metadata.
--
-- A helper's quote is never deleted or rewritten in place any more:
--   pending             -> "Sent" (awaiting the student)
--   revision_requested  -> "Revised price requested" (helper may send a new quote)
--   replaced            -> older quote superseded by the revised quote
--   declined            -> "Declined" (with an optional student reason)
--   accepted            -> "Accepted" (order created)
--
-- Only one quote per helper/request can be active at a time. Historic rows are
-- kept so both parties can see what happened.

alter table public.proposals
  add column if not exists student_note text,
  add column if not exists target_price numeric(10, 2),
  add column if not exists decline_reason text,
  add column if not exists revision_requested_at timestamptz,
  add column if not exists responded_at timestamptz,
  add column if not exists revision_of uuid references public.proposals (id) on delete set null,
  add column if not exists replaced_by uuid references public.proposals (id) on delete set null;

alter table public.proposals
  drop constraint if exists proposals_request_id_helper_id_key;

create unique index if not exists proposals_one_active_per_helper_request_idx
  on public.proposals (request_id, helper_id)
  where status in ('pending', 'revision_requested', 'accepted');

create index if not exists idx_proposals_request_created_at
  on public.proposals (request_id, created_at);

-- ---------------------------------------------------------------------------
-- Helper sends a first quote, or a revised quote after a revision request.
-- ---------------------------------------------------------------------------
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
  v_revision_of uuid := null;
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
  if p_currency is not null and btrim(p_currency) <> ''
     and upper(btrim(p_currency)) <> 'CAD' then
    raise exception 'Proposals are quoted in Canadian dollars (CAD).';
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
    and p.status in ('pending', 'revision_requested', 'accepted')
  order by p.created_at desc
  limit 1
  for update;

  if found then
    if v_proposal.status = 'pending' then
      raise exception 'A quote has already been sent. Wait for the student to request a revision.';
    elsif v_proposal.status = 'accepted' then
      raise exception 'This proposal is locked because it has already been accepted.';
    else
      if exists (
        select 1 from public.orders o where o.proposal_id = v_proposal.id
      ) then
        raise exception 'This proposal is locked because an order already exists.';
      end if;
      v_revision_of := v_proposal.id;
    end if;
  end if;

  if v_revision_of is not null then
    update public.proposals
    set status = 'replaced',
        replaced_by = null,
        responded_at = now()
    where id = v_revision_of;
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
    status,
    revision_of
  )
  values (
    p_request_id,
    v_helper_id,
    p_price,
    'CAD',
    nullif(trim(p_description), ''),
    p_revisions_included,
    now() + interval '24 hours',
    'pending',
    v_revision_of
  )
  returning id into v_proposal_id;

  if v_revision_of is not null then
    update public.proposals
    set replaced_by = v_proposal_id
    where id = v_revision_of;
  end if;

  update public.requests
  set status = 'proposal_sent'
  where id = p_request_id;

  return jsonb_build_object(
    'id', v_proposal_id,
    'revised', v_revised,
    'replaced_id', v_revision_of
  );
end;
$$;

revoke all on function public.submit_or_revise_proposal(uuid, numeric, text, text, integer)
  from public;
grant execute on function public.submit_or_revise_proposal(uuid, numeric, text, text, integer)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Student asks for a different price. The quote stays visible and moves to
-- "revision_requested" so the helper can send a replacement.
-- ---------------------------------------------------------------------------
create or replace function public.request_proposal_revision(
  p_proposal_id uuid,
  p_request_id uuid,
  p_note text,
  p_target_price numeric
)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_student_id uuid;
  v_status public.proposal_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_note is not null and char_length(p_note) > 2000 then
    raise exception 'Keep the revision note under 2000 characters.';
  end if;
  if p_target_price is not null
     and (p_target_price <= 0 or p_target_price <> trunc(p_target_price)) then
    raise exception 'Enter a positive whole-number target price.';
  end if;

  select p.status, r.student_id
  into v_status, v_student_id
  from public.proposals p
  join public.requests r on r.id = p.request_id
  where p.id = p_proposal_id
    and p.request_id = p_request_id
  for update of p, r;

  if not found or v_student_id <> auth.uid() then
    raise exception 'Proposal not found for this student';
  end if;

  if v_status = 'revision_requested' then
    return true;
  end if;
  if v_status <> 'pending' then
    raise exception 'This proposal can no longer be revised';
  end if;
  if exists (
    select 1 from public.orders o where o.proposal_id = p_proposal_id
  ) then
    raise exception 'This proposal has an order and cannot be revised';
  end if;

  update public.proposals
  set status = 'revision_requested',
      student_note = nullif(trim(p_note), ''),
      target_price = p_target_price,
      revision_requested_at = now(),
      responded_at = now()
  where id = p_proposal_id;

  update public.requests
  set status = 'proposal_sent'
  where id = p_request_id
    and status in ('requested', 'proposal_sent');

  return true;
end;
$$;

revoke all on function public.request_proposal_revision(uuid, uuid, text, numeric) from public;
grant execute on function public.request_proposal_revision(uuid, uuid, text, numeric) to authenticated;

-- ---------------------------------------------------------------------------
-- Student declines a quote, optionally explaining why.
-- ---------------------------------------------------------------------------
create or replace function public.decline_proposal_with_reason(
  p_proposal_id uuid,
  p_request_id uuid,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  v_student_id uuid;
  v_status public.proposal_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if p_reason is not null and char_length(p_reason) > 2000 then
    raise exception 'Keep the decline reason under 2000 characters.';
  end if;

  select p.status, r.student_id
  into v_status, v_student_id
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
  if v_status not in ('pending', 'revision_requested') then
    raise exception 'This proposal can no longer be declined';
  end if;
  if exists (
    select 1 from public.orders o where o.proposal_id = p_proposal_id
  ) then
    raise exception 'This proposal has an order and cannot be declined';
  end if;

  update public.proposals
  set status = 'declined',
      decline_reason = nullif(trim(p_reason), ''),
      responded_at = now()
  where id = p_proposal_id;

  update public.requests
  set status = case
    when exists (
      select 1 from public.proposals
      where request_id = p_request_id and status = 'accepted'
    ) then 'accepted'::public.request_status
    when exists (
      select 1 from public.proposals
      where request_id = p_request_id and status in ('pending', 'revision_requested')
    ) then 'proposal_sent'::public.request_status
    else 'declined'::public.request_status
  end
  where id = p_request_id
    and status in ('requested', 'proposal_sent', 'declined');

  return true;
end;
$$;

revoke all on function public.decline_proposal_with_reason(uuid, uuid, text) from public;
grant execute on function public.decline_proposal_with_reason(uuid, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Cancel an accepted but unpaid order. Keep the proposal row as history and
-- mark it declined instead of deleting it.
-- ---------------------------------------------------------------------------
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

  if v_status = 'declined' then
    return true;
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
    raise exception 'This order can no longer be cancelled';
  end if;
  if exists (
    select 1
    from public.payments
    where order_id = v_order_id
      and status in ('pending', 'paid')
  ) then
    raise exception 'Payment is processing or complete; the order cannot be cancelled';
  end if;

  delete from public.orders where id = v_order_id;

  update public.proposals
  set status = 'declined',
      decline_reason = 'Order cancelled before payment',
      responded_at = now()
  where id = p_proposal_id;

  update public.requests
  set status = case
    when exists (
      select 1 from public.proposals
      where request_id = v_request_id and status = 'accepted'
    ) then 'accepted'::public.request_status
    when exists (
      select 1 from public.proposals
      where request_id = v_request_id and status in ('pending', 'revision_requested')
    ) then 'proposal_sent'::public.request_status
    else 'declined'::public.request_status
  end
  where id = v_request_id
    and status = 'accepted';

  return true;
end;
$$;

revoke all on function public.decline_unpaid_proposal(uuid, uuid) from public;
grant execute on function public.decline_unpaid_proposal(uuid, uuid) to authenticated;

-- Older clients still call this function by name. Keep it working, but preserve
-- the quote as history instead of deleting it.
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
  v_status public.proposal_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select p.status, r.student_id
  into v_status, v_student_id
  from public.proposals p
  join public.requests r on r.id = p.request_id
  where p.id = p_proposal_id
    and p.request_id = p_request_id
  for update of p, r;

  if not found or v_student_id <> auth.uid() then
    raise exception 'Request not found for this student';
  end if;
  if v_status = 'revision_requested' then
    return true;
  end if;
  if v_status <> 'pending' then
    raise exception 'This proposal is no longer awaiting a revision request';
  end if;
  if exists (
    select 1 from public.orders o where o.proposal_id = p_proposal_id
  ) then
    raise exception 'This proposal has an order and cannot be reset for revision';
  end if;

  update public.proposals
  set status = 'revision_requested',
      revision_requested_at = now(),
      responded_at = now()
  where id = p_proposal_id;

  update public.requests
  set status = 'proposal_sent'
  where id = p_request_id
    and status in ('requested', 'proposal_sent');

  return true;
end;
$$;

revoke all on function public.remove_pending_proposal_for_revision(uuid, uuid) from public;
grant execute on function public.remove_pending_proposal_for_revision(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Tell the student whether a quote is brand new or a revision.
-- ---------------------------------------------------------------------------
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
      case
        when new.revision_of is not null
          then format('A helper sent a revised quote for "%s".', v_title)
        else format('A helper sent you a proposal for "%s".', v_title)
      end,
      '/requests'
    );
  end if;
  return new;
end;
$$;
