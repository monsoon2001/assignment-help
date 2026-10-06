-- Students can send a delivery back with a note describing exactly what needs
-- correcting. The note rides on the `deliveries` row (revision_note) so the
-- helper sees it next to the work they submitted, and a trigger notifies them.

alter table public.deliveries
  add column if not exists revision_note text;

alter table public.deliveries
  drop constraint if exists deliveries_revision_note_length_ck,
  add constraint deliveries_revision_note_length_ck check (revision_note is null or char_length(revision_note) <= 4000);

-- The student on the order may add a revision note. Helpers keep using
-- helpers_can_create_deliveries for their own submissions.
create policy "students_can_request_delivery_changes"
  on public.deliveries for insert
  to authenticated
  with check (
    revision_note is not null
    and exists (
      select 1 from public.orders o
      where o.id = order_id and o.student_id = auth.uid()
    )
  );

-- The assigned helper is told what the student wants changed.
create or replace function public.notify_revision_request()
  returns trigger
  language plpgsql
  security definer
  set search_path = 'public'
as $$
declare
  v_helper_id uuid;
  v_student_name text;
begin
  if new.revision_note is null then
    return new;
  end if;

  select o.helper_id, u.name
  into v_helper_id, v_student_name
  from public.orders o
  left join public.users u on u.id = o.student_id
  where o.id = new.order_id;

  if v_helper_id is null then
    return new;
  end if;

  insert into public.notifications (user_id, type, message, link)
  values (
    v_helper_id,
    'order',
    coalesce(v_student_name, 'The student') || ' requested changes on your delivery: ' ||
      left(new.revision_note, 140),
    '/helper/orders/' || new.order_id::text
  );

  return new;
end;
$$;

drop trigger if exists notify_revision_request_trg on public.deliveries;
create trigger notify_revision_request_trg
  after insert on public.deliveries
  for each row
  when (new.revision_note is not null)
  execute function public.notify_revision_request();