-- The service role (server-side code that has already checked the caller is
-- the editor, and the seed script) counts as the editor for the guards.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.role() = 'service_role'
      or coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;
