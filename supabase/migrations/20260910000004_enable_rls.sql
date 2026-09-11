-- Row Level Security
-- Auth is not wired to the UI yet, but the policies below are ready for it.

alter table public.users enable row level security;
alter table public.helper_profiles enable row level security;
alter table public.requests enable row level security;
alter table public.proposals enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.deliveries enable row level security;
alter table public.reviews enable row level security;
alter table public.payments enable row level security;

-- users: everyone can list public profile data; a user can update their own row.
create policy "users_are_publicly_visible"
  on public.users for select
  using (true);

create policy "users_can_update_own_profile"
  on public.users for update
  using (auth.uid() = id);

-- helper_profiles: any signed-in user can view; a helper can create/update their own.
create policy "helper_profiles_are_publicly_visible"
  on public.helper_profiles for select
  using (true);

create policy "helpers_can_insert_own_profile"
  on public.helper_profiles for insert
  with check (auth.uid() = user_id);

create policy "helpers_can_update_own_profile"
  on public.helper_profiles for update
  using (auth.uid() = user_id);

-- requests: a student owns their requests; helpers can view open requests.
create policy "students_can_manage_own_requests"
  on public.requests for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

create policy "helpers_can_view_open_requests"
  on public.requests for select
  using (status in ('requested', 'proposal_sent'));

-- proposals: a helper can create; involved parties can view; the helper can update their own.
create policy "helpers_can_create_proposals"
  on public.proposals for insert
  with check (auth.uid() = helper_id);

create policy "involved_parties_can_view_proposals"
  on public.proposals for select
  using (
    auth.uid() = helper_id
    or exists (
      select 1 from public.requests r
      where r.id = proposals.request_id
        and r.student_id = auth.uid()
    )
  );

create policy "helpers_can_update_own_proposals"
  on public.proposals for update
  using (auth.uid() = helper_id);

-- orders: only the student and helper on the order can read/update it.
create policy "order_participants_can_view"
  on public.orders for select
  using (auth.uid() = student_id or auth.uid() = helper_id);

create policy "order_participants_can_update"
  on public.orders for update
  using (auth.uid() = student_id or auth.uid() = helper_id);

-- messages: only participants in the order can read/send.
create policy "order_participants_can_view_messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = messages.order_id
        and (auth.uid() = o.student_id or auth.uid() = o.helper_id)
    )
  );

create policy "order_participants_can_send_messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = messages.order_id
        and (auth.uid() = o.student_id or auth.uid() = o.helper_id)
        and auth.uid() = sender_id
    )
  );

-- deliveries: participants can read; the helper on the order can deliver.
create policy "order_participants_can_view_deliveries"
  on public.deliveries for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = deliveries.order_id
        and (auth.uid() = o.student_id or auth.uid() = o.helper_id)
    )
  );

create policy "helpers_can_create_deliveries"
  on public.deliveries for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = deliveries.order_id
        and o.helper_id = auth.uid()
    )
  );

-- reviews: anyone signed in can read; the student on the order can review.
create policy "reviews_are_publicly_visible"
  on public.reviews for select
  using (true);

create policy "students_can_review_own_orders"
  on public.reviews for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = reviews.order_id
        and o.student_id = auth.uid()
    )
  );

-- payments: the student can view payments on their orders. Writers are server-only.
create policy "students_can_view_own_payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id
        and o.student_id = auth.uid()
    )
  );

-- Default deny for server-only writes (service role bypasses RLS via the API key).
revoke all on public.payments from anon, authenticated;