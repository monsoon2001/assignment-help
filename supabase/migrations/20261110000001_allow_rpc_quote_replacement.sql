-- Let the trusted proposal RPC mark an old quote as "replaced".
--
-- The guard_proposal_updates trigger stops a helper from editing their own
-- non-pending proposals directly (a price-tampering protection that stands in
-- for the hardened pending-only UPDATE policy on this database). The proposal
-- history RPC submit_or_revise_proposal runs with the helper's session, so the
-- trigger also blocked its one legitimate write: moving a revision-requested
-- quote to "replaced" when the student asked for a new price.
--
-- Fix: the RPC flips a transaction-local flag at the start of its call. The
-- trigger lets flagged transactions through and keeps blocking everything
-- else. PostgREST clients cannot set custom GUCs, so only the RPC (or another
-- SECURITY DEFINER function) can raise the flag — direct client UPDATEs of
-- accepted/declined/replaced quotes stay impossible.

create or replace function public.guard_proposal_updates()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  if auth.uid() is null then return new; end if;
  if public.is_admin() then return new; end if;
  -- Trusted server-side proposal RPCs set this flag inside the caller's
  -- transaction; browser clients cannot reach it.
  if current_setting('acadivo.proposal_rpc', true) = 'on' then
    return new;
  end if;
  if old.helper_id = auth.uid() and old.status <> 'pending' then
    if new.price is distinct from old.price
       or new.currency is distinct from old.currency
       or new.description is distinct from old.description
       or new.revisions_included is distinct from old.revisions_included
       or new.status is distinct from old.status then
      raise exception 'This proposal is locked and can no longer be edited';
    end if;
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'proposals'
      and t.tgname = 'guard_proposal_updates_trg'
      and not t.tgisinternal
  ) then
    create trigger guard_proposal_updates_trg
      before update on public.proposals
      for each row execute function public.guard_proposal_updates();
  end if;
end
$$;

-- submit_or_revise_proposal, now flagging its transaction for the guard
-- trigger. Logic is unchanged from 20261108000002 otherwise.
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

  -- Mark this transaction as a trusted proposal-RPC call so the
  -- guard_proposal_updates trigger allows the history transitions below.
  perform set_config('acadivo.proposal_rpc', 'on', true);

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
