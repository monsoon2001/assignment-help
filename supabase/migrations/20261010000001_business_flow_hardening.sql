-- Security audit follow-up: enforce the business flow in the database, not
-- only in the UI. Closes the following audit findings:
--
--   * helpers could edit (e.g. reprice) an ACCEPTED proposal before the student
--     paid, so the checkout would charge a different amount than the student
--     agreed (checkout route uses proposal.price as the authority).
--   * a student could reassign a request's helper_id to any user (including a
--     fellow student or themselves), then act as that "helper" and self-review.
--   * a student could review an unpaid / undelivered order (reputation fraud).
--   * any participant could force an order into any status (e.g. mark an unpaid
--     order 'completed', or rewind a paid order back to 'payment_pending').
--
-- All changes are additive and idempotent (drop policy + recreate).

-- ============================================================================
-- 1. proposals: a helper may only touch their OWN still-PENDING proposals.
--    An accepted proposal is frozen so its price/currency/status can no longer
--    drift away from the order the student accepted.
-- ============================================================================
drop policy if exists "helpers_can_update_own_proposals" on public.proposals;
create policy "helpers_can_update_own_pending_proposals"
  on public.proposals for update to authenticated
  using (
    auth.uid() = helper_id
    and status = 'pending'
  )
  with check (
    auth.uid() = helper_id
    and status = 'pending'
  );

-- ============================================================================
-- 2. requests: a student may keep editing their own request, but the assigned
--    helper_id must always stay a REAL helper account. This closes the
--    self-dealing chain (student sets helper_id to themselves or another
--    student, then acts as the "helper" on their own request).
-- ============================================================================
drop policy if exists "students_can_update_own_requests" on public.requests;
create policy "students_can_update_own_requests"
  on public.requests for update to authenticated
  using (auth.uid() = student_id)
  with check (
    auth.uid() = student_id
    and exists (
      select 1 from public.users u
      where u.id = helper_id
        and u.role = 'helper'
    )
  );

-- The harden migration (20260913000005) dropped the original
-- `students_can_manage_own_requests` policy but never added a SELECT reader, so
-- students lost the ability to read their own requests entirely (and the
-- request-scoped message/chat views stopped resolving). Restore it.
drop policy if exists "students_can_view_own_requests" on public.requests;
create policy "students_can_view_own_requests"
  on public.requests for select to authenticated
  using (auth.uid() = student_id);

-- ============================================================================
-- 3. reviews: only the student on a PAID, delivered/completed/disputed order
--    may review, and never an order where they are also the helper.
-- ============================================================================
drop policy if exists "students_can_review_own_orders" on public.reviews;
create policy "students_can_review_paid_delivered_orders"
  on public.reviews for insert to authenticated
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = reviews.order_id
        and o.student_id = auth.uid()
        and o.helper_id <> auth.uid()
        and o.status in ('delivered', 'completed', 'disputed')
    )
    and exists (
      select 1
      from public.payments p
      where p.order_id = reviews.order_id
        and p.status = 'paid'
    )
  );

-- ============================================================================
-- 4. orders: enforce legal status transitions. The webhook (service role) also
--    goes through this trigger, so the rules must not depend on RLS.
--
--    Rules enforced for EVERYONE except admins:
--      * an order can never return to 'payment_pending' once it has moved on
--        (prevents bypassing checkout after a refund/reversal),
--      * leaving 'payment_pending' is only possible onto 'in_progress' AND only
--        once a `paid` payment record exists (the webhook writes the payment
--        row before flipping the order),
--      * 'completed' is terminal for the participants.
--
--    Admins (dispute resolution / refunds) are exempt via public.is_admin().
-- ============================================================================
create or replace function public.guard_order_status_transitions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  -- Admins may drive orders through dispute/refund without friction.
  if public.is_admin() then
    return new;
  end if;

  -- Once an order has left payment_pending it can never go back; a refunded /
  -- disputed order must not silently become payable again.
  if new.status = 'payment_pending' and old.status <> 'payment_pending' then
    raise exception 'orders: cannot revert a paid order to payment_pending';
  end if;

  -- Leaving payment_pending must land exactly on in_progress and only after a
  -- real Stripe payment was recorded. Prevents participants marking unpaid
  -- orders delivered/completed/in_progress directly.
  if old.status = 'payment_pending' and new.status <> 'in_progress' then
    raise exception 'orders: an order must be paid before work starts';
  end if;
  if old.status = 'payment_pending'
     and not exists (
       select 1 from public.payments p
       where p.order_id = old.id and p.status = 'paid'
     ) then
    raise exception 'orders: payment required before work starts';
  end if;

  -- Completed is terminal for the participants (admins may still amend).
  if old.status = 'completed' and new.status <> 'completed' then
    raise exception 'orders: a completed order cannot be reopened';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_order_status_transitions_trg on public.orders;
create trigger guard_order_status_transitions_trg
  before update of status on public.orders
  for each row execute function public.guard_order_status_transitions();