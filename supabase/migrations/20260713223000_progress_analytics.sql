alter table public.study_sessions
  add column if not exists mode text not null default 'adaptive'
    check (mode in ('adaptive', 'review')),
  add column if not exists total_questions integer not null default 0
    check (total_questions >= 0),
  add column if not exists correct_answers integer not null default 0
    check (correct_answers >= 0 and correct_answers <= total_questions),
  add column if not exists duration_ms integer not null default 0
    check (duration_ms >= 0),
  add column if not exists skill_summary jsonb not null default '[]'::jsonb;

alter table public.practice_attempts
  add column if not exists session_id uuid references public.study_sessions(id) on delete set null;

create index if not exists practice_attempts_session_idx
  on public.practice_attempts (session_id, created_at);

create index if not exists study_sessions_user_completed_idx
  on public.study_sessions (user_id, completed_at desc)
  where completed_at is not null;

grant select, insert, update, delete on public.study_sessions to authenticated;
