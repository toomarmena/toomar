-- Toomar: initial schema.
-- Everything public passes through admin approval. No public view counts.

create extension if not exists "pgcrypto";

-------------------------------------------------------------------------------
-- Enumerations
-------------------------------------------------------------------------------
create type public.series_kind as enum ('comic', 'novel');
create type public.series_status as enum ('draft', 'pending', 'approved', 'rejected');
create type public.genre as enum (
  'drama', 'fantasy', 'comedy', 'action', 'romance', 'mystery', 'slice_of_life', 'historical'
);
create type public.user_role as enum ('reader', 'creator', 'admin');
create type public.lang as enum ('ar', 'en');

-------------------------------------------------------------------------------
-- Profiles
-------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  role public.user_role not null default 'reader',
  is_verified boolean not null default false, -- granted by admin only
  bio text,
  ui_lang public.lang not null default 'ar',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Emails that become admins on signup. The founder is seeded here.
create table public.admin_emails (
  email text primary key
);
insert into public.admin_emails (email) values ('adel4art@gmail.com');

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
  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    name,
    new.raw_user_meta_data ->> 'avatar_url',
    case when is_admin then 'admin'::public.user_role else 'reader'::public.user_role end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Is the current user an admin? Security definer so RLS on profiles does not recurse.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Users edit their own name, avatar, bio and UI language; never role or verification.
create or replace function public.profiles_guard()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role or new.is_verified is distinct from old.is_verified then
      raise exception 'role and verification are set by the editor';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_guard before update on public.profiles
  for each row execute function public.profiles_guard();

-------------------------------------------------------------------------------
-- Series
-------------------------------------------------------------------------------
create table public.series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kind public.series_kind not null,
  creator_id uuid not null references public.profiles (id) on delete cascade,
  genre public.genre not null,
  publish_day smallint not null check (publish_day between 0 and 6), -- 0 = Sunday
  status public.series_status not null default 'draft',
  rejection_note text,
  cover_key text,
  title_ar text not null,
  title_en text,
  description_ar text,
  description_en text,
  languages public.lang[] not null default '{ar}',
  adaptation_of uuid references public.series (id) on delete set null, -- a comic adapted from a novel
  featured_rank integer, -- editor's picks; null = not featured
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  constraint slug_shape check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint languages_not_empty check (cardinality(languages) > 0)
);

create index series_creator_idx on public.series (creator_id);
create index series_public_idx on public.series (status, kind, approved_at desc);
create index series_featured_idx on public.series (featured_rank) where featured_rank is not null;

create trigger series_touch before update on public.series
  for each row execute function public.touch_updated_at();

-- Creators may move a series between draft and pending. Only the editor approves,
-- rejects, features, or changes ownership.
create or replace function public.series_guard()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'pending') or new.featured_rank is not null or new.approved_at is not null then
      raise exception 'only the editor can approve or feature a series';
    end if;
    if new.status = 'pending' then
      new.submitted_at := now();
    end if;
    return new;
  end if;
  if new.creator_id is distinct from old.creator_id then
    raise exception 'ownership cannot be transferred';
  end if;
  if new.featured_rank is distinct from old.featured_rank
     or new.approved_at is distinct from old.approved_at
     or new.rejection_note is distinct from old.rejection_note then
    raise exception 'only the editor can change this';
  end if;
  if new.status is distinct from old.status then
    if new.status = 'pending' and old.status in ('draft', 'rejected') then
      new.submitted_at := now();
    elsif new.status = 'draft' and old.status = 'pending' then
      null; -- withdrawing a submission
    else
      raise exception 'only the editor can change the status to %', new.status;
    end if;
  end if;
  return new;
end;
$$;

create trigger series_guard before insert or update on public.series
  for each row execute function public.series_guard();

-------------------------------------------------------------------------------
-- Episodes (one row per number per language)
-------------------------------------------------------------------------------
create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series (id) on delete cascade,
  number integer not null check (number > 0),
  lang public.lang not null,
  title text,
  body text, -- novel chapter text
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (series_id, number, lang)
);

create index episodes_series_idx on public.episodes (series_id, lang, is_published, number desc);

create trigger episodes_touch before update on public.episodes
  for each row execute function public.touch_updated_at();

-- published_at is set the first time an episode is published and never moves.
create or replace function public.episodes_publish_stamp()
returns trigger
language plpgsql
as $$
begin
  if new.is_published and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger episodes_publish_stamp before insert or update on public.episodes
  for each row execute function public.episodes_publish_stamp();

create table public.episode_images (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes (id) on delete cascade,
  position integer not null,
  key text not null,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  bytes integer,
  created_at timestamptz not null default now()
);

create index episode_images_idx on public.episode_images (episode_id, position);

-------------------------------------------------------------------------------
-- Follows, progress, events
-------------------------------------------------------------------------------
create table public.follows (
  user_id uuid not null references public.profiles (id) on delete cascade,
  series_id uuid not null references public.series (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, series_id)
);

create index follows_series_idx on public.follows (series_id);

create table public.reading_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  series_id uuid not null references public.series (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  number integer not null,
  lang public.lang not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, series_id)
);

-- Return rate and completion live here. No dashboard yet; the rows are what matter.
create table public.events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('open', 'complete')),
  user_id uuid references public.profiles (id) on delete set null,
  anon_id text,
  series_id uuid not null references public.series (id) on delete cascade,
  episode_id uuid references public.episodes (id) on delete set null,
  created_at timestamptz not null default now()
);

create index events_series_idx on public.events (series_id, created_at);

-------------------------------------------------------------------------------
-- Public read model: one row per approved series with its latest episode.
-------------------------------------------------------------------------------
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
  latest.published_at as latest_published_at
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
-- Row-level security
-------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.admin_emails enable row level security;
alter table public.series enable row level security;
alter table public.episodes enable row level security;
alter table public.episode_images enable row level security;
alter table public.follows enable row level security;
alter table public.reading_progress enable row level security;
alter table public.events enable row level security;

-- profiles: names and badges are public; you edit your own.
create policy "profiles are public" on public.profiles
  for select using (true);
create policy "edit own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "admin edits profiles" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- admin_emails: admin only.
create policy "admin reads admin emails" on public.admin_emails
  for select using (public.is_admin());

-- series
create policy "approved series are public" on public.series
  for select using (status = 'approved' or creator_id = auth.uid() or public.is_admin());
create policy "creators add series" on public.series
  for insert with check (creator_id = auth.uid());
create policy "creators edit own series" on public.series
  for update using (creator_id = auth.uid() or public.is_admin())
  with check (creator_id = auth.uid() or public.is_admin());
create policy "creators delete own drafts" on public.series
  for delete using ((creator_id = auth.uid() and status in ('draft', 'rejected')) or public.is_admin());

-- episodes
create policy "published episodes of approved series are public" on public.episodes
  for select using (
    exists (
      select 1 from public.series s
      where s.id = series_id
        and ((s.status = 'approved' and is_published) or s.creator_id = auth.uid() or public.is_admin())
    )
  );
create policy "creators manage own episodes" on public.episodes
  for all using (
    exists (select 1 from public.series s where s.id = series_id and (s.creator_id = auth.uid() or public.is_admin()))
  ) with check (
    exists (select 1 from public.series s where s.id = series_id and (s.creator_id = auth.uid() or public.is_admin()))
  );

-- episode images follow their episode
create policy "images of readable episodes" on public.episode_images
  for select using (exists (select 1 from public.episodes e where e.id = episode_id));
create policy "creators manage own images" on public.episode_images
  for all using (
    exists (
      select 1 from public.episodes e join public.series s on s.id = e.series_id
      where e.id = episode_id and (s.creator_id = auth.uid() or public.is_admin())
    )
  ) with check (
    exists (
      select 1 from public.episodes e join public.series s on s.id = e.series_id
      where e.id = episode_id and (s.creator_id = auth.uid() or public.is_admin())
    )
  );

-- follows and progress: yours only
create policy "own follows" on public.follows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own progress" on public.reading_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- events: anyone may record one; only the editor reads them
create policy "record events" on public.events
  for insert with check (user_id is null or user_id = auth.uid());
create policy "admin reads events" on public.events
  for select using (public.is_admin());

-- Follower counts for the creator's own dashboard (not public).
create or replace function public.follower_count(sid uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.follows f
  join public.series s on s.id = f.series_id
  where f.series_id = sid and (s.creator_id = auth.uid() or public.is_admin());
$$;
