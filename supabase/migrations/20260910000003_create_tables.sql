-- Core tables

create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       public.user_role not null default 'student',
  name       text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.helper_profiles (
  user_id   uuid primary key references public.users (id) on delete cascade,
  subjects  text[] not null default '{}',
  bio       text,
  skills    text[] not null default '{}',
  rating_avg numeric(3, 2) not null default 0 check (rating_avg between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requests (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.users (id) on delete cascade,
  title       text not null,
  description text,
  subject     text,
  deadline    timestamptz,
  file_urls   text[] not null default '{}',
  status      public.request_status not null default 'requested',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.proposals (
  id                 uuid primary key default gen_random_uuid(),
  request_id         uuid not null references public.requests (id) on delete cascade,
  helper_id          uuid not null references public.users (id) on delete cascade,
  price              numeric(10, 2) not null check (price >= 0),
  description        text,
  revisions_included int not null default 0,
  expires_at         timestamptz,
  status             public.proposal_status not null default 'pending',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (request_id, helper_id)
);

create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null unique references public.proposals (id) on delete cascade,
  student_id  uuid not null references public.users (id) on delete cascade,
  helper_id   uuid not null references public.users (id) on delete cascade,
  status      public.order_status not null default 'payment_pending',
  price       numeric(10, 2) not null check (price >= 0),
  deadline    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  sender_id       uuid not null references public.users (id) on delete cascade,
  body            text not null,
  attachment_url  text,
  created_at      timestamptz not null default now()
);

create table public.deliveries (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  message    text,
  file_urls  text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null unique references public.orders (id) on delete cascade,
  rating     int not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id                        uuid primary key default gen_random_uuid(),
  order_id                  uuid not null references public.orders (id) on delete cascade,
  amount                    numeric(10, 2) not null check (amount >= 0),
  stripe_payment_intent_id  text unique,
  status                    public.payment_status not null default 'pending',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Indexes for the most common query paths
create index idx_requests_student_id on public.requests (student_id);
create index idx_requests_status on public.requests (status);
create index idx_proposals_request_id on public.proposals (request_id);
create index idx_proposals_helper_id on public.proposals (helper_id);
create index idx_orders_student_id on public.orders (student_id);
create index idx_orders_helper_id on public.orders (helper_id);
create index idx_messages_order_id on public.messages (order_id);
create index idx_deliveries_order_id on public.deliveries (order_id);
create index idx_payments_order_id on public.payments (order_id);

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger helper_profiles_set_updated_at
  before update on public.helper_profiles
  for each row execute function public.set_updated_at();

create trigger requests_set_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- Automatically create a public.users row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();