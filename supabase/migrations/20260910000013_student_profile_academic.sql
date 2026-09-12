-- Student profile academic details: editable institution + level of study.
alter table public.users
  add column if not exists institution text,
  add column if not exists level_of_study text;

-- Keep existing signups working (trigger inserts don't need these columns).