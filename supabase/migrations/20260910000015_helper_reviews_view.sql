-- Public helper reviews. `reviews` are public by design
-- (`reviews_are_publicly_visible`), but `orders` RLS only allows the student
-- and helper on an order to read it. That made the profile page's
-- `reviews` -> `orders!inner` embed return nothing for anonymous visitors and
-- non-participants.
--
-- A plain view runs with the **owner's** privileges, and RLS is not applied to
-- the table owner unless `force row level security` is set, so reading through
-- this view bypasses `orders` RLS. It only exposes fields already meant to be
-- public: the rating, comment, reviewer identity, and helper_id used to filter.

create or replace view public.helper_reviews as
select
  r.id,
  r.order_id,
  r.rating,
  r.comment,
  r.created_at,
  o.helper_id,
  o.student_id,
  u.id as student_user_id,
  u.name as student_name,
  u.avatar_url as student_avatar_url
from public.reviews r
join public.orders o on o.id = r.order_id
left join public.users u on u.id = o.student_id;

grant select on public.helper_reviews to anon, authenticated;