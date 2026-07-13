alter table public.user_mastery
  add column if not exists evidence_count integer not null default 0,
  add column if not exists correct_count integer not null default 0;

with evidence as (
  select user_id, skill_id, is_correct from public.practice_attempts
  union all
  select user_id, skill_id, is_correct from public.diagnostic_answers
), aggregated as (
  select
    user_id,
    skill_id,
    count(*)::integer as evidence_count,
    count(*) filter (where is_correct)::integer as correct_count
  from evidence
  group by user_id, skill_id
)
update public.user_mastery as mastery
set
  evidence_count = greatest(mastery.evidence_count, aggregated.evidence_count),
  correct_count = greatest(mastery.correct_count, aggregated.correct_count)
from aggregated
where mastery.user_id = aggregated.user_id
  and mastery.skill_id = aggregated.skill_id;

create table if not exists public.score_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('diagnostic', 'practice', 'mini_exam')),
  central_score integer not null check (central_score between 10 and 990),
  score_low integer not null check (score_low between 10 and 990),
  score_high integer not null check (score_high between 10 and 990),
  confidence text not null check (confidence in ('faible', 'moyenne', 'élevée')),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.mini_exam_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  total_questions integer not null default 30 check (total_questions > 0),
  correct_answers integer not null check (correct_answers >= 0),
  estimated_score integer not null check (estimated_score between 10 and 990),
  score_low integer not null check (score_low between 10 and 990),
  score_high integer not null check (score_high between 10 and 990),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  section_breakdown jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists public.mini_exam_answers (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.mini_exam_runs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_code text not null,
  part smallint not null check (part between 1 and 7),
  skill_id text not null references public.skills(id),
  selected_option text not null,
  correct_option text not null,
  is_correct boolean not null,
  response_time_ms integer not null default 0 check (response_time_ms >= 0),
  unique(run_id, question_code)
);

alter table public.score_snapshots enable row level security;
alter table public.mini_exam_runs enable row level security;
alter table public.mini_exam_answers enable row level security;

drop policy if exists "score_snapshots_self" on public.score_snapshots;
create policy "score_snapshots_self" on public.score_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "mini_exam_runs_self" on public.mini_exam_runs;
create policy "mini_exam_runs_self" on public.mini_exam_runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "mini_exam_answers_self" on public.mini_exam_answers;
create policy "mini_exam_answers_self" on public.mini_exam_answers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.score_snapshots to authenticated;
grant select, insert, update, delete on public.mini_exam_runs to authenticated;
grant select, insert, update, delete on public.mini_exam_answers to authenticated;

create index if not exists score_snapshots_user_created_idx
  on public.score_snapshots(user_id, created_at desc);
create index if not exists mini_exam_runs_user_completed_idx
  on public.mini_exam_runs(user_id, completed_at desc);
create index if not exists mini_exam_answers_run_idx
  on public.mini_exam_answers(run_id);

insert into public.score_snapshots (
  user_id,
  source,
  central_score,
  score_low,
  score_high,
  confidence,
  evidence_count,
  created_at
)
select
  run.user_id,
  'diagnostic',
  run.estimated_score,
  run.score_low,
  run.score_high,
  case when run.total_questions >= 30 then 'moyenne' else 'faible' end,
  run.total_questions,
  run.completed_at
from public.diagnostic_runs as run
where not exists (
  select 1
  from public.score_snapshots as snapshot
  where snapshot.user_id = run.user_id
    and snapshot.source = 'diagnostic'
    and snapshot.created_at = run.completed_at
);
