create extension if not exists pgcrypto;

create type public.question_status as enum ('draft', 'auto_reviewed', 'human_reviewed', 'published', 'rejected');
create type public.subscription_status as enum ('inactive', 'active', 'past_due', 'cancelled', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  current_score integer check (current_score between 10 and 990),
  target_score integer not null check (target_score between 10 and 990),
  exam_date date,
  daily_minutes integer not null default 20 check (daily_minutes between 5 and 180),
  created_at timestamptz not null default now()
);

create table public.skills (
  id text primary key,
  label text not null,
  category text not null,
  exam_weight numeric(5,4) not null default 1
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  part smallint not null check (part between 1 and 7),
  skill_id text not null references public.skills(id),
  subskill text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  prompt text not null,
  explanation text not null,
  trap text,
  status public.question_status not null default 'draft',
  audio_path text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  option_key text not null,
  option_text text not null,
  is_correct boolean not null default false,
  unique(question_id, option_key)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  selected_option_id uuid references public.question_options(id),
  is_correct boolean not null,
  response_time_ms integer not null check (response_time_ms >= 0),
  confidence smallint check (confidence between 1 and 5),
  created_at timestamptz not null default now()
);

create table public.user_mastery (
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_id text not null references public.skills(id),
  mastery numeric(5,2) not null default 0 check (mastery between 0 and 100),
  repeated_errors integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  planned_minutes integer not null,
  completed_minutes integer not null default 0,
  plan jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_payment_id text,
  plan_code text not null,
  status public.subscription_status not null default 'inactive',
  access_starts_at timestamptz,
  access_ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_goals enable row level security;
alter table public.attempts enable row level security;
alter table public.user_mastery enable row level security;
alter table public.study_sessions enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_self" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "goals_self" on public.user_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "attempts_self" on public.attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mastery_self" on public.user_mastery for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_self" on public.study_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions_self" on public.subscriptions for select using (auth.uid() = user_id);

insert into public.skills (id, label, category, exam_weight) values
  ('grammar_tenses', 'Temps verbaux', 'grammar', 1.00),
  ('grammar_prepositions', 'Prépositions', 'grammar', 0.90),
  ('reading_inference', 'Inférences', 'reading', 1.10),
  ('listening_conversations', 'Conversations', 'listening', 1.15),
  ('business_vocabulary', 'Vocabulaire professionnel', 'vocabulary', 0.95)
on conflict do nothing;
