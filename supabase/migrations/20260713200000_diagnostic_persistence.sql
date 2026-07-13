insert into public.skills (id, label, category, exam_weight) values
  ('grammar_structure', 'Structure grammaticale', 'grammar', 1.00),
  ('reading_detail', 'Compréhension des détails', 'reading', 1.05)
on conflict (id) do update
set label = excluded.label,
    category = excluded.category,
    exam_weight = excluded.exam_weight;

create table if not exists public.diagnostic_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  total_questions smallint not null check (total_questions > 0),
  correct_answers smallint not null check (correct_answers >= 0 and correct_answers <= total_questions),
  estimated_score integer not null check (estimated_score between 10 and 990),
  score_low integer not null check (score_low between 10 and 990),
  score_high integer not null check (score_high between 10 and 990),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  skill_breakdown jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists public.diagnostic_answers (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.diagnostic_runs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_code text not null,
  skill_id text not null references public.skills(id),
  selected_option text not null check (selected_option in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  response_time_ms integer not null default 0 check (response_time_ms >= 0),
  created_at timestamptz not null default now(),
  unique (run_id, question_code)
);

create index if not exists diagnostic_runs_user_completed_idx
  on public.diagnostic_runs (user_id, completed_at desc);

create index if not exists diagnostic_answers_user_skill_idx
  on public.diagnostic_answers (user_id, skill_id, created_at desc);

alter table public.diagnostic_runs enable row level security;
alter table public.diagnostic_answers enable row level security;

drop policy if exists "diagnostic_runs_self" on public.diagnostic_runs;
create policy "diagnostic_runs_self"
on public.diagnostic_runs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "diagnostic_answers_self" on public.diagnostic_answers;
create policy "diagnostic_answers_self"
on public.diagnostic_answers
for all
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.diagnostic_runs run
    where run.id = run_id
      and run.user_id = auth.uid()
  )
);

grant select, insert, update, delete on public.diagnostic_runs to authenticated;
grant select, insert, update, delete on public.diagnostic_answers to authenticated;
grant select on public.skills to authenticated;
