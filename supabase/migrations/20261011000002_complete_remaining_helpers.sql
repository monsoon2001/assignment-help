-- Complete the remaining helper profiles and give the six seeded, non-Google
-- helpers distinct female portraits.
--
-- SCOPE: only data on this project's demo/test accounts. Matched by name for the
-- six seeded helpers (their auth emails are changed separately, so name is the
-- stable key here) and by Gmail address for the real Google accounts.
-- Safe to re-run: helper_profiles is upserted, avatar_url updates are idempotent.

-- 1) Distinct female portraits for the six seeded helpers (they all currently
--    share a single placeholder image). URLs match src/lib/avatars.ts.
update public.users set avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop', updated_at = now() where role = 'helper' and name = 'Sneha Shrestha';
update public.users set avatar_url = 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=256&auto=format&fit=crop', updated_at = now() where role = 'helper' and name = 'Riya Patel';
update public.users set avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop', updated_at = now() where role = 'helper' and name = 'Prerna Thapa';
update public.users set avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop', updated_at = now() where role = 'helper' and name = 'Diya Nair';
update public.users set avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop', updated_at = now() where role = 'helper' and name = 'Ananya Sharma';
update public.users set avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop', updated_at = now() where role = 'helper' and name = 'Aayusha Adhikari';

-- Also mirror subjects into skills for the one profile that left skills empty.
update public.helper_profiles hp
set skills = hp.subjects, updated_at = now()
from public.users u
where u.id = hp.user_id
  and u.email = 'evilamigo2001@gmail.com'
  and (hp.skills is null or array_length(hp.skills, 1) is null);

-- 2) Profiles for the Google helper accounts that had none. Names and Google
--    photos are intentionally left untouched.
insert into public.helper_profiles (user_id, subjects, skills, bio, hourly_rate)
select u.id, v.subjects, v.subjects, v.bio, v.rate
from (values
  (
    'monsoon6895@gmail.com',
    array['Mathematics','Statistics','Physics','Economics','Data Analysis','Calculus']::text[],
    27,
    'Mathematics, statistics and economics at problem-set level. I work through derivations step by step and explain the method so you can repeat it, with practice questions and clear working.'
  ),
  (
    'monsoonparajuli26@gmail.com',
    array['Computer Science','Python','Web Development','Databases','Algorithms','Programming Help']::text[],
    29,
    'Programming, debugging and project work across Python and the web stack. I focus on getting you to a working solution and then explaining the reasoning, complexity and edge cases.'
  ),
  (
    'sanchitaa286@gmail.com',
    array['English Literature','Academic Writing','Essay Writing','Proofreading','Research Help','Sociology']::text[],
    26,
    'Literature and academic writing: close reading, essay structure, argument development, referencing and proofreading, with feedback that helps you improve the draft rather than just edit it.'
  )
) as v(email, subjects, rate, bio)
join public.users u on u.email = v.email and u.role = 'helper'
on conflict (user_id) do update
set subjects    = excluded.subjects,
    skills      = excluded.skills,
    bio         = excluded.bio,
    hourly_rate = excluded.hourly_rate,
    updated_at  = now()
where public.helper_profiles.bio is distinct from excluded.bio
   or public.helper_profiles.hourly_rate is distinct from excluded.hourly_rate;
