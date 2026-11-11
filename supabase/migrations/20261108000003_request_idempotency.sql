-- A request submission carries a client-generated idempotency key. A double
-- click (or a retried request) can never create two rows for the same student
-- and key.
alter table public.requests
  add column if not exists idempotency_key text;

create unique index if not exists requests_student_idempotency_key_idx
  on public.requests (student_id, idempotency_key)
  where idempotency_key is not null;
