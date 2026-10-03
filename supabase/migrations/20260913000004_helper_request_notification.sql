-- Notify a helper the moment a student targets them with a request (and when
-- a student re-assigns a request to a different helper). The link points at
-- the helper's request workspace so opening the chat clears the unread badge.

create or replace function public.notify_new_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_name text;
begin
  if new.helper_id is null
     or (tg_op = 'UPDATE' and old.helper_id is not distinct from new.helper_id) then
    return new;
  end if;

  select u.name into v_student_name from public.users u where u.id = new.student_id;

  insert into public.notifications (user_id, type, message, link)
  values (
    new.helper_id,
    'request',
    format(
      'A student%s sent you a request: "%s".',
      case when v_student_name is not null then ' (' || v_student_name || ')' else '' end,
      coalesce(nullif(trim(new.title), ''), 'New request')
    ),
    '/helper/requests/' || new.id::text
  );
  return new;
end;
$$;

create trigger notify_new_request_trg
  after insert or update on public.requests
  for each row execute function public.notify_new_request();