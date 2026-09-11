-- Phase 4/5/6: order creation from a proposal, payments, workspace storage,
-- realtime chat/deliveries, and helper rating recalculation.

-- 1. Students create an order when accepting a proposal on their own request.
create policy "students_can_create_orders"
  on public.orders for insert to authenticated
  with check (
    auth.uid() = student_id
    and exists (
      select 1
      from public.proposals p
      where p.id = orders.proposal_id
        and exists (
          select 1
          from public.requests r
          where r.id = p.request_id
            and r.student_id = auth.uid()
        )
    )
  );

-- 2. Students may accept or decline proposals on their own requests.
create policy "students_can_respond_to_own_request_proposals"
  on public.proposals for update to authenticated
  using (
    exists (
      select 1
      from public.requests r
      where r.id = proposals.request_id
        and r.student_id = auth.uid()
    )
  )
  with check (status in ('accepted', 'declined'));

-- 3. Storage bucket for chat attachments and deliverables.
insert into storage.buckets (id, name, public)
values ('order-files', 'order-files', true)
on conflict (id) do nothing;

create policy "order_files_public_read"
  on storage.objects for select
  using (bucket_id = 'order-files');

-- Participants of the order named by the first path segment can upload.
create policy "order_files_participants_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'order-files'
    and exists (
      select 1
      from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and (o.student_id = auth.uid() or o.helper_id = auth.uid())
    )
  );

create policy "order_files_participants_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'order-files'
    and exists (
      select 1
      from public.orders o
      where o.id::text = (storage.foldername(name))[1]
        and (o.student_id = auth.uid() or o.helper_id = auth.uid())
    )
  );

-- 4. Realtime: broadcast new messages and deliveries to participants.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
    ) then
      alter publication supabase_realtime add table public.messages;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'deliveries'
    ) then
      alter publication supabase_realtime add table public.deliveries;
    end if;
  end if;
end $$;

-- 5. Recalculate a helper's average rating whenever a new review is added.
create or replace function public.recalculate_helper_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_helper uuid;
  v_avg numeric(3, 2);
begin
  select o.helper_id into v_helper
  from public.orders o
  where o.id = new.order_id;

  if v_helper is null then
    return new;
  end if;

  select coalesce(avg(r.rating), 0) into v_avg
  from public.reviews r
  join public.orders o on o.id = r.order_id
  where o.helper_id = v_helper;

  insert into public.helper_profiles (user_id, rating_avg)
  values (v_helper, v_avg)
  on conflict (user_id)
  do update set rating_avg = excluded.rating_avg;

  return new;
end;
$$;

create trigger reviews_recalculate_helper_rating
  after insert on public.reviews
  for each row execute function public.recalculate_helper_rating();