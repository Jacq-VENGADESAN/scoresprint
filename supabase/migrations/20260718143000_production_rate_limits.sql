create table if not exists public.api_rate_limits (
  scope text not null,
  key_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  updated_at timestamptz not null default now(),
  primary key (scope, key_hash, window_started_at)
);

create index if not exists api_rate_limits_cleanup_idx
  on public.api_rate_limits (window_started_at);

alter table public.api_rate_limits enable row level security;

revoke all on public.api_rate_limits from anon, authenticated;

create or replace function public.consume_api_rate_limit(
  p_scope text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, request_count integer, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_start timestamptz;
  v_count integer;
begin
  if p_scope is null or length(trim(p_scope)) = 0
    or p_key_hash is null or length(trim(p_key_hash)) < 32
    or p_limit < 1 or p_limit > 10000
    or p_window_seconds < 10 or p_window_seconds > 86400 then
    raise exception 'INVALID_RATE_LIMIT_ARGUMENT';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  insert into public.api_rate_limits (scope, key_hash, window_started_at, request_count, updated_at)
  values (p_scope, p_key_hash, v_window_start, 1, v_now)
  on conflict (scope, key_hash, window_started_at)
  do update set
    request_count = public.api_rate_limits.request_count + 1,
    updated_at = excluded.updated_at
  returning public.api_rate_limits.request_count into v_count;

  delete from public.api_rate_limits
  where window_started_at < v_now - interval '2 days';

  return query select
    v_count <= p_limit,
    v_count,
    greatest(1, ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - v_now)))::integer);
end;
$$;

revoke all on function public.consume_api_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, text, integer, integer) to service_role;
