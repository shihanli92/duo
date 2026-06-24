-- get_matches: returns names BOTH partners in a couple voted 'like' on.
-- SECURITY DEFINER so it can read both users' votes without exposing them.
create or replace function public.get_matches(p_couple_id uuid)
returns table (
  id uuid,
  value text,
  gender text,
  origin text
)
language sql
security definer
set search_path = ''
as $$
  select n.id, n.value, n.gender, n.origin
  from public.names n
  where
    -- name must be visible to this couple
    (n.couple_id is null or n.couple_id = p_couple_id)
    -- both partners voted 'like'
    and (
      select count(distinct v.user_id)
      from public.votes v
      join public.profiles p on v.user_id = p.id
      where v.name_id = n.id
        and p.couple_id = p_couple_id
        and v.value = 'like'
    ) = 2
    -- caller must be in this couple
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and couple_id = p_couple_id
    )
  order by n.value;
$$;

-- partner_progress: returns aggregate counts only — never specific names.
-- SECURITY DEFINER so it can count the partner's votes.
create or replace function public.partner_progress(p_couple_id uuid)
returns table (
  partner_voted bigint,
  my_voted bigint,
  total_names bigint,
  match_count bigint
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
    ) as match_count
  where exists (
    select 1 from public.profiles
    where id = auth.uid() and couple_id = p_couple_id
  );
$$;
