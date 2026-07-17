insert into public.skills (id, label, category, exam_weight) values
  ('listening_photographs', 'Photographies', 'listening', 0.90),
  ('listening_question_response', 'Questions-réponses', 'listening', 1.05)
on conflict (id) do update
set label = excluded.label,
    category = excluded.category,
    exam_weight = excluded.exam_weight;

create table if not exists public.listening_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('part1', 'part2', 'mixed')),
  total_questions smallint not null check (total_questions between 1 and 20),
  correct_answers smallint not null default 0 check (correct_answers between 0 and total_questions),
  estimated_score integer check (estimated_score between 5 and 495),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  part1_breakdown jsonb not null default '{"correct":0,"total":0,"accuracy":0}'::jsonb,
  part2_breakdown jsonb not null default '{"correct":0,"total":0,"accuracy":0}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.listening_attempts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.listening_runs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_code text not null,
  part smallint not null check (part in (1, 2)),
  skill_id text not null references public.skills(id),
  selected_option text not null check (selected_option in ('A', 'B', 'C', 'D')),
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  response_time_ms integer not null default 0 check (response_time_ms >= 0),
  play_count smallint not null default 0 check (play_count >= 0),
  slow_play_count smallint not null default 0 check (slow_play_count >= 0),
  created_at timestamptz not null default now(),
  unique (run_id, question_code)
);

create index if not exists listening_runs_user_completed_idx
  on public.listening_runs (user_id, completed_at desc);
create index if not exists listening_attempts_user_created_idx
  on public.listening_attempts (user_id, created_at desc);

alter table public.listening_runs enable row level security;
alter table public.listening_attempts enable row level security;

drop policy if exists "listening_runs_self" on public.listening_runs;
create policy "listening_runs_self" on public.listening_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "listening_attempts_self" on public.listening_attempts;
create policy "listening_attempts_self" on public.listening_attempts
  for all using (auth.uid() = user_id) with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.listening_runs run
      where run.id = run_id and run.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.listening_runs to authenticated;
grant select, insert, update, delete on public.listening_attempts to authenticated;
