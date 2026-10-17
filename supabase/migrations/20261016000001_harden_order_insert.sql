-- Security hardening: orders are only ever created by the server.
--
-- The previous client-facing INSERT policy ("students_can_create_orders")
-- checked ownership but let the client supply the financial columns. A student
-- could accept nothing and instead insert an order with a forged
-- charge_amount/charge_currency (e.g. 0.50 CAD) and then hit /api/checkout,
-- paying far less than the proposal price.
--
-- Orders are now inserted exclusively by /api/orders/accept using the service
-- role, which derives price, currency, helper and local charge from the
-- proposal plus the student's saved country. Dropping the policy makes direct
-- client inserts fail closed (RLS denies by default); the service role is not
-- subject to RLS.

drop policy if exists "students_can_create_orders" on public.orders;
