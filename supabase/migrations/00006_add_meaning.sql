-- Add meaning column to names (e.g. "noble, exalted" for Aaliyah)
ALTER TABLE public.names ADD COLUMN meaning text NOT NULL DEFAULT '';

-- Update get_matches to include meaning (must drop first — return type changed)
DROP FUNCTION IF EXISTS public.get_matches(uuid);
CREATE OR REPLACE FUNCTION public.get_matches(p_couple_id uuid)
RETURNS TABLE (
  id uuid,
  value text,
  gender text,
  origin text,
  meaning text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  select n.id, n.value, n.gender, n.origin, n.meaning
  from public.names n
  where
    (n.couple_id is null or n.couple_id = p_couple_id)
    and (
      select count(distinct v.user_id)
      from public.votes v
      join public.profiles p on v.user_id = p.id
      where v.name_id = n.id
        and p.couple_id = p_couple_id
        and v.value = 'like'
    ) = 2
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and couple_id = p_couple_id
    )
  order by n.value;
$$;
