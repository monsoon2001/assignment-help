-- Supersedes an earlier draft of this migration. Student proposal resolution
-- (pending -> accepted/declined) is already covered by
-- "students_can_respond_to_own_request_proposals" in 20260910000007_order_payment_flow.sql,
-- so this file exists only to drop the redundant stricter policy named below on
-- environments where it was previously applied. It is a no-op on fresh installs.

drop policy if exists "students_can_resolve_proposals_on_own_requests" on public.proposals;