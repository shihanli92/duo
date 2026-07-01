-- Living Venn: extend partner_progress with per-partner LIKE counts so the two
-- circles can be sized by how many names each partner has liked. Counts ONLY —
-- never which names — same privacy posture as the existing partner_voted count.
--
-- The return type gains columns, so the function must be dropped and recreated
-- (CREATE OR REPLACE cannot change a function's return signature).
drop function if exists public.partner_progress(uuid);

create function public.partner_progress(p_couple_id uuid)
returns table (
  partner_voted bigint,
  my_voted bigint,
  total_names bigint,
  match_count bigint,
  my_likes bigint,
  partner_likes bigint
)
language sql
security definer
set search_path = ''
as $$
  select
    -- partner's total votes
    (
      select count(*)
      from public.votes v
      join public.profiles p on v.user_id = p.id
      where p.couple_id = p_couple_id
        and v.user_id != auth.uid()
    ) as partner_voted,
    -- my total votes
    (
      select count(*)
      from public.votes
      where user_id = auth.uid()
    ) as my_voted,
    -- total names available to this couple
    (
      select count(*)
      from public.names
      where couple_id is null or couple_id = p_couple_id
    ) as total_names,
    -- mutual matches
    (
      select count(*)
      from public.names n
      where (n.couple_id is null or n.couple_id = p_couple_id)
        and (
          select count(distinct v.user_id)
          from public.votes v
          join public.profiles p on v.user_id = p.id
          where v.name_id = n.id
            and p.couple_id = p_couple_id
            and v.value = 'like'
        ) = 2
    ) as match_count,
    -- my likes (for the size of my circle)
    (
      select count(*)
      from public.votes
      where user_id = auth.uid()
        and value = 'like'
    ) as my_likes,
    -- partner's likes (for the size of their circle) — count only
    (
      select count(*)
      from public.votes v
      join public.profiles p on v.user_id = p.id
      where p.couple_id = p_couple_id
        and v.user_id != auth.uid()
        and v.value = 'like'
    ) as partner_likes
  where exists (
    select 1 from public.profiles
    where id = auth.uid() and couple_id = p_couple_id
  );
$$;
