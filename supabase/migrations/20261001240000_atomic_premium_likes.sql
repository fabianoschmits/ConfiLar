BEGIN;
CREATE OR REPLACE FUNCTION public.purchase_premium_like(p_user_id uuid, p_kind text, p_content_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE creator uuid; debit jsonb; reward jsonb; result jsonb; active boolean; visible boolean;
BEGIN
 IF p_user_id IS NULL OR p_content_id IS NULL THEN RAISE EXCEPTION 'Invalid purchase'; END IF;
 IF p_kind='POST' THEN
  SELECT coalesce(user_id,professional_id),is_active,is_public INTO creator,active,visible FROM public.feed_posts WHERE id=p_content_id;
  IF NOT coalesce(active AND visible,false) THEN RAISE EXCEPTION 'Post unavailable'; END IF;
 ELSIF p_kind='STORY' THEN
  SELECT user_id INTO creator FROM public.stories WHERE id=p_content_id AND expires_at>now();
 ELSE RAISE EXCEPTION 'Invalid premium like kind'; END IF;
 IF creator IS NULL OR creator=p_user_id THEN RAISE EXCEPTION 'Content unavailable or owned by buyer'; END IF;
 -- Lock both wallets in a consistent order before debiting/rewarding.
 PERFORM id FROM public.profiles WHERE id IN(p_user_id,creator) ORDER BY id FOR UPDATE;
 debit := public.deduct_points(p_user_id,100,'premium_like','Curtida premium');
 IF NOT coalesce((debit->>'success')::boolean,false) THEN RAISE EXCEPTION 'Insufficient points'; END IF;
 reward := public.add_points(creator,75,'receive_premium_like','Recebeu curtida premium');
 IF NOT coalesce((reward->>'success')::boolean,false) THEN RAISE EXCEPTION 'Reward failed'; END IF;
 IF p_kind='POST' THEN
  INSERT INTO public.feed_posts_likes(post_id,user_id,is_premium,premium_points_spent,points_spent,points_transferred)
  VALUES(p_content_id,p_user_id,true,100,100,75) RETURNING to_jsonb(feed_posts_likes) INTO result;
 ELSE
  INSERT INTO public.story_likes(story_id,user_id,is_premium) VALUES(p_content_id,p_user_id,true)
  RETURNING to_jsonb(story_likes) INTO result;
 END IF;
 INSERT INTO public.notifications(user_id,type,title,message,action_url,is_read,metadata)
 VALUES(creator,'achievement','Curtida Premium recebida!','Você recebeu 75 ConfiPoints.',
  CASE p_kind WHEN 'POST' THEN '/feed?post='||p_content_id::text ELSE '/feed' END,false,
  jsonb_build_object('from_user_id',p_user_id,'points_received',75,'type','premium_like_received'));
 RETURN jsonb_build_object('success',true,'like',result,'pointsSpent',100,'pointsRewarded',75);
END;
$$;
REVOKE ALL ON FUNCTION public.purchase_premium_like(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_premium_like(uuid,text,uuid) TO service_role;

-- The same guard also protects paid reaction attributes against direct client writes.
CREATE OR REPLACE FUNCTION public.protect_paid_reaction()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE key text;
BEGIN
 IF current_user IN('anon','authenticated') THEN
  FOREACH key IN ARRAY ARRAY['is_premium','premium_points_spent','points_spent','points_transferred'] LOOP
   IF TG_OP='UPDATE' THEN
    IF to_jsonb(NEW)->key IS DISTINCT FROM to_jsonb(OLD)->key THEN RAISE EXCEPTION 'Paid reactions require the server' USING ERRCODE='42501'; END IF;
   ELSIF coalesce(to_jsonb(NEW)->>key,'null') NOT IN('null','0','false') THEN
    RAISE EXCEPTION 'Paid reactions require the server' USING ERRCODE='42501';
   END IF;
  END LOOP;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_paid_reaction() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS protect_paid_reaction ON public.feed_posts_likes;
CREATE TRIGGER protect_paid_reaction BEFORE INSERT OR UPDATE ON public.feed_posts_likes FOR EACH ROW EXECUTE FUNCTION public.protect_paid_reaction();
DROP TRIGGER IF EXISTS protect_paid_reaction ON public.story_likes;
CREATE TRIGGER protect_paid_reaction BEFORE INSERT OR UPDATE ON public.story_likes FOR EACH ROW EXECUTE FUNCTION public.protect_paid_reaction();
COMMIT;
