BEGIN;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS notifications_actor_created_idx ON public.notifications(actor_id,created_at);
CREATE OR REPLACE FUNCTION public.prepare_client_notification() RETURNS trigger
LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF current_user='authenticated' THEN
  NEW.actor_id:=auth.uid(); NEW.created_at:=now(); NEW.is_read:=false;
  IF NEW.action_url IS NOT NULL AND (NEW.action_url NOT LIKE '/%' OR NEW.action_url LIKE '//%' OR NEW.action_url LIKE '%\%') THEN
   RAISE EXCEPTION 'Notification destination must be internal' USING ERRCODE='42501';
  END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS prepare_client_notification ON public.notifications;
CREATE TRIGGER prepare_client_notification BEFORE INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.prepare_client_notification();
REVOKE EXECUTE ON FUNCTION public.prepare_client_notification() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.can_create_social_notification(target uuid,event_type text,event_metadata jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE actor uuid:=auth.uid(); post_id_text text:=event_metadata->>'post_id';
BEGIN
 IF actor IS NULL THEN RETURN false; END IF;
 IF public.is_admin(actor) THEN RETURN true; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(actor::text,0));
 IF (SELECT count(*) FROM public.notifications WHERE actor_id=actor AND created_at>now()-interval '1 minute')>=30 THEN RETURN false; END IF;
 IF target=actor THEN RETURN true; END IF;
 IF event_type='favorite' OR (event_type='info' AND event_metadata->>'type'='favorite') THEN
  RETURN EXISTS(SELECT 1 FROM public.favorites WHERE user_id=actor AND professional_id=target);
 ELSIF event_type IN ('info','recommendation') AND event_metadata->>'type'='recommendation' THEN
  RETURN EXISTS(SELECT 1 FROM public.user_recommendations WHERE recommender_id=actor AND recommended_id=target);
 ELSIF event_type='review' THEN
  RETURN EXISTS(SELECT 1 FROM public.reviews WHERE reviewer_id=actor AND reviewed_id=target);
 ELSIF event_type IN ('evaluation_request','evaluation_accepted') THEN
  RETURN EXISTS(SELECT 1 FROM public.evaluation_requests WHERE (requester_id=actor AND target_id=target) OR (requester_id=target AND target_id=actor));
 ELSIF event_type='message' THEN
  RETURN EXISTS(SELECT 1 FROM public.messages WHERE sender_id=actor AND receiver_id=target AND created_at>now()-interval '10 minutes');
 ELSIF event_type='mention' AND post_id_text ~ '^[0-9a-fA-F-]{36}$' THEN
  RETURN EXISTS(SELECT 1 FROM public.post_comments c JOIN public.profiles p ON p.id=target WHERE c.post_id=post_id_text::uuid AND c.user_id=actor AND to_jsonb(c.mentions) @> jsonb_build_array(p.full_name));
 ELSIF event_type IN ('like','comment','reply') AND post_id_text ~ '^[0-9a-fA-F-]{36}$' THEN
  IF event_type='like' THEN
   RETURN EXISTS(SELECT 1 FROM public.feed_posts f WHERE f.id=post_id_text::uuid AND f.user_id=target
     AND (EXISTS(SELECT 1 FROM public.feed_posts_likes l WHERE l.post_id=f.id AND l.user_id=actor)
     OR EXISTS(SELECT 1 FROM public.post_reactions r WHERE r.post_id=f.id AND r.user_id=actor)));
  END IF;
  RETURN EXISTS(SELECT 1 FROM public.post_comments c JOIN public.feed_posts f ON f.id=c.post_id WHERE c.post_id=post_id_text::uuid AND c.user_id=actor
    AND (f.user_id=target OR (event_type='reply' AND EXISTS(SELECT 1 FROM public.post_comments original WHERE original.post_id=f.id AND original.user_id=target))));
 ELSIF event_type='info' AND event_metadata->>'type'='profile_view' THEN
  RETURN EXISTS(SELECT 1 FROM public.profile_views WHERE viewed_profile_id=target AND viewer_id=actor);
 END IF;
 RETURN false;
END $$;
REVOKE EXECUTE ON FUNCTION public.can_create_social_notification(uuid,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.can_create_social_notification(uuid,text,jsonb) TO authenticated;
DROP POLICY IF EXISTS "Authenticated notification producers" ON public.notifications;
CREATE POLICY "Authenticated notification producers" ON public.notifications FOR INSERT TO authenticated
 WITH CHECK(actor_id=auth.uid() AND public.can_create_social_notification(user_id,type,metadata));
NOTIFY pgrst,'reload schema';
COMMIT;
