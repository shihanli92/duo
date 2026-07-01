-- Name packs: tag each name as 'core' (shown by default) or 'extended'
-- (a large opt-in pack of rarer / non-English names). Couples opt in per-couple.
alter table public.names
  add column pack text not null default 'core'
  check (pack in ('core', 'extended'));

alter table public.couples
  add column include_extended boolean not null default false;

-- Fast deck filtering by pack
create index if not exists idx_names_pack on public.names(pack);
create index if not exists idx_names_origin on public.names(origin);

-- Distinct origins across the names visible to the caller. SECURITY INVOKER so
-- the names RLS policy still restricts rows to global + this couple's names.
create or replace function public.distinct_origins()
returns table (origin text)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct n.origin
  from public.names n
  where n.origin <> ''
  order by n.origin;
$$;
