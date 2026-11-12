-- Record the student's Terms acceptance on each submitted request.
alter table public.requests
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text;
