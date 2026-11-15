-- Add fee-inclusive pricing columns to platform_settings, proposals, and orders
-- Group C: Pricing (fixes 3 and 4)

-- 1. Admin-configurable rates on platform_settings
alter table public.platform_settings
  add column if not exists stripe_pct      numeric(6, 4) not null default 0.029,
  add column if not exists stripe_fixed    numeric(6, 2) not null default 0.30,
  add column if not exists intl_card_pct   numeric(6, 4) not null default 0.008,
  add column if not exists conversion_pct  numeric(6, 4) not null default 0.02;

comment on column public.platform_settings.stripe_pct is
  'Standard Stripe percentage fee (default 0.029 = 2.9%).';
comment on column public.platform_settings.stripe_fixed is
  'Standard Stripe fixed fee in CAD (default 0.30 = $0.30).';
comment on column public.platform_settings.intl_card_pct is
  'Additional Stripe percentage fee for international cards (default 0.008 = 0.8%).';
comment on column public.platform_settings.conversion_pct is
  'Additional Stripe currency conversion fee (default 0.02 = 2.0%).';

-- 2. Store both base and fee-inclusive final price on proposals
alter table public.proposals
  add column if not exists base_cad   numeric(10, 2),
  add column if not exists final_cad  numeric(10, 2),
  add column if not exists fee_cad    numeric(10, 2);

-- Backfill existing proposals: base_cad is price, final_cad is price if unset
update public.proposals
set base_cad = coalesce(base_cad, price),
    final_cad = coalesce(final_cad, price),
    fee_cad = coalesce(fee_cad, 0)
where final_cad is null;

comment on column public.proposals.base_cad is
  'Helper entered base amount in CAD before fees.';
comment on column public.proposals.final_cad is
  'Final fee-inclusive amount in CAD shown to the student and charged by Stripe.';
comment on column public.proposals.fee_cad is
  'Fee amount in CAD (final_cad - base_cad).';

-- 3. Ensure orders table has base_cad, final_cad, fee_cad for clarity
alter table public.orders
  add column if not exists fee_cad    numeric(10, 2);

-- 4. Ensure payments table stores base_cad, final_cad, and fee_cad for the admin ledger
alter table public.payments
  add column if not exists base_cad   numeric(10, 2),
  add column if not exists final_cad  numeric(10, 2),
  add column if not exists fee_cad    numeric(10, 2);

-- Backfill existing payments
update public.payments
set base_cad = coalesce(base_cad, gross_cad, amount),
    final_cad = coalesce(final_cad, gross_cad, amount),
    fee_cad = coalesce(fee_cad, platform_fee_cad, 0)
where final_cad is null;
