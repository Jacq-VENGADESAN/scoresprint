create table if not exists public.session_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('practice', 'mini_exam')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now(),
  unique (user_id, kind)
);

create index if not exists session_drafts_user_expiry_idx
  on public.session_drafts (user_id, expires_at desc);

alter table public.session_drafts enable row level security;

drop policy if exists "session_drafts_self" on public.session_drafts;
create policy "session_drafts_self"
on public.session_drafts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.session_drafts to authenticated;
