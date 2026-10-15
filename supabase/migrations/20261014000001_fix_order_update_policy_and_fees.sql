-- Fix the orders participant-update RLS policy and set the international
-- processing/FX buffer to 5.9% (Canada keeps a flat 3.9% processing fee handled
-- in application code; the settings column below is the non-Canadian rate).
--
-- Bug: `order_participants_can_update` guards the frozen financial columns with
-- scalar subqueries written as `(select price from public.orders where id = orders.id)`.
-- Inside the subquery the unaliased `public.orders` introduces a range variable
-- also named `orders`, which shadows the outer (new) row. The predicate therefore
-- becomes `orders.id = orders.id` — true for every row — so each scalar subquery
-- returns more than one row and Postgres raises
--   21000: more than one row returned by a subquery used as an expression
-- on any participant UPDATE (e.g. a helper marking an order `delivered`, or a
-- student requesting a revision).
--
-- Fix: alias the inner relation (`public.orders o`) so `orders.id` resolves to the
-- outer row being written.
--
-- All statements are idempotent. A ROLLBACK block is at the bottom.

-- ============================================================================
-- 1. Recreate the participant update policy with correctly-scoped subqueries.
-- ============================================================================
drop policy if exists "order_participants_can_update" on public.orders;
create policy "order_participants_can_update"
  on public.orders for update to authenticated
  using (auth.uid() = student_id or auth.uid() = helper_id)
  with check (
    (auth.uid() = student_id or auth.uid() = helper_id)
    and price is not distinct from (select o.price from public.orders o where o.id = orders.id)
    and currency is not distinct from (select o.currency from public.orders o where o.id = orders.id)
    and base_currency is not distinct from (select o.base_currency from public.orders o where o.id = orders.id)
    and base_amount is not distinct from (select o.base_amount from public.orders o where o.id = orders.id)
    and charge_currency is not distinct from (select o.charge_currency from public.orders o where o.id = orders.id)
    and charge_amount is not distinct from (select o.charge_amount from public.orders o where o.id = orders.id)
    and charge_locked_at is not distinct from (select o.charge_locked_at from public.orders o where o.id = orders.id)
    and helper_id is not distinct from (select o.helper_id from public.orders o where o.id = orders.id)
    and student_id is not distinct from (select o.student_id from public.orders o where o.id = orders.id)
    and proposal_id is not distinct from (select o.proposal_id from public.orders o where o.id = orders.id)
  );

-- ============================================================================
-- 2. International processing + FX buffer is 5.9%. Canada is charged a flat
--    3.9% processing fee in code (CA_PROCESSING_FEE_PERCENT in lib/currency.ts),
--    so this column only governs students outside Canada.
-- ============================================================================
alter table public.platform_settings
  alter column fx_surcharge_percent set default 5.9;

update public.platform_settings
set fx_surcharge_percent = 5.9,
    updated_at = now()
where id = true;

comment on column public.platform_settings.fx_surcharge_percent is
  'Processing + currency-conversion buffer applied to students outside Canada. Canadian students are charged a flat 3.9% processing fee (see lib/currency.ts).';

-- ============================================================================
-- ROLLBACK (run manually to revert this migration)
-- ----------------------------------------------------------------------------
-- drop policy if exists "order_participants_can_update" on public.orders;
-- -- re-run the (buggy) definition from 20261013000001_multicurrency_local_charge.sql
-- alter table public.platform_settings
--   alter column fx_surcharge_percent set default 3.5;
-- update public.platform_settings set fx_surcharge_percent = 3.5 where id = true;
-- ============================================================================
