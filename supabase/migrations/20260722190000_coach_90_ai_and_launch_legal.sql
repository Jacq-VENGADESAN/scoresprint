create table if not exists public.ai_coach_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  usage_count integer not null default 0 check (usage_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start)
);

create table if not exists public.ai_coach_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  plan jsonb not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists ai_coach_plans_user_updated_idx
  on public.ai_coach_plans (user_id, updated_at desc);

alter table public.ai_coach_usage enable row level security;
alter table public.ai_coach_plans enable row level security;

create policy "Users can read their AI usage"
  on public.ai_coach_usage for select
  using (auth.uid() = user_id);

create policy "Users can read their coach plans"
  on public.ai_coach_plans for select
  using (auth.uid() = user_id);

create policy "Users can create their coach plans"
  on public.ai_coach_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their coach plans"
  on public.ai_coach_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.consume_ai_coach_credit(p_limit integer, p_cost integer default 1)
returns table (allowed boolean, usage_count integer, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := current_date;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_limit < 1 or p_limit > 100 or p_cost < 1 or p_cost > 5 then
    raise exception 'INVALID_AI_LIMIT';
  end if;

  insert into public.ai_coach_usage (user_id, period_start, usage_count, updated_at)
  values (v_user_id, v_today, p_cost, now())
  on conflict (user_id, period_start) do update
    set usage_count = public.ai_coach_usage.usage_count + excluded.usage_count,
        updated_at = now()
    where public.ai_coach_usage.usage_count + excluded.usage_count <= p_limit
  returning ai_coach_usage.usage_count into v_count;

  if v_count is null then
    select u.usage_count into v_count
    from public.ai_coach_usage u
    where u.user_id = v_user_id and u.period_start = v_today;
    return query select false, coalesce(v_count, 0), greatest(0, p_limit - coalesce(v_count, 0));
    return;
  end if;

  return query select true, v_count, greatest(0, p_limit - v_count);
end;
$$;

revoke all on function public.consume_ai_coach_credit(integer, integer) from public;
grant execute on function public.consume_ai_coach_credit(integer, integer) to authenticated;

grant select on public.ai_coach_usage to authenticated;
grant select, insert, update on public.ai_coach_plans to authenticated;
grant all on public.ai_coach_usage to service_role;
grant all on public.ai_coach_plans to service_role;

comment on table public.ai_coach_usage is 'Daily server-side quota for Coach 90 OpenAI requests.';
comment on table public.ai_coach_plans is 'Structured weekly study plans generated for Coach 90 users.';
