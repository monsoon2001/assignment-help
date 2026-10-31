create or replace function public.delete_request_if_unpaid(
  p_request_id uuid,
  p_student_id uuid,
  p_require_expired boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  select r.student_id
  into v_student_id
  from public.requests r
  where r.id = p_request_id
  for update;

  if not found or v_student_id is distinct from p_student_id then
    return false;
  end if;

  perform o.id
  from public.orders o
  join public.proposals p on p.id = o.proposal_id
  where p.request_id = p_request_id
  for update of o;

  if exists (
    select 1
    from public.orders o
    join public.proposals p on p.id = o.proposal_id
    where p.request_id = p_request_id
      and o.status <> 'payment_pending'
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.orders o
    join public.proposals p on p.id = o.proposal_id
    join public.payments payment on payment.order_id = o.id
    where p.request_id = p_request_id
      and payment.status in ('pending', 'paid')
  ) then
    return false;
  end if;

  if p_require_expired then
    if not exists (
      select 1
      from public.orders o
      join public.proposals p on p.id = o.proposal_id
      where p.request_id = p_request_id
        and o.status = 'payment_pending'
        and o.created_at <= pg_catalog.now() - interval '1 day'
    ) or exists (
      select 1
      from public.orders o
      join public.proposals p on p.id = o.proposal_id
      where p.request_id = p_request_id
        and o.status = 'payment_pending'
        and o.created_at > pg_catalog.now() - interval '1 day'
    ) then
      return false;
    end if;
  end if;

  delete from public.requests r where r.id = p_request_id;
  return found;
end;
$$;

revoke all on function public.delete_request_if_unpaid(uuid, uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.delete_request_if_unpaid(uuid, uuid, boolean)
  to service_role;
