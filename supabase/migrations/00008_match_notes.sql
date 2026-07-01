-- Private-to-the-couple notes on MATCHED names.
--
-- Privacy: a note must never reveal that its author liked a name the partner
-- has NOT also liked. So notes are only ever surfaced for names that are a
-- mutual match. Direct table access is limited to your OWN notes; the partner's
-- notes reach you only through get_match_notes(), which gates on match status.

create table public.match_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name_id uuid not null references public.names(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name_id, author_id)
);

create index idx_match_notes_couple on public.match_notes(couple_id);
create index idx_match_notes_name on public.match_notes(name_id);

grant select, insert, update, delete on public.match_notes to authenticated;

alter table public.match_notes enable row level security;

-- SELECT: only your OWN notes directly. The partner's notes are exposed solely
-- through get_match_notes() (gated on mutual match), so a raw note row can never
-- leak a non-mutual like.
create policy "Users read own notes"
  on public.match_notes for select
  to authenticated
  using (author_id = auth.uid());

create policy "Users insert own notes"
  on public.match_notes for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and couple_id = public.get_my_couple_id()
  );

create policy "Users update own notes"
  on public.match_notes for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "Users delete own notes"
  on public.match_notes for delete
  to authenticated
  using (author_id = auth.uid());

-- get_match_notes: returns BOTH partners' notes, but only for names that are a
-- mutual match. SECURITY DEFINER so it can read the partner's note rows, gated
-- by an explicit caller-in-couple check and the mutual-match condition.
create or replace function public.get_match_notes(p_couple_id uuid)
returns table (
  name_id uuid,
  author_id uuid,
  body text,
  updated_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select mn.name_id, mn.author_id, mn.body, mn.updated_at
  from public.match_notes mn
  where mn.couple_id = p_couple_id
    -- caller must be in this couple
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and couple_id = p_couple_id
    )
    -- the name must be a MUTUAL match (both partners liked it)
    and (
      select count(distinct v.user_id)
      from public.votes v
      join public.profiles p on v.user_id = p.id
      where v.name_id = mn.name_id
        and p.couple_id = p_couple_id
        and v.value = 'like'
    ) = 2
  order by mn.updated_at desc;
$$;
