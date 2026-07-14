create table if not exists public.usage_counters (
  user_id uuid not null references public.profiles(id) on delete cascade,
  metric text not null check (metric in ('practice_session', 'mini_exam')),
  period_start date not null,
  usage_count integer not null default 0 check (usage_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, metric, period_start)
);

alter table public.usage_counters enable row level security;

drop policy if exists "usage_counters_self" on public.usage_counters;
create policy "usage_counters_self" on public.usage_counters
  for select using (auth.uid() = user_id);

grant select on public.usage_counters to authenticated;

create or replace function public.consume_usage_counter(
  p_metric text,
  p_period_start date,
  p_limit integer
)
returns table (allowed boolean, usage_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_count integer;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_metric not in ('practice_session', 'mini_exam') then
    raise exception 'INVALID_USAGE_METRIC';
  end if;

  if p_limit <= 0 then
    return query select false, 0;
    return;
  end if;

  select counter.usage_count
  into current_count
  from public.usage_counters as counter
  where counter.user_id = current_user_id
    and counter.metric = p_metric
    and counter.period_start = p_period_start
  for update;

  current_count := coalesce(current_count, 0);

  if current_count >= p_limit then
    return query select false, current_count;
    return;
  end if;

  insert into public.usage_counters (user_id, metric, period_start, usage_count, updated_at)
  values (current_user_id, p_metric, p_period_start, 1, now())
  on conflict (user_id, metric, period_start)
  do update set
    usage_count = public.usage_counters.usage_count + 1,
    updated_at = now()
  returning public.usage_counters.usage_count into current_count;

  return query select true, current_count;
end;
$$;

grant execute on function public.consume_usage_counter(text, date, integer) to authenticated;

create index if not exists subscriptions_user_status_end_idx
  on public.subscriptions(user_id, status, access_ends_at desc);

insert into public.usage_counters (user_id, metric, period_start, usage_count)
select
  session.user_id,
  'practice_session',
  session.completed_at::date,
  count(*)::integer
from public.study_sessions as session
where session.completed_at is not null
group by session.user_id, session.completed_at::date
on conflict (user_id, metric, period_start)
do update set
  usage_count = greatest(public.usage_counters.usage_count, excluded.usage_count),
  updated_at = now();

insert into public.usage_counters (user_id, metric, period_start, usage_count)
select
  run.user_id,
  'mini_exam',
  date_trunc('month', run.completed_at)::date,
  count(*)::integer
from public.mini_exam_runs as run
group by run.user_id, date_trunc('month', run.completed_at)::date
on conflict (user_id, metric, period_start)
do update set
  usage_count = greatest(public.usage_counters.usage_count, excluded.usage_count),
  updated_at = now();