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

create or replace function public.save_managed_question(
  p_question_id uuid,
  p_code text,
  p_part smallint,
  p_skill_id text,
  p_subskill text,
  p_difficulty smallint,
  p_target_time_ms integer,
  p_prompt text,
  p_context text,
  p_explanation text,
  p_trap text,
  p_status public.question_status,
  p_options jsonb,
  p_admin_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  question_id uuid;
  previous_status public.question_status;
  option_count integer;
  correct_count integer;
  audit_action text;
  normalized_code text := lower(trim(p_code));
begin
  if normalized_code !~ '^[a-z0-9][a-z0-9-]{2,79}$' then
    raise exception 'INVALID_QUESTION_CODE';
  end if;
  if p_part not between 5 and 7 then
    raise exception 'INVALID_QUESTION_PART';
  end if;
  if p_difficulty not between 1 and 5 then
    raise exception 'INVALID_DIFFICULTY';
  end if;
  if p_target_time_ms not between 5000 and 600000 then
    raise exception 'INVALID_TARGET_TIME';
  end if;
  if nullif(trim(p_skill_id), '') is null
    or nullif(trim(p_subskill), '') is null
    or nullif(trim(p_prompt), '') is null
    or nullif(trim(p_explanation), '') is null
    or nullif(trim(p_admin_email), '') is null then
    raise exception 'MISSING_QUESTION_FIELD';
  end if;

  select count(*), count(*) filter (where coalesce((item->>'isCorrect')::boolean, false))
  into option_count, correct_count
  from jsonb_array_elements(coalesce(p_options, '[]'::jsonb)) as item;

  if option_count <> 4 or correct_count <> 1 then
    raise exception 'QUESTION_REQUIRES_FOUR_OPTIONS_AND_ONE_CORRECT';
  end if;

  if p_question_id is null then
    insert into public.questions (
      code, part, skill_id, subskill, difficulty, prompt, context,
      explanation, trap, status, target_time_ms, published_at
    ) values (
      normalized_code, p_part, trim(p_skill_id), trim(p_subskill), p_difficulty,
      trim(p_prompt), nullif(trim(coalesce(p_context, '')), ''), trim(p_explanation),
      nullif(trim(coalesce(p_trap, '')), ''), p_status, p_target_time_ms,
      case when p_status = 'published' then now() else null end
    ) returning id into question_id;
    audit_action := case when p_status = 'published' then 'published' else 'created' end;
  else
    select status into previous_status
    from public.questions
    where id = p_question_id
    for update;

    if not found then
      raise exception 'QUESTION_NOT_FOUND';
    end if;

    update public.questions set
      code = normalized_code,
      part = p_part,
      skill_id = trim(p_skill_id),
      subskill = trim(p_subskill),
      difficulty = p_difficulty,
      prompt = trim(p_prompt),
      context = nullif(trim(coalesce(p_context, '')), ''),
      explanation = trim(p_explanation),
      trap = nullif(trim(coalesce(p_trap, '')), ''),
      status = p_status,
      target_time_ms = p_target_time_ms
    where id = p_question_id;

    question_id := p_question_id;
    audit_action := case
      when previous_status <> 'published' and p_status = 'published' then 'published'
      when previous_status = 'published' and p_status <> 'published' then 'unpublished'
      when p_status = 'rejected' then 'archived'
      else 'updated'
    end;
  end if;

  delete from public.question_options where question_id = save_managed_question.question_id;

  insert into public.question_options (question_id, option_key, option_text, is_correct, feedback)
  select
    question_id,
    upper(trim(item->>'key')),
    trim(item->>'text'),
    coalesce((item->>'isCorrect')::boolean, false),
    nullif(trim(coalesce(item->>'feedback', '')), '')
  from jsonb_array_elements(p_options) as item;

  if exists (
    select 1 from public.question_options
    where question_id = save_managed_question.question_id
      and option_key not in ('A', 'B', 'C', 'D')
  ) then
    raise exception 'INVALID_OPTION_KEY';
  end if;

  insert into public.question_admin_events (
    question_id, question_code, admin_email, action, details
  ) values (
    question_id,
    normalized_code,
    lower(trim(p_admin_email)),
    audit_action,
    jsonb_build_object('status', p_status, 'part', p_part, 'skill_id', p_skill_id)
  );

  return question_id;
end;
$$;

revoke all on function public.save_managed_question(
  uuid, text, smallint, text, text, smallint, integer, text, text, text, text,
  public.question_status, jsonb, text
) from public, anon, authenticated;

grant execute on function public.save_managed_question(
  uuid, text, smallint, text, text, smallint, integer, text, text, text, text,
  public.question_status, jsonb, text
) to service_role;