-- Helper Earnings need a reliable read path for payments on the helper's own
-- orders. The base `payments` table only gained an authenticated SELECT grant
-- in migration 20260910000016, so any deploy that missed it silently blanks the
-- Earnings page. A helper-facing view (the same pattern as `helper_reviews`)
-- guarantees the Earnings page works regardless of per-table grants/RLS.
--
-- The view runs with the owner's privileges (row-level security is not applied
-- to the table owner) and is filtered to the signed-in helper via `auth.uid()`,
-- so each helper only ever sees payments on their own orders.

create or replace view public.helper_payments as
select
  p.id,
  p.order_id,
  p.amount,
  p.currency,
  p.status,
  p.created_at,
  p.receipt_url,
  o.status as order_status,
  o.helper_id,
  pr.request_id,
  req.title as request_title
from public.payments p
join public.orders o on o.id = p.order_id
left join public.proposals pr on pr.id = o.proposal_id
left join public.requests req on req.id = pr.request_id
where o.helper_id = auth.uid();

grant select on public.helper_payments to authenticated;