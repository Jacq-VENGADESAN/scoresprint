create table if not exists public.question_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_code text not null,
  category text not null check (category in ('ambiguous', 'incorrect_answer', 'typo', 'explanation', 'other')),
  details text,
  selected_option text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

alter table public.question_reports enable row level security;

drop policy if exists "question_reports_insert_self" on public.question_reports;
create policy "question_reports_insert_self" on public.question_reports
  for insert with check (auth.uid() = user_id);

drop policy if exists "question_reports_select_self" on public.question_reports;
create policy "question_reports_select_self" on public.question_reports
  for select using (auth.uid() = user_id);

create index if not exists question_reports_open_idx
  on public.question_reports(status, created_at desc);

create index if not exists question_reports_question_idx
  on public.question_reports(question_code, status, created_at desc);

create or replace function public.import_managed_questions(
  p_questions jsonb,
  p_admin_email text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  imported_count integer := 0;
begin
  if jsonb_typeof(p_questions) <> 'array' then
    raise exception 'QUESTIONS_MUST_BE_AN_ARRAY';
  end if;
  if jsonb_array_length(p_questions) = 0 or jsonb_array_length(p_questions) > 500 then
    raise exception 'INVALID_IMPORT_SIZE';
  end if;
  if nullif(trim(p_admin_email), '') is null then
    raise exception 'MISSING_ADMIN_EMAIL';
  end if;

  if exists (
    select 1
    from (
      select lower(trim(row->>'code')) as code, count(*)
      from jsonb_array_elements(p_questions) as row
      group by lower(trim(row->>'code'))
      having count(*) > 1
    ) duplicates
  ) then
    raise exception 'DUPLICATE_CODES_IN_IMPORT';
  end if;

  if exists (
    select 1
    from public.questions question
    join jsonb_array_elements(p_questions) as row
      on question.code = lower(trim(row->>'code'))
  ) then
    raise exception 'QUESTION_CODE_ALREADY_EXISTS';
  end if;

  for item in select value from jsonb_array_elements(p_questions)
  loop
    perform public.save_managed_question(
      null,
      item->>'code',
      (item->>'part')::smallint,
      item->>'skillId',
      item->>'subskill',
      (item->>'difficulty')::smallint,
      round((item->>'targetTimeSeconds')::numeric * 1000)::integer,
      item->>'prompt',
      nullif(item->>'context', ''),
      item->>'explanation',
      nullif(item->>'trap', ''),
      (item->>'status')::public.question_status,
      item->'options',
      lower(trim(p_admin_email))
    );
    imported_count := imported_count + 1;
  end loop;

  return imported_count;
end;
$$;

revoke all on function public.import_managed_questions(jsonb, text) from public, anon, authenticated;
grant execute on function public.import_managed_questions(jsonb, text) to service_role;
