-- Middle name on couples
ALTER TABLE public.couples ADD COLUMN middle_name text NOT NULL DEFAULT '';

-- Match rankings table
CREATE TABLE public.match_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_id uuid NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_id, user_id, name_id)
);

CREATE INDEX idx_match_rankings_couple ON public.match_rankings(couple_id);
CREATE INDEX idx_match_rankings_user ON public.match_rankings(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_rankings TO authenticated;

ALTER TABLE public.match_rankings ENABLE ROW LEVEL SECURITY;

-- SELECT: both partners can see all rankings for their couple
-- (matches are already mutually visible; rankings are collaborative)
CREATE POLICY "Users read couple rankings"
  ON public.match_rankings FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Users insert own rankings"
  ON public.match_rankings FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND couple_id = public.get_my_couple_id()
  );

CREATE POLICY "Users update own rankings"
  ON public.match_rankings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own rankings"
  ON public.match_rankings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
