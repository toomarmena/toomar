-- Creator identity: handles, avatars, social links; series run status and age
-- rating; retention numbers for the creator's own eyes.

-------------------------------------------------------------------------------
-- Profiles
-------------------------------------------------------------------------------
alter table public.profiles
  add column handle text,
  add column avatar_key text,
  add column social_links jsonb not null default '{}'::jsonb;

update public.profiles set handle = 'u-' || left(replace(id::text, '-', ''), 8) where handle is null;

alter table public.profiles
  alter column handle set not null,
  add constraint profiles_handle_key unique (handle),
  add constraint profiles_handle_shape check (handle ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(handle) between 3 and 30),
  add constraint profiles_social_links_object check (jsonb_typeof(social_links) = 'object');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  name text;
  is_admin boolean;
begin
  name := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    split_part(new.email, '@', 1)
  );
  is_admin := exists (select 1 from public.admin_emails a where lower(a.email) = lower(new.email));
  insert into public.profiles (id, display_name, avatar_url, role, handle)
  values (
    new.id,
    name,
    new.raw_user_meta_data ->> 'avatar_url',
    case when is_admin then 'admin'::public.user_role else 'reader'::public.user_role end,
    'u-' || left(replace(new.id::text, '-', ''), 8)
  );
  return new;
end;
$$;

-------------------------------------------------------------------------------
-- Series: lifecycle and age rating (both the creator's to set)
-------------------------------------------------------------------------------
alter table public.series
  add column run_status text not null default 'ongoing' check (run_status in ('ongoing', 'completed', 'hiatus')),
  add column age_rating text not null default 'all' check (age_rating in ('all', '13', '16'));

create or replace view public.series_cards
with (security_invoker = true)
as
select
  s.id,
  s.slug,
  s.kind,
  s.genre,
  s.publish_day,
  s.cover_key,
  s.title_ar,
  s.title_en,
  s.description_ar,
  s.description_en,
  s.languages,
  s.featured_rank,
  s.approved_at,
  s.created_at,
  p.id as creator_id,
  p.display_name as creator_name,
  p.is_verified as creator_verified,
  latest.number as latest_number,
  latest.published_at as latest_published_at,
  s.run_status,
  s.age_rating,
  p.handle as creator_handle,
  p.avatar_key as creator_avatar_key
from public.series s
join public.profiles p on p.id = s.creator_id
left join lateral (
  select e.number, e.published_at
  from public.episodes e
  where e.series_id = s.id and e.is_published and e.lang = 'ar'
  order by e.number desc
  limit 1
) latest on true
where s.status = 'approved';

-------------------------------------------------------------------------------
-- Retention numbers per episode, for the series' creator and the editor only.
-- openers: distinct readers who opened the episode; completers: who reached
-- its end; returned: openers who later opened a higher-numbered episode.
-------------------------------------------------------------------------------
create or replace function public.series_stats(sid uuid)
returns table (
  episode_id uuid,
  number integer,
  lang public.lang,
  openers bigint,
  completers bigint,
  returned bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with allowed as (
    select 1 from public.series s where s.id = sid and (s.creator_id = auth.uid() or public.is_admin())
  ),
  viewers as (
    select e.episode_id, ep.number, ep.lang,
           coalesce(e.user_id::text, e.anon_id) as viewer,
           bool_or(e.type = 'open') as opened,
           bool_or(e.type = 'complete') as completed
    from public.events e
    join public.episodes ep on ep.id = e.episode_id
    where e.series_id = sid and e.episode_id is not null and exists (select 1 from allowed)
    group by e.episode_id, ep.number, ep.lang, coalesce(e.user_id::text, e.anon_id)
  )
  select v.episode_id, v.number, v.lang,
         count(*) filter (where v.opened) as openers,
         count(*) filter (where v.completed) as completers,
         count(*) filter (where v.opened and exists (
           select 1 from viewers w where w.viewer = v.viewer and w.number > v.number and w.opened
         )) as returned
  from viewers v
  group by v.episode_id, v.number, v.lang
  order by v.number desc, v.lang;
$$;
