-- enable pgcrypto for gen_random_bytes (invite codes)
-- couples
create table public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null default encode(extensions.gen_random_bytes(4), 'hex'),
  created_at timestamptz not null default now()
);

-- profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid references public.couples(id) on delete set null,
  display_name text not null default '',
  accent text not null check (accent in ('a', 'b')),
  created_at timestamptz not null default now(),
  unique (couple_id, accent)
);

-- names (couple_id null = global seed name)
create table public.names (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references public.couples(id) on delete cascade,
  value text not null,
  gender text not null check (gender in ('girl', 'boy', 'unisex')),
  origin text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- votes (one per name per user)
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name_id uuid not null references public.names(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value text not null check (value in ('like', 'pass')),
  created_at timestamptz not null default now(),
  unique (name_id, user_id)
);

-- indexes
create index idx_votes_couple on public.votes(couple_id);
create index idx_votes_user on public.votes(user_id);
create index idx_votes_name_user on public.votes(name_id, user_id);
create index idx_names_couple on public.names(couple_id);
create index idx_profiles_couple on public.profiles(couple_id);

-- grants for authenticated role (anon can't access anything meaningful)
grant select, insert on public.couples to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert on public.names to authenticated;
grant select, insert, update, delete on public.votes to authenticated;
