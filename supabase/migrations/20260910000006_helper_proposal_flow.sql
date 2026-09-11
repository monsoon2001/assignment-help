-- Phase 3: helpers submit proposals and advance a request to proposal_sent.
-- Inserting into proposals is already covered by helpers_can_create_proposals
-- (0004). This policy lets the proposing helper flip the linked request's
-- status to 'proposal_sent' so the student sees it as "Reviewing Proposals".

create policy "helpers_can_advance_request_status"
  on public.requests for update to authenticated
  using (
    exists (
      select 1
      from public.proposals p
      where p.request_id = requests.id
        and p.helper_id = auth.uid()
    )
  )
  with check (
    status = 'proposal_sent'
    and exists (
      select 1
      from public.proposals p
      where p.request_id = requests.id
        and p.helper_id = auth.uid()
    )
  );