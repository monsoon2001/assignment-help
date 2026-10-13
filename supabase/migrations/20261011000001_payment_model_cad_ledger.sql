-- Payment model change: platform-collected, CAD-only charges with a private
-- admin-only ledger and manual helper payouts.
--
-- Model:
--   * Every charge is collected by the platform's own Stripe account in CAD.
--   * There is NO Stripe Connect, destination charge, transfer, application fee
--     or Stripe payout. Helpers are paid manually (bank transfer / Wise).
--   * Students see a single total. The helper's share, Stripe fee and net are
--     recorded in a ledger readable only by admins.
--
-- All statements are idempotent. A ROLLBACK block is at the bottom.

-- ============================================================================
-- 1. Admin-only configuration. Never exposed to student/helper clients.
-- ============================================================================
create table if not exists public.platform_settings (
  id                          boolean primary key default true check (id),
  default_helper_share_percent numeric(5,2) not null default 80
    check (default_helper_share_percent between 0 and 100),
  helper_share_basis          text not null default 'gross'
    check (helper_share_basis in ('gross', 'net_of_stripe_fees')),
  updated_at                  timestamptz not null default now()
);

insert into public.platform_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;
revoke all on public.platform_settings from anon, authenticated;

drop policy if exists "platform_settings_admin_read" on public.platform_settings;
create policy "platform_settings_admin_read"
  on public.platform_settings for select to authenticated
  using (public.is_admin());

drop policy if exists "platform_settings_admin_write" on public.platform_settings;
create policy "platform_settings_admin_write"
  on public.platform_settings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Per-helper share, overriding the platform default.
create table if not exists public.helper_compensation (
  helper_id     uuid primary key references public.users (id) on delete cascade,
  share_percent numeric(5,2) not null default 80
    check (share_percent between 0 and 100),
  updated_at    timestamptz not null default now()
);

alter table public.helper_compensation enable row level security;
revoke all on public.helper_compensation from anon, authenticated;

drop policy if exists "helper_compensation_admin_read" on public.helper_compensation;
create policy "helper_compensation_admin_read"
  on public.helper_compensation for select to authenticated
  using (public.is_admin());

drop policy if exists "helper_compensation_admin_write" on public.helper_compensation;
create policy "helper_compensation_admin_write"
  on public.helper_compensation for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 2. Private ledger columns on payments. Defaults must precede the CHECK so the
--    constraint can be added idempotently.
-- ============================================================================
alter table public.payments
  add column if not exists gross_cad                       numeric(10,2),
  add column if not exists stripe_fee_cad                  numeric(10,2),
  add column if not exists net_cad                         numeric(10,2),
  add column if not exists helper_share_cad                numeric(10,2),
  add column if not exists helper_payout_status            text not null default 'unpaid',
  add column if not exists disputed                        boolean not null default false,
  add column if not exists stripe_balance_transaction_id   text,
  add column if not exists refunded_amount_cad             numeric(10,2) not null default 0;

alter table public.payments
  drop constraint if exists payments_helper_payout_status_ck,
  add constraint payments_helper_payout_status_ck
    check (helper_payout_status in ('unpaid', 'paid', 'on_hold'));

-- Backfill already-paid rows created before this migration so the ledger and the
-- helper earnings view are consistent. The exact Stripe fee is unknown for
-- historical rows, so net is approximated as gross and the helper share defaults
-- to 80%. New charges get the real fee/net/share from the webhook.
update public.payments
set gross_cad = coalesce(gross_cad, amount),
    net_cad = coalesce(net_cad, amount),
    helper_share_cad = coalesce(helper_share_cad, round(amount * 0.80, 2))
where status = 'paid'
  and (gross_cad is null or helper_share_cad is null);

-- Column-level grants: students/helpers may read only the non-sensitive fields.
-- The ledger columns (gross/fee/net/helper_share/payout_status/disputed) are
-- therefore invisible to them, even for their own rows. Admins read the full
-- row via the service-role client (which bypasses RLS and column grants).
revoke all on table public.payments from anon, authenticated;
grant select (id, order_id, amount, currency, status, receipt_url, created_at)
  on public.payments to authenticated;

-- ============================================================================
-- 3. Webhook idempotency: one row per processed Stripe event id.
-- ============================================================================
create table if not exists public.processed_stripe_events (
  event_id     text primary key,
  event_type   text,
  processed_at timestamptz not null default now()
);

alter table public.processed_stripe_events enable row level security;
revoke all on public.processed_stripe_events from anon, authenticated;

drop policy if exists "processed_stripe_events_admin_read" on public.processed_stripe_events;
create policy "processed_stripe_events_admin_read"
  on public.processed_stripe_events for select to authenticated
  using (public.is_admin());

-- ============================================================================
-- 4. Manual payouts. An order can never appear in two payouts: the
--    manual_payout_items unique(order_id) enforces it at the DB level.
-- ============================================================================
create table if not exists public.manual_payouts (
  id                 uuid primary key default gen_random_uuid(),
  helper_id          uuid not null references public.users (id) on delete restrict,
  amount_sent_cad    numeric(10,2) not null check (amount_sent_cad >= 0),
  amount_received    numeric(12,2),
  received_currency  text,
  method             text not null default 'wise',
  reference          text,
  order_ids          uuid[] not null default '{}',
  paid_at            timestamptz not null default now(),
  notes              text,
  created_by         uuid references public.users (id) on delete set null,
  created_at         timestamptz not null default now()
);

create index if not exists idx_manual_payouts_helper on public.manual_payouts (helper_id, paid_at desc);

create table if not exists public.manual_payout_items (
  payout_id  uuid not null references public.manual_payouts (id) on delete cascade,
  order_id   uuid not null references public.orders (id) on delete restrict,
  amount_cad numeric(10,2) not null check (amount_cad >= 0),
  primary key (payout_id, order_id),
  unique (order_id)
);

alter table public.manual_payouts enable row level security;
alter table public.manual_payout_items enable row level security;
revoke all on public.manual_payouts from anon, authenticated;
revoke all on public.manual_payout_items from anon, authenticated;

drop policy if exists "manual_payouts_admin_read" on public.manual_payouts;
create policy "manual_payouts_admin_read"
  on public.manual_payouts for select to authenticated
  using (public.is_admin());

drop policy if exists "manual_payout_items_admin_read" on public.manual_payout_items;
create policy "manual_payout_items_admin_read"
  on public.manual_payout_items for select to authenticated
  using (public.is_admin());

-- Atomic payout recorder. Called by the admin server action through the
-- service-role client. Validates every order belongs to the helper and is still
-- unpaid / not on hold, then inserts the payout, its items and flips the
-- payments to `paid` in a single transaction.
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
  v_payout_id uuid;
  v_bad       integer;
  v_owed      numeric(10,2);
begin
  if p_order_ids is null or array_length(p_order_ids, 1) is null then
    raise exception 'no orders selected';
  end if;
  if p_helper_id is null then
    raise exception 'helper is required';
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

  select coalesce(sum(p.helper_share_cad), 0) into v_owed
  from public.payments p
  where p.order_id = any(p_order_ids);

  insert into public.manual_payouts
    (helper_id, amount_sent_cad, amount_received, received_currency,
     method, reference, order_ids, notes, created_by)
  values
    (p_helper_id, coalesce(p_amount_sent_cad, v_owed), p_amount_received,
     p_received_currency, coalesce(p_method, 'wise'), p_reference, p_order_ids,
     p_notes, p_created_by)
  returning id into v_payout_id;

  insert into public.manual_payout_items (payout_id, order_id, amount_cad)
  select v_payout_id, p.order_id, coalesce(p.helper_share_cad, 0)
  from public.payments p
  where p.order_id = any(p_order_ids);

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
-- 5. Helper-facing read path. The view runs with the owner's privileges and is
--    filtered to the signed-in helper. `amount` is the helper's own share (what
--    they are owed), never the student's gross charge or the Stripe fee.
--
--    NOTE: CREATE OR REPLACE VIEW may only APPEND columns, so the new
--    helper_payout_status column goes last to match the existing view shape.
-- ============================================================================
create or replace view public.helper_payments as
select
  p.id,
  p.order_id,
  p.helper_share_cad as amount,
  'CAD'::text as currency,
  p.status,
  p.created_at,
  p.receipt_url,
  o.status as order_status,
  o.helper_id,
  pr.request_id,
  req.title as request_title,
  p.helper_payout_status
from public.payments p
join public.orders o on o.id = p.order_id
left join public.proposals pr on pr.id = o.proposal_id
left join public.requests req on req.id = pr.request_id
where o.helper_id = auth.uid();

grant select on public.helper_payments to authenticated;

-- ============================================================================
-- ROLLBACK (run manually to revert this migration)
-- ----------------------------------------------------------------------------
-- drop view if exists public.helper_payments;
--   -- then re-run 20261009000001_helper_payments_view.sql to restore it.
-- drop function if exists public.record_helper_payout(uuid, uuid[], numeric, text, text, text, numeric, text, uuid);
-- drop table if exists public.manual_payout_items;
-- drop table if exists public.manual_payouts;
-- drop table if exists public.processed_stripe_events;
-- alter table public.payments
--   drop column if exists gross_cad,
--   drop column if exists stripe_fee_cad,
--   drop column if exists net_cad,
--   drop column if exists helper_share_cad,
--   drop column if exists helper_payout_status,
--   drop column if exists disputed,
--   drop column if exists stripe_balance_transaction_id,
--   drop column if exists refunded_amount_cad;
-- revoke all on table public.payments from anon, authenticated;
-- grant select on public.payments to authenticated;  -- previous grant
-- drop table if exists public.helper_compensation;
-- drop table if exists public.platform_settings;
-- ============================================================================
