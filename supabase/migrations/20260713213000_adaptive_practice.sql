create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_code text not null,
  skill_id text not null references public.skills(id),
  subskill text not null,
  selected_option text not null check (selected_option in ('A', 'B', 'C', 'D')),
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  response_time_ms integer not null default 0 check (response_time_ms >= 0),
  mastery_before numeric(5,2) not null check (mastery_before between 0 and 100),
  mastery_after numeric(5,2) not null check (mastery_after between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists practice_attempts_user_created_idx
  on public.practice_attempts (user_id, created_at desc);

create index if not exists practice_attempts_user_skill_idx
  on public.practice_attempts (user_id, skill_id, created_at desc);

create table if not exists public.user_error_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_code text not null,
  skill_id text not null references public.skills(id),
  subskill text not null,
  title text not null,
  error_count integer not null default 1 check (error_count >= 0),
  success_streak integer not null default 0 check (success_streak >= 0),
  last_selected_option text check (last_selected_option in ('A', 'B', 'C', 'D')),
  last_attempt_at timestamptz not null default now(),
  next_review_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_code)
);

create index if not exists user_error_items_due_idx
  on public.user_error_items (user_id, resolved_at, next_review_at);

alter table public.practice_attempts enable row level security;
alter table public.user_error_items enable row level security;

drop policy if exists "practice_attempts_self" on public.practice_attempts;
create policy "practice_attempts_self"
on public.practice_attempts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_error_items_self" on public.user_error_items;
create policy "user_error_items_self"
on public.user_error_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.practice_attempts to authenticated;
grant select, insert, update, delete on public.user_error_items to authenticated;
