-- Helper function to get current user's couple_id without triggering RLS recursion.
-- SECURITY DEFINER bypasses RLS so profiles policies can reference it safely.
create or replace function public.get_my_couple_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select couple_id from public.profiles where id = auth.uid()
$$;

-- Enable RLS on all tables
alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.names enable row level security;
alter table public.votes enable row level security;

-- ============================================================
-- COUPLES
-- ============================================================

-- Allow reading any couple (needed for invite code lookup during join)
create policy "Authenticated users read couples"
  on public.couples for select
  to authenticated
  using (true);

create policy "Authenticated users create couples"
  on public.couples for insert
  to authenticated
  with check (true);

-- ============================================================
-- PROFILES
-- ============================================================

create policy "Users read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users read partner profile"
  on public.profiles for select
  using (couple_id = public.get_my_couple_id());

create policy "Users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- NAMES
-- ============================================================

create policy "Users read global or couple names"
  on public.names for select
  using (
    couple_id is null
    or couple_id = public.get_my_couple_id()
  );

create policy "Users insert names for their couple"
  on public.names for insert
  to authenticated
  with check (couple_id = public.get_my_couple_id());

-- ============================================================
-- VOTES — CRITICAL PRIVACY: users can ONLY see/manage their OWN votes
-- ============================================================

create policy "Users read own votes only"
  on public.votes for select
  using (user_id = auth.uid());

create policy "Users insert own votes"
  on public.votes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and couple_id = public.get_my_couple_id()
  );

create policy "Users update own votes"
  on public.votes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users delete own votes"
  on public.votes for delete
  to authenticated
  using (user_id = auth.uid());
