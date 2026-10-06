-- Notify the assigned helper as soon as a student submits a new request.
-- Previously, helpers only saw the request after the student sent a message
-- because the only notification trigger was on message INSERT.

CREATE OR REPLACE FUNCTION public.notify_new_request()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
declare
  v_student_name text;
begin
  if new.helper_id is null then
    return new;
  end if;

  select u.name into v_student_name
  from public.users u
  where u.id = new.student_id;

  insert into public.notifications (user_id, type, message, link)
  values (
    new.helper_id,
    'request',
    coalesce(v_student_name, 'A student') || ' sent you a new request: ' || new.title,
    '/helper/requests/' || new.id::text
  );

  return new;
end;
$$;

DROP TRIGGER IF EXISTS notify_new_request_trg ON public.requests;
CREATE TRIGGER notify_new_request_trg
  AFTER INSERT ON public.requests
  FOR EACH ROW
  WHEN (NEW.helper_id IS NOT NULL)
  EXECUTE FUNCTION public.notify_new_request();

DROP TRIGGER IF EXISTS notify_reassigned_request_trg ON public.requests;
CREATE TRIGGER notify_reassigned_request_trg
  AFTER UPDATE OF helper_id ON public.requests
  FOR EACH ROW
  WHEN (NEW.helper_id IS NOT NULL AND (OLD.helper_id IS DISTINCT FROM NEW.helper_id))
  EXECUTE FUNCTION public.notify_new_request();
