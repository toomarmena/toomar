-- Scheduling, creator's notes, a single quiet reaction, content reports, and
-- the email preference behind follower notifications.

-------------------------------------------------------------------------------
-- Episodes: scheduled publishing and a note to readers
-------------------------------------------------------------------------------
alter table public.episodes
  add column publish_at timestamptz,
  add column note text check (note is null or char_length(note) <= 600);

-- An episode is live when it is published, or its scheduled time has passed.
create or replace function public.episode_live(is_published boolean, publish_at timestamptz)
returns boolean
language sql
stable
as $$
  select is_published or (publish_at is not null and publish_at <= now());
$$;

drop policy "published episodes of approved series are public" on public.episodes;
create policy "live episodes of approved series are public" on public.episodes
  for select using (
    exists (
      select 1 from public.series s
      where s.id = series_id
        and ((s.status = 'approved' and public.episode_live(is_published, publish_at)) or s.creator_id = auth.uid() or public.is_admin())
    )
  );

-- What readers see: only live episodes, with the effective publication time.
create or replace view public.episodes_live
with (security_invoker = true)
as
select e.id, e.series_id, e.number, e.lang, e.title, e.body, e.note,
       coalesce(e.published_at, e.publish_at) as published_at
from public.episodes e
where public.episode_live(e.is_published, e.publish_at);

create or replace view public.series_cards
with (security_invoker = true)
as
select
  s.id, s.slug, s.kind, s.genre, s.publish_day, s.cover_key, s.title_ar, s.title_en,
  s.description_ar, s.description_en, s.languages, s.featured_rank, s.approved_at, s.created_at,
  p.id as creator_id, p.display_name as creator_name, p.is_verified as creator_verified,
  latest.number as latest_number, latest.published_at as latest_published_at,
  s.run_status, s.age_rating, p.handle as creator_handle, p.avatar_key as creator_avatar_key
from public.series s
join public.profiles p on p.id = s.creator_id
left join lateral (
  select e.number, coalesce(e.published_at, e.publish_at) as published_at
  from public.episodes e
  where e.series_id = s.id and e.lang = 'ar' and public.episode_live(e.is_published, e.publish_at)
  order by e.number desc
  limit 1
) latest on true
where s.status = 'approved';

-------------------------------------------------------------------------------
-- One quiet reaction per reader per episode. Counts are the creator's only.
-------------------------------------------------------------------------------
create table public.episode_reactions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, episode_id)
);
alter table public.episode_reactions enable row level security;
create policy "own reactions" on public.episode_reactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop function if exists public.series_stats(uuid);
create function public.series_stats(sid uuid)
returns table (
  episode_id uuid,
  number integer,
  lang public.lang,
  openers bigint,
  completers bigint,
  returned bigint,
  liked bigint
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
  ),
  likes as (
    select r.episode_id, count(*) as liked
    from public.episode_reactions r
    join public.episodes ep on ep.id = r.episode_id
    where ep.series_id = sid and exists (select 1 from allowed)
    group by r.episode_id
  )
  select v.episode_id, v.number, v.lang,
         count(*) filter (where v.opened) as openers,
         count(*) filter (where v.completed) as completers,
         count(*) filter (where v.opened and exists (
           select 1 from viewers w where w.viewer = v.viewer and w.number > v.number and w.opened
         )) as returned,
         coalesce((select l.liked from likes l where l.episode_id = v.episode_id), 0) as liked
  from viewers v
  group by v.episode_id, v.number, v.lang
  order by v.number desc, v.lang;
$$;

-------------------------------------------------------------------------------
-- Reports from signed-in readers, read by the editor
-------------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series (id) on delete cascade,
  episode_id uuid references public.episodes (id) on delete set null,
  reporter_id uuid references public.profiles (id) on delete set null,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.reports enable row level security;
create policy "signed-in readers report" on public.reports
  for insert with check (reporter_id = auth.uid());
create policy "admin reads reports" on public.reports
  for select using (public.is_admin());
create policy "admin resolves reports" on public.reports
  for update using (public.is_admin()) with check (public.is_admin());

-------------------------------------------------------------------------------
-- Follower emails: a preference, and a ledger so nobody is told twice
-------------------------------------------------------------------------------
alter table public.profiles add column notify_email boolean not null default true;

create table public.notifications_sent (
  episode_id uuid not null references public.episodes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  sent_at timestamptz not null default now(),
  primary key (episode_id, user_id)
);
alter table public.notifications_sent enable row level security;
-- Written only by the service role (the cron job); nobody reads it through the API.
