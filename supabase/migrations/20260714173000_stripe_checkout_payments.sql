alter table public.subscriptions
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_event_id text,
  add column if not exists amount_paid integer,
  add column if not exists currency text,
  add column if not exists purchased_days integer,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_checkout_session_key') then
    alter table public.subscriptions
      add constraint subscriptions_checkout_session_key unique (stripe_checkout_session_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_stripe_event_key') then
    alter table public.subscriptions
      add constraint subscriptions_stripe_event_key unique (stripe_event_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_purchased_days_check') then
    alter table public.subscriptions
      add constraint subscriptions_purchased_days_check check (purchased_days is null or purchased_days in (30, 90));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_amount_paid_check') then
    alter table public.subscriptions
      add constraint subscriptions_amount_paid_check check (amount_paid is null or amount_paid >= 0);
  end if;
end
$$;

create index if not exists subscriptions_stripe_customer_idx
  on public.subscriptions(stripe_customer_id)
  where stripe_customer_id is not null;

create or replace function public.activate_stripe_purchase(
  p_user_id uuid,
  p_plan_code text,
  p_days integer,
  p_checkout_session_id text,
  p_event_id text,
  p_customer_id text,
  p_payment_id text,
  p_amount_paid integer,
  p_currency text
)
returns table (access_starts_at timestamptz, access_ends_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_start timestamptz;
  existing_end timestamptz;
  next_start timestamptz;
  next_end timestamptz;
begin
  if p_plan_code not in ('sprint_30', 'sprint_90') then
    raise exception 'INVALID_PLAN';
  end if;
  if p_days not in (30, 90) then
    raise exception 'INVALID_ACCESS_DURATION';
  end if;
  if p_checkout_session_id is null or p_checkout_session_id = '' then
    raise exception 'MISSING_CHECKOUT_SESSION';
  end if;

  select subscription.access_starts_at, subscription.access_ends_at
    into existing_start, existing_end
  from public.subscriptions as subscription
  where subscription.stripe_checkout_session_id = p_checkout_session_id
  limit 1;

  if existing_end is not null then
    return query select existing_start, existing_end;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  select greatest(now(), coalesce(max(subscription.access_ends_at), now()))
    into next_start
  from public.subscriptions as subscription
  where subscription.user_id = p_user_id
    and subscription.status = 'active';

  next_end := next_start + make_interval(days => p_days);

  insert into public.subscriptions (
    user_id,
    stripe_customer_id,
    stripe_payment_id,
    stripe_checkout_session_id,
    stripe_event_id,
    plan_code,
    status,
    access_starts_at,
    access_ends_at,
    amount_paid,
    currency,
    purchased_days,
    updated_at
  ) values (
    p_user_id,
    nullif(p_customer_id, ''),
    nullif(p_payment_id, ''),
    p_checkout_session_id,
    nullif(p_event_id, ''),
    p_plan_code,
    'active',
    next_start,
    next_end,
    p_amount_paid,
    lower(nullif(p_currency, '')),
    p_days,
    now()
  )
  on conflict (stripe_checkout_session_id) do nothing;

  return query
  select subscription.access_starts_at, subscription.access_ends_at
  from public.subscriptions as subscription
  where subscription.stripe_checkout_session_id = p_checkout_session_id
  limit 1;
end;
$$;

revoke all on function public.activate_stripe_purchase(uuid, text, integer, text, text, text, text, integer, text) from public;
revoke all on function public.activate_stripe_purchase(uuid, text, integer, text, text, text, text, integer, text) from authenticated;
grant execute on function public.activate_stripe_purchase(uuid, text, integer, text, text, text, text, integer, text) to service_role;
