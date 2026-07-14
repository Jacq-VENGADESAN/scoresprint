alter table public.questions
  add column if not exists code text,
  add column if not exists context text,
  add column if not exists target_time_ms integer not null default 30000 check (target_time_ms between 5000 and 600000),
  add column if not exists updated_at timestamptz not null default now();

alter table public.question_options
  add column if not exists feedback text;

create unique index if not exists questions_code_unique_idx
  on public.questions(code)
  where code is not null;

create index if not exists questions_published_skill_idx
  on public.questions(status, skill_id, difficulty, published_at desc);

create index if not exists question_options_question_key_idx
  on public.question_options(question_id, option_key);

alter table public.questions enable row level security;
alter table public.question_options enable row level security;

revoke all on public.questions from anon, authenticated;
revoke all on public.question_options from anon, authenticated;

drop policy if exists "questions_no_direct_access" on public.questions;
create policy "questions_no_direct_access" on public.questions
  for select using (false);

drop policy if exists "question_options_no_direct_access" on public.question_options;
create policy "question_options_no_direct_access" on public.question_options
  for select using (false);

insert into public.skills (id, label, category, exam_weight) values
  ('grammar_structure', 'Structure grammaticale', 'grammar', 1.00),
  ('reading_details', 'Compréhension des détails', 'reading', 1.05)
on conflict (id) do update set
  label = excluded.label,
  category = excluded.category,
  exam_weight = excluded.exam_weight;

create table if not exists public.question_admin_events (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete set null,
  question_code text,
  admin_email text not null,
  action text not null check (action in ('created', 'updated', 'published', 'unpublished', 'archived')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.question_admin_events enable row level security;
revoke all on public.question_admin_events from anon, authenticated;

create or replace function public.touch_question_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if old.status = 'published' and new.status <> 'published' then
    new.published_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists questions_touch_updated_at on public.questions;
create trigger questions_touch_updated_at
before update on public.questions
for each row execute function public.touch_question_updated_at();