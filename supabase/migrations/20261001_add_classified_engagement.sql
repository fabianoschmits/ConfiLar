-- Interações reais dos anúncios classificados.
-- Likes e comentários ficam normalizados, enquanto os contadores no anúncio
-- permitem renderização rápida da listagem.
BEGIN;

ALTER TABLE public.classified_ads
  ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;

UPDATE public.classified_ads
SET likes_count = COALESCE(likes_count, 0)
WHERE likes_count IS NULL;

ALTER TABLE public.classified_ads
  ALTER COLUMN likes_count SET DEFAULT 0,
  ALTER COLUMN likes_count SET NOT NULL;

CREATE TABLE IF NOT EXISTS public.classified_ad_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.classified_ads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classified_ad_likes_ad_user_key UNIQUE (ad_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.classified_ad_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.classified_ads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- The author embed in the application targets profiles, not auth.users.
-- Also repairs databases that received the first version of this migration.
ALTER TABLE public.classified_ad_comments
  DROP CONSTRAINT IF EXISTS classified_ad_comments_user_id_fkey;
ALTER TABLE public.classified_ad_comments
  ADD CONSTRAINT classified_ad_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS classified_ad_likes_ad_id_idx
  ON public.classified_ad_likes(ad_id);

CREATE INDEX IF NOT EXISTS classified_ad_likes_user_id_idx
  ON public.classified_ad_likes(user_id);

CREATE INDEX IF NOT EXISTS classified_ad_comments_ad_id_created_at_idx
  ON public.classified_ad_comments(ad_id, created_at);

ALTER TABLE public.classified_ad_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classified_ad_comments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.classified_ad_likes TO authenticated;
GRANT SELECT ON public.classified_ad_comments TO anon, authenticated;
GRANT INSERT, DELETE ON public.classified_ad_comments TO authenticated;
REVOKE UPDATE ON public.classified_ad_comments FROM anon, authenticated;
GRANT UPDATE (content) ON public.classified_ad_comments TO authenticated;
GRANT ALL ON public.classified_ad_likes, public.classified_ad_comments TO service_role;

DROP POLICY IF EXISTS "Users can read own classified likes" ON public.classified_ad_likes;
CREATE POLICY "Users can read own classified likes"
  ON public.classified_ad_likes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can like active classified ads" ON public.classified_ad_likes;
CREATE POLICY "Users can like active classified ads"
  ON public.classified_ad_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.classified_ads ad
      WHERE ad.id = ad_id AND ad.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can remove own classified likes" ON public.classified_ad_likes;
CREATE POLICY "Users can remove own classified likes"
  ON public.classified_ad_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can read classified comments" ON public.classified_ad_comments;
CREATE POLICY "Anyone can read classified comments"
  ON public.classified_ad_comments
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.classified_ads ad
      WHERE ad.id = ad_id AND ad.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can comment on active classified ads" ON public.classified_ad_comments;
CREATE POLICY "Users can comment on active classified ads"
  ON public.classified_ad_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.classified_ads ad
      WHERE ad.id = ad_id AND ad.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can update own classified comments" ON public.classified_ad_comments;
CREATE POLICY "Users can update own classified comments"
  ON public.classified_ad_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own classified comments" ON public.classified_ad_comments;
CREATE POLICY "Users can delete own classified comments"
  ON public.classified_ad_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.sync_classified_ad_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.classified_ads
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.ad_id;
    RETURN NEW;
  END IF;

  UPDATE public.classified_ads
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = OLD.ad_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_classified_ad_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.classified_ads
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.ad_id;
    RETURN NEW;
  END IF;

  UPDATE public.classified_ads
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = OLD.ad_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS classified_ad_likes_count_trigger
  ON public.classified_ad_likes;
CREATE TRIGGER classified_ad_likes_count_trigger
  AFTER INSERT OR DELETE ON public.classified_ad_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_classified_ad_likes_count();

DROP TRIGGER IF EXISTS classified_ad_comments_count_trigger
  ON public.classified_ad_comments;
CREATE TRIGGER classified_ad_comments_count_trigger
  AFTER INSERT OR DELETE ON public.classified_ad_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_classified_ad_comments_count();

-- Never trust historical counters: derive them from the normalized records.
UPDATE public.classified_ads ad SET
  likes_count = (SELECT count(*) FROM public.classified_ad_likes l WHERE l.ad_id = ad.id),
  comments_count = (SELECT count(*) FROM public.classified_ad_comments c WHERE c.ad_id = ad.id);

NOTIFY pgrst, 'reload schema';
COMMIT;
