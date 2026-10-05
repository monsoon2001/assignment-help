-- Give the automated test helper accounts real display names and complete public
-- profiles, so /browse-helpers does not advertise itself as populated by
-- "QA3 Helper", "Probe Helper" and "Seed Helper".
--
-- SCOPE, and why it is narrow:
--   Only disposable accounts on the reserved @peercraft.test domain are touched.
--   The other helper accounts on this project are real gmail signups belonging to
--   actual people, including the project owner's own three accounts. Renaming a
--   real account to a fabricated identity would misattribute it to someone who
--   does not exist, and users.name is displayed inside 19 orders, 25 proposals
--   and 4 reviews, so the rename propagates into transaction history.
--
--   Do not widen this to "any helper whose name looks like a placeholder". On an
--   earlier pass the attempt keyed off an unset name and correctly matched zero
--   rows; a looser name-shape heuristic instead risks overwriting legitimate
--   one-word real names such as "Cher".
--
-- NOT SET HERE:
--   rating_avg and reviews. rating_avg is recomputed from public.reviews by
--   recalculate_helper_rating(), so a hand-written score either gets overwritten
--   or sits next to an empty review list. New helpers with no reviews yet is both
--   honest and ordinary on a real marketplace.
--
-- Safety:
--   * requires role = 'helper' AND email LIKE '%@peercraft.test'
--   * requires the current name to still be one of the known test placeholders,
--     so re-running after a rename assigns nothing
--   * helper_profiles is upserted, so missing rows are created rather than
--     silently skipped
--   * only the six names actually in use are declared; spares are left out so a
--     future run cannot collide with a real account's name

with new_names(full_name, subjects, hourly_rate, bio) as (
  values
    (
      'Aayusha Adhikari',
      array['Nursing','Biology','Anatomy & Physiology','Academic Writing','Research Help']::text[],
      28,
      'Nursing and biomedical coursework is where I am most useful. I help with care plans, clinical case write-ups, evidence summaries and referencing, and I am comfortable with APA and Harvard formats. I explain the reasoning behind the guidance rather than just handing you the answer, so the next assessment is easier on its own.'
    ),
    (
      'Ananya Sharma',
      array['English Literature','Academic Writing','Essay Writing','MLA & APA Formatting','Proofreading']::text[],
      22,
      'Literature and academic writing: close reading, essay structure, argument development, and getting citations and references into a consistent format. I work best when you send the brief early, because then we can shape the argument before you draft rather than repair it afterwards.'
    ),
    (
      'Diya Nair',
      array['Psychology','Sociology','Research Methods','Statistics','Academic Writing','Editing']::text[],
      23,
      'Psychology and research methods: study design, ethics applications, interpreting results, and the write-up that turns a messy analysis into a clear argument. I will push back on interpretations the evidence does not support, which usually makes the argument more defensible rather than lower.'
    ),
    (
      'Prerna Thapa',
      array['Mathematics','Statistics','Calculus','Algebra','Math & Statistics Help','Data Analysis']::text[],
      24,
      'Maths and statistics, from problem sets through to full analyses. I work through derivations step by step rather than jumping to the answer, and I am comfortable in R, SPSS and Excel. If a formula is not sticking, tell me and I will approach it a different way.'
    ),
    (
      'Riya Patel',
      array['Physics','Chemistry','Engineering','Mathematics','Technical Writing','Lab Report']::text[],
      31,
      'Physics, chemistry and engineering problems, plus the write-ups that go with them. I work through mechanics, electromagnetism and thermodynamics at a pace that makes the method repeatable, and I cover unit consistency and error analysis, which is usually where marks are lost.'
    ),
    (
      'Sneha Shrestha',
      array['Computer Science','Python','Java','SQL','Data Structures','Algorithms','Programming Help']::text[],
      32,
      'Programming assignments, debugging and project work. I focus on getting you to a working solution and then explaining why it works, including complexity and edge cases, because most of the marks sit in the explanation rather than the code. Happy to look at your approach before you start writing.'
    )
),
numbered as (
  select
    full_name, subjects, hourly_rate, bio,
    row_number() over (order by full_name) as idx
  from new_names
),
targets as (
  select
    u.id,
    row_number() over (order by u.created_at, u.id) as idx
  from public.users u
  where u.role = 'helper'
    and u.email like '%@peercraft.test'
    and u.name in ('QA3 Helper', 'Probe Helper', 'Seed Helper')
),
assigned as (
  update public.users u
  set name       = n.full_name,
      updated_at = now()
  from numbered n
  join targets t on t.idx = n.idx
  where u.id = t.id
  returning u.id, n.full_name, n.subjects, n.hourly_rate, n.bio
)
-- skills mirrors subjects: helpers/[id]/page.tsx renders skills, and leaving it
-- empty leaves a visible empty section on the profile.
insert into public.helper_profiles (user_id, subjects, skills, bio, hourly_rate)
select a.id, a.subjects, a.subjects, a.bio, a.hourly_rate
from assigned a
on conflict (user_id) do update
set subjects    = excluded.subjects,
    skills      = excluded.skills,
    bio         = excluded.bio,
    hourly_rate = excluded.hourly_rate,
    updated_at  = now()
where public.helper_profiles.bio is distinct from excluded.bio
   or public.helper_profiles.hourly_rate is distinct from excluded.hourly_rate;