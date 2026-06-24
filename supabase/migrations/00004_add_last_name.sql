alter table public.couples add column last_name text not null default '';

-- Allow authenticated users to update their own couple
grant update on public.couples to authenticated;

create policy "Users update own couple"
  on public.couples for update
  to authenticated
  using (id = public.get_my_couple_id())
  with check (id = public.get_my_couple_id());
