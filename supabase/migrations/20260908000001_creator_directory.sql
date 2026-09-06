-- The creators' directory: one row per creator with at least one approved series.
create or replace view public.creator_cards
with (security_invoker = true)
as
select
  p.id,
  p.display_name,
  p.handle,
  p.avatar_key,
  p.is_verified,
  p.bio,
  bool_or(s.kind = 'comic') as has_comics,
  bool_or(s.kind = 'novel') as has_novels,
  max(s.approved_at) as latest_approved_at
from public.profiles p
join public.series s on s.creator_id = p.id and s.status = 'approved'
group by p.id, p.display_name, p.handle, p.avatar_key, p.is_verified, p.bio;
