-- Purchases, failures, and all notifications/email jobs are rolled back.
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '45s';
CREATE TEMP TABLE premium_results (scenario text, passed boolean);
DO $$
DECLARE a uuid; b uuid; source_ad public.classified_ads; payload jsonb; result jsonb; saved_id uuid; credits integer; post_id uuid; balance_a integer; balance_b integer; story_id uuid; view_total integer;
BEGIN
 SELECT p.id INTO a FROM public.profiles p WHERE NOT EXISTS(SELECT 1 FROM public.admins x WHERE x.user_id=p.id) LIMIT 1;
 SELECT p.id INTO b FROM public.profiles p WHERE p.id<>a LIMIT 1;
 SELECT * INTO source_ad FROM public.classified_ads WHERE is_active LIMIT 1;
 IF a IS NULL OR b IS NULL OR source_ad.id IS NULL THEN RAISE EXCEPTION 'Insufficient fixtures'; END IF;
 UPDATE public.profiles SET credits_ad_premium_1d=2 WHERE id=a;
 payload := jsonb_build_object('user_id',a,'title','Temporary premium audit','description','Rolled back',
   'category',source_ad.category,'location_city',source_ad.location_city,'location_state',source_ad.location_state,
   'ad_type',source_ad.ad_type,'is_active',true,'is_premium',true,'is_featured',true,
   'premium_points_spent',0,'premium_expires_at',now()+interval '1 day');
 result := public.purchase_premium_content(a,'AD',NULL,payload,0,'1d');
 saved_id := (result->>'id')::uuid;
 SELECT credits_ad_premium_1d INTO credits FROM public.profiles WHERE id=a;
 IF credits<>1 OR NOT (result->>'is_premium')::boolean THEN RAISE EXCEPTION 'Atomic credit purchase failed'; END IF;
 BEGIN
   PERFORM public.purchase_premium_content(a,'AD',NULL,payload || '{"nonexistent_column":1}'::jsonb,0,'1d');
   RAISE EXCEPTION 'Invalid content unexpectedly saved';
 EXCEPTION WHEN undefined_column THEN NULL; END;
 SELECT credits_ad_premium_1d INTO credits FROM public.profiles WHERE id=a;
 IF credits<>1 THEN RAISE EXCEPTION 'Failed content consumed a credit'; END IF;
 INSERT INTO premium_results VALUES('Atomic credit purchase and failed-save rollback',true);
 result := public.decrement_credit_count(a,'credits_ad_premium_1d',1);
 IF NOT (result->>'success')::boolean THEN RAISE EXCEPTION 'Available credit failed'; END IF;
 result := public.decrement_credit_count(a,'credits_ad_premium_1d',1);
 IF (result->>'success')::boolean THEN RAISE EXCEPTION 'Concurrent/exhausted credit accepted'; END IF;
 result := public.decrement_credit_count(a,'credits_ad_premium_1d',-1);
 IF (result->>'success')::boolean THEN RAISE EXCEPTION 'Negative credit quantity accepted'; END IF;
 INSERT INTO premium_results VALUES('Exhausted and negative credits rejected',true);
 UPDATE public.profiles SET points_balance=1000 WHERE id IN(a,b);
 INSERT INTO public.feed_posts(user_id,professional_id,title,description,is_public,is_active)
 VALUES(b,b,'Temporary premium like fixture','Rolled back',true,true) RETURNING id INTO post_id;
 result := public.purchase_premium_like(a,'POST',post_id);
 IF NOT (result->>'success')::boolean THEN RAISE EXCEPTION 'Premium like failed'; END IF;
 SELECT points_balance INTO balance_a FROM public.profiles WHERE id=a;
 SELECT points_balance INTO balance_b FROM public.profiles WHERE id=b;
 IF balance_a<>900 OR balance_b<>1075 THEN RAISE EXCEPTION 'Incorrect atomic debit/reward'; END IF;
 UPDATE public.profiles SET points_balance=0 WHERE id=a;
 BEGIN
  PERFORM public.purchase_premium_like(a,'POST',post_id);
  RAISE EXCEPTION 'Premium like allowed without points';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'Insufficient points' THEN RAISE; END IF;
 END;
 SELECT points_balance INTO balance_b FROM public.profiles WHERE id=b;
 IF balance_b<>1075 THEN RAISE EXCEPTION 'Failed purchase paid a reward'; END IF;
 INSERT INTO premium_results VALUES('Atomic premium like debit/reward; insufficient funds leave no reward',true);
 UPDATE public.profiles SET points_balance=1000 WHERE id=a;
 INSERT INTO public.stories(user_id,image_url,expires_at) VALUES(b,'https://example.com/temporary-audit.png',now()+interval '1 day') RETURNING id INTO story_id;
 result := public.purchase_premium_like(a,'STORY',story_id);
 IF NOT (result->>'success')::boolean THEN RAISE EXCEPTION 'Story premium like failed'; END IF;
 INSERT INTO premium_results VALUES('Atomic premium story like succeeds',true);
 PERFORM set_config('request.jwt.claim.sub',a::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 INSERT INTO public.story_views(story_id,viewer_id) VALUES(story_id,a);
 SELECT views_count INTO view_total FROM public.stories WHERE id=story_id;
 IF view_total<>1 THEN RAISE EXCEPTION 'Viewer cannot update server story counter'; END IF;
 BEGIN
  UPDATE public.classified_ads SET premium_points_spent=999 WHERE id=saved_id;
  RAISE EXCEPTION 'Client can tamper with paid content';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 UPDATE public.classified_ads SET title='Valid ordinary edit' WHERE id=saved_id;
 BEGIN
  INSERT INTO public.feed_posts_likes(post_id,user_id,is_premium) VALUES(post_id,a,true);
  RAISE EXCEPTION 'Client can create free premium reaction';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.purchase_premium_content(a,'AD',saved_id,payload,0,'1d');
  RAISE EXCEPTION 'Client can call server purchase';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 INSERT INTO premium_results VALUES('Premium bypass blocked; ordinary content edit allowed',true);
 IF pg_get_functiondef('public.approve_points_purchase(uuid)'::regprocedure) NOT ILIKE '%FOR UPDATE%' THEN
  RAISE EXCEPTION 'Payment approval does not lock the purchase';
 END IF;
 INSERT INTO premium_results VALUES('Payment approval row lock installed',true);
END;
$$;
SELECT * FROM premium_results;
ROLLBACK;
