-- Payment receipts: store Stripe receipt URL + customer email so
-- students and helpers can view proof of payment in-app.
alter table public.payments
  add column if not exists receipt_url text,
  add column if not exists customer_email text;