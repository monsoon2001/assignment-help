-- Multi-currency local charge + manual helper payouts (retire commission model).
--
-- Model:
--   * Helpers quote a price in any supported currency.
--   * At acceptance the platform locks the student's LOCAL charge currency and
--     amount on the order. Any processing/FX cost is absorbed by the platform
--     and is never itemised to the student.
--   * The platform keeps a CAD ledger on `payments` (admin-only). There is no
--     helper share/percentage/commission anywhere: an admin manually records the
--     amount paid to a helper, and that amount is what the helper sees.
--
-- All statements are idempotent. A ROLLBACK block is at the bottom.

-- ============================================================================
-- 1. Admin settings: drop the commission config, add the hidden FX surcharge.
-- ============================================================================
alter table public.platform_settings
  add column if not exists fx_surcharge_percent numeric(5,2) not null default 3.5
    check (fx_surcharge_percent between 0 and 100);

alter table public.platform_settings
  drop column if exists default_helper_share_percent,
  drop column if exists helper_share_basis;

-- Per-helper compensation table is no longer used.
drop table if exists public.helper_compensation;

-- ============================================================================
-- 2. Orders: lock the local charge alongside the helper's quoted base amount.
-- ============================================================================
alter table public.orders
  add column if not exists base_currency    text,
  add column if not exists base_amount      numeric(12,2),
  add column if not exists charge_currency  text,
  add column if not exists charge_amount    numeric(12,2),
  add column if not exists charge_locked_at timestamptz;

-- Backfill legacy CAD orders so every existing order has a locked charge.
update public.orders
set base_currency    = coalesce(base_currency, currency, 'CAD'),
    base_amount      = coalesce(base_amount, price),
    charge_currency  = coalesce(charge_currency, 'CAD'),
    charge_amount    = coalesce(charge_amount, price),
    charge_locked_at = coalesce(charge_locked_at, created_at)
where charge_amount is null
   or base_amount is null
   or charge_currency is null;

alter table public.orders
  drop constraint if exists orders_charge_amount_positive_ck,
  add constraint orders_charge_amount_positive_ck
    check (charge_amount is null or charge_amount > 0);

comment on column public.orders.charge_currency is
  'ISO currency the student was charged in, locked at acceptance from their saved location.';
comment on column public.orders.charge_amount is
  'Amount charged in charge_currency (platform-absorbed FX/processing already included).';
comment on column public.orders.base_currency is
  'Currency the helper quoted the base amount in.';
comment on column public.orders.base_amount is
  'Helper quoted amount in base_currency, locked at acceptance.';

-- Freeze the financial + assignment columns for participants.
drop policy if exists "order_participants_can_update" on public.orders;
create policy "order_participants_can_update"
  on public.orders for update to authenticated
  using (auth.uid() = student_id or auth.uid() = helper_id)
  with check (
    (auth.uid() = student_id or auth.uid() = helper_id)
    and price is not distinct from (select price from public.orders where id = orders.id)
    and currency is not distinct from (select currency from public.orders where id = orders.id)
    and base_currency is not distinct from (select base_currency from public.orders where id = orders.id)
    and base_amount is not distinct from (select base_amount from public.orders where id = orders.id)
    and charge_currency is not distinct from (select charge_currency from public.orders where id = orders.id)
    and charge_amount is not distinct from (select charge_amount from public.orders where id = orders.id)
    and charge_locked_at is not distinct from (select charge_locked_at from public.orders where id = orders.id)
    and helper_id is not distinct from (select helper_id from public.orders where id = orders.id)
    and student_id is not distinct from (select student_id from public.orders where id = orders.id)
    and proposal_id is not distinct from (select proposal_id from public.orders where id = orders.id)
  );

-- ============================================================================
-- 3. Payments: record the real charge currency/amount + CAD conversion. Drop the
--    obsolete helper-share column.
-- ============================================================================
alter table public.payments
  add column if not exists charge_currency      text,
  add column if not exists charge_amount        numeric(12,2),
  add column if not exists charge_to_cad_rate   numeric(18,8),
  add column if not exists platform_fee_cad     numeric(12,2);

-- The helper_payments view exposed helper_share_cad as `amount`; retire both.
drop view if exists public.helper_payments;

alter table public.payments
  drop column if exists helper_share_cad;

-- ============================================================================
-- 4. Manual payouts: the admin records the amount actually sent. No percentage.
-- ============================================================================
create or replace function public.record_helper_payout(
  p_helper_id         uuid,
  p_order_ids         uuid[],
  p_amount_sent_cad   numeric,
  p_method            text default 'wise',
  p_reference         text default null,
  p_notes             text default null,
  p_amount_received   numeric default null,
  p_received_currency text default null,
  p_created_by        uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payout_id    uuid;
  v_bad          integer;
  v_n            integer := 0;
  v_total_weight numeric := 0;
  v_remaining    numeric;
  v_seen         integer := 0;
  v_amount       numeric;
  rec            record;
begin
  if p_order_ids is null or array_length(p_order_ids, 1) is null then
    raise exception 'no orders selected';
  end if;
  if p_helper_id is null then
    raise exception 'helper is required';
  end if;
  if p_amount_sent_cad is null or p_amount_sent_cad < 0 then
    raise exception 'amount sent is required';
  end if;

  -- Every selected order must belong to this helper, have a payment that is
  -- still unpaid and not disputed.
  select count(*) into v_bad
  from unnest(p_order_ids) as oid
  where not exists (
    select 1
    from public.orders o
    join public.payments p on p.order_id = o.id
    where o.id = oid
      and o.helper_id = p_helper_id
      and p.helper_payout_status = 'unpaid'
      and p.disputed = false
  );
  if v_bad > 0 then
    raise exception 'one or more orders are not payable to this helper';
  end if;

  insert into public.manual_payouts
    (helper_id, amount_sent_cad, amount_received, received_currency,
     method, reference, order_ids, notes, created_by)
  values
    (p_helper_id, p_amount_sent_cad, p_amount_received, p_received_currency,
     coalesce(p_method, 'wise'), p_reference, p_order_ids, p_notes, p_created_by)
  returning id into v_payout_id;

  -- Split the recorded lump sum across the selected orders in proportion to
  -- each order's CAD value (gross), for admin bookkeeping only. The rounding
  -- remainder lands on the last order so the parts always sum to the total.
  select count(*),
         coalesce(sum(coalesce(nullif(p.gross_cad, 0), nullif(o.price, 0), 1)), 0)
    into v_n, v_total_weight
  from public.payments p
  join public.orders o on o.id = p.order_id
  where p.order_id = any(p_order_ids);

  v_remaining := p_amount_sent_cad;

  for rec in
    select p.order_id,
           coalesce(nullif(p.gross_cad, 0), nullif(o.price, 0), 1) as weight
    from public.payments p
    join public.orders o on o.id = p.order_id
    where p.order_id = any(p_order_ids)
    order by p.order_id
  loop
    v_seen := v_seen + 1;
    if v_seen = v_n then
      v_amount := round(v_remaining, 2);
    else
      v_amount := round(p_amount_sent_cad * rec.weight / v_total_weight, 2);
    end if;
    v_remaining := round(v_remaining - v_amount, 2);

    insert into public.manual_payout_items (payout_id, order_id, amount_cad)
    values (v_payout_id, rec.order_id, v_amount);
  end loop;

  update public.payments
  set helper_payout_status = 'paid', updated_at = now()
  where order_id = any(p_order_ids)
    and helper_payout_status = 'unpaid';

  return v_payout_id;
end;
$$;

revoke all on function public.record_helper_payout(
  uuid, uuid[], numeric, text, text, text, numeric, text, uuid
) from public, anon, authenticated;
grant execute on function public.record_helper_payout(
  uuid, uuid[], numeric, text, text, text, numeric, text, uuid
) to service_role;

-- ============================================================================
-- 5. Helper-facing read path for recorded payouts. Filtered to the signed-in
--    helper via auth.uid(); the view runs with the owner's privileges (RLS is
--    not applied to the owner) so helpers need no grant on manual_payouts.
-- ============================================================================
create or replace view public.helper_payouts as
select
  p.id,
  p.helper_id,
  p.amount_sent_cad,
  p.amount_received,
  p.received_currency,
  p.method,
  p.reference,
  p.order_ids,
  p.paid_at,
  p.notes
from public.manual_payouts p
where p.helper_id = auth.uid();

grant select on public.helper_payouts to authenticated;

-- ============================================================================
-- ROLLBACK (run manually to revert this migration)
-- ----------------------------------------------------------------------------
-- drop view if exists public.helper_payouts;
-- alter table public.platform_settings
--   drop column if exists fx_surcharge_percent,
--   add column if not exists default_helper_share_percent numeric(5,2) not null default 80,
--   add column if not exists helper_share_basis text not null default 'gross';
-- alter table public.payments
--   drop column if exists charge_currency,
--   drop column if exists charge_amount,
--   drop column if exists charge_to_cad_rate,
--   drop column if exists platform_fee_cad,
--   add column if not exists helper_share_cad numeric(10,2);
-- alter table public.orders
--   drop column if exists base_currency,
--   drop column if exists base_amount,
--   drop column if exists charge_currency,
--   drop column if exists charge_amount,
--   drop column if exists charge_locked_at;
--   -- then re-run 20261009000001_helper_payments_view.sql / 20261011000001
--   -- to restore the previous view + payout function.
-- ============================================================================
