alter table public.user_goals
  add column if not exists level text,
  add column if not exists focus text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_goals_user_id_key'
      and conrelid = 'public.user_goals'::regclass
  ) then
    alter table public.user_goals
      add constraint user_goals_user_id_key unique (user_id);
  end if;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do update
    set display_name = coalesce(excluded.display_name, public.profiles.display_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name)
select id, raw_user_meta_data ->> 'display_name'
from auth.users
on conflict (id) do nothing;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_goals to authenticated;
grant select, insert, update, delete on public.attempts to authenticated;
grant select, insert, update, delete on public.user_mastery to authenticated;
grant select, insert, update, delete on public.study_sessions to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.skills to authenticated;
grant select on public.questions to authenticated;
grant select on public.question_options to authenticated;
