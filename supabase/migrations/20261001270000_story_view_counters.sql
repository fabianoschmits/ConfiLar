BEGIN;
CREATE OR REPLACE FUNCTION public.sync_story_view_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE target uuid := CASE WHEN TG_OP='DELETE' THEN OLD.story_id ELSE NEW.story_id END;
BEGIN
 UPDATE public.stories SET views_count=(SELECT count(DISTINCT viewer_id) FROM public.story_views WHERE story_id=target) WHERE id=target;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.sync_story_view_count() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS sync_story_view_count ON public.story_views;
CREATE TRIGGER sync_story_view_count AFTER INSERT OR DELETE ON public.story_views
 FOR EACH ROW EXECUTE FUNCTION public.sync_story_view_count();
COMMIT;
