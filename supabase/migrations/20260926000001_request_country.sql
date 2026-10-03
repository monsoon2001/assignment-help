-- Student country on the request, so the default payment currency can be
-- derived when the student later accepts a helper's offer.

alter table public.requests
  add column country text;

comment on column public.requests.country is
  'Country chosen by the student when submitting the request. Drives the default payment currency (see COUNTRY_CURRENCY in src/lib/currency.ts); anything unrecognised defaults to USD.';

-- Backfill existing rows to USD behaviour rather than leaving them null.
update public.requests set country = 'United States' where country is null;
