-- The checkout route writes the Stripe Checkout Session id against the order so
-- it can be inspected, reused or expired before starting another attempt. Some
-- environments applied the earlier combined migration only partially, leaving
-- this table missing and making every checkout attempt fail at the tracking
-- step. Create it idempotently so those environments recover safely.
create table if not exists public.order_checkout_sessions (
  session_id text primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.order_checkout_sessions enable row level security;

create index if not exists idx_order_checkout_sessions_order_id
  on public.order_checkout_sessions (order_id);

-- Only the service-role client (the checkout API route and cleanup jobs) needs
-- this table. RLS is enabled with no client policy, so anon/authenticated
-- sessions cannot read or write it.
revoke all on table public.order_checkout_sessions from anon, authenticated;
