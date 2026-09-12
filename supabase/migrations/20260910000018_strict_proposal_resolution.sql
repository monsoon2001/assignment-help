-- Tighten student proposal resolution: a student may only resolve a proposal
-- that is still pending. The original policy (20260910000007) matched any
-- proposal on the student's request, so an accepted/paid proposal could be
-- re-flipped to declined, which also incorrectly rewound the request status.

drop policy if exists "students_can_respond_to_own_request_proposals" on public.proposals;
create policy "students_can_respond_to_own_request_proposals"
  on public.proposals for update to authenticated
  using (
    proposals.status = 'pending'
    and exists (
      select 1
      from public.requests r
      where r.id = proposals.request_id
        and r.student_id = auth.uid()
    )
  )
  with check (status in ('accepted', 'declined'));