-- Phase 9 follow-up: helpers need read access to payments on their own orders
-- so the Earnings page can show real figures (previously student-only select).
-- payments has no base grant to authenticated (unlike other tables), so grant it
-- first; RLS still gates which rows each member can see.

grant select on public.payments to authenticated;

drop policy if exists "helpers_can_view_own_payments" on public.payments;
create policy "helpers_can_view_own_payments"
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and o.helper_id = auth.uid()
    )
  );