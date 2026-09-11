-- A comic can be drawn as a continuous vertical strip, as horizontal pages, or both.
-- The creator uploads a set of images per layout; the reader picks between what exists.

alter table public.episode_images
  add column layout text not null default 'vertical' check (layout in ('vertical', 'horizontal'));

drop index if exists public.episode_images_idx;
create index episode_images_idx on public.episode_images (episode_id, layout, position);

-- What the series offers. Drives which uploaders the studio shows; the reader
-- still trusts the images that actually exist on each episode.
alter table public.series
  add column layouts text[] not null default '{vertical}'::text[];

alter table public.series
  add constraint series_layouts_valid check (
    cardinality(layouts) > 0 and layouts <@ array['vertical', 'horizontal']::text[]
  );
