-- Complete helper profiles: add hourly rate + enrich the two seeded helpers.
alter table public.helper_profiles
  add column if not exists hourly_rate numeric not null default 20;

update public.helper_profiles hp
set hourly_rate = 30,
    rating_avg = 4.8,
    bio = 'Peer mentor for writing-heavy and humanities courses. I help with essay structure, argument development, research, citation formats (MLA/APA), and guided revision so you actually learn the material — not just submit it. Clear communication and on-time delivery, every time.',
    subjects = array['English Literature','History','Philosophy','Political Science','Sociology','Essay Writing','Research Help'],
    updated_at = now()
from public.users u
where u.id = hp.user_id and u.email = 'evilamigo2001@gmail.com';

update public.helper_profiles hp
set hourly_rate = 25,
    rating_avg = 4.7,
    bio = 'Peer mentor for STEM and business coursework. From problem sets to lab reports, I break concepts down step by step and walk you through methodology and data analysis. Direct, friendly, and reliable — send your questions anytime.',
    subjects = array['Mathematics','Statistics','Computer Science','Physics','Chemistry','Biology','Economics','Business Studies'],
    updated_at = now()
from public.users u
where u.id = hp.user_id and u.email = 'energywhite029@gmail.com';