create extension if not exists pgcrypto;

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text not null check (char_length(anonymous_id) between 16 and 120),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null check (event_name in (
    'page_view',
    'demo_started',
    'demo_completed',
    'signup_intent',
    'pricing_viewed',
    'waitlist_joined',
    'feedback_sent'
  )),
  path text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_events_created_at_idx on public.product_events (created_at desc);
create index if not exists product_events_name_created_idx on public.product_events (event_name, created_at desc);
create index if not exists product_events_anonymous_idx on public.product_events (anonymous_id, created_at desc);

create table if not exists public.premium_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) between 5 and 320 and email = lower(email)),
  user_id uuid references auth.users(id) on delete set null,
  plan_interest text not null default 'undecided' check (plan_interest in ('sprint_30', 'sprint_90', 'undecided')),
  goal_score integer check (goal_score is null or goal_score between 10 and 990),
  exam_date date,
  source text not null default 'pricing' check (char_length(source) between 1 and 80),
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists premium_waitlist_created_at_idx on public.premium_waitlist (created_at desc);

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text not null check (char_length(anonymous_id) between 16 and 120),
  user_id uuid references auth.users(id) on delete set null,
  email text check (email is null or char_length(email) between 5 and 320),
  rating integer not null check (rating between 1 and 5),
  category text not null check (category in ('general', 'content', 'usability', 'bug', 'pricing', 'missing_feature')),
  message text not null check (char_length(message) between 10 and 3000),
  path text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists beta_feedback_status_created_idx on public.beta_feedback (status, created_at desc);

alter table public.product_events enable row level security;
alter table public.premium_waitlist enable row level security;
alter table public.beta_feedback enable row level security;

revoke all on public.product_events from anon, authenticated;
revoke all on public.premium_waitlist from anon, authenticated;
revoke all on public.beta_feedback from anon, authenticated;

grant all on public.product_events to service_role;
grant all on public.premium_waitlist to service_role;
grant all on public.beta_feedback to service_role;

create or replace function public.delete_beta_data_for_user(target_user_id uuid, target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_user_id is null then
    raise exception 'USER_ID_REQUIRED';
  end if;

  delete from public.product_events where user_id = target_user_id;
  delete from public.beta_feedback where user_id = target_user_id;
  delete from public.premium_waitlist
  where user_id = target_user_id
     or (target_email is not null and email = lower(target_email));
end;
$$;

revoke all on function public.delete_beta_data_for_user(uuid, text) from public, anon, authenticated;
grant execute on function public.delete_beta_data_for_user(uuid, text) to service_role;

comment on table public.product_events is 'Mesure d audience interne de la bêta, sans publicité ni adresse IP brute.';
comment on table public.premium_waitlist is 'Demandes volontaires pour être informé de l ouverture Premium.';
comment on table public.beta_feedback is 'Retours volontaires des bêta-testeurs.';
