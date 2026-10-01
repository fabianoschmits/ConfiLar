BEGIN;
CREATE TABLE IF NOT EXISTS public.classified_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.classified_ads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type text NOT NULL CHECK (share_type IN ('link', 'whatsapp', 'messenger', 'user')),
  shared_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ad_id, user_id, share_type)
);
CREATE INDEX IF NOT EXISTS classified_shares_user_id_idx ON public.classified_shares(user_id);
ALTER TABLE public.classified_shares ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.classified_shares TO authenticated;
GRANT ALL ON public.classified_shares TO service_role;
DROP POLICY IF EXISTS "Read own classified shares" ON public.classified_shares;
CREATE POLICY "Read own classified shares" ON public.classified_shares
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
NOTIFY pgrst, 'reload schema';
COMMIT;
