-- Production validation: all fixtures and writes are rolled back. No messages/payments are sent.
BEGIN;
SET LOCAL lock_timeout='3s';
SET LOCAL statement_timeout='45s';
CREATE TEMP TABLE audit_results (scenario text, passed boolean);
DO $$
DECLARE a uuid; b uuid; ad uuid; comment_id uuid; baseline_likes integer; baseline_comments integer; n integer;
BEGIN
 SELECT p.id INTO a FROM public.profiles p WHERE NOT EXISTS(SELECT 1 FROM public.admins x WHERE x.user_id=p.id) ORDER BY p.id LIMIT 1;
 SELECT p.id INTO b FROM public.profiles p WHERE p.id<>a AND NOT EXISTS(SELECT 1 FROM public.admins x WHERE x.user_id=p.id) ORDER BY p.id LIMIT 1;
 SELECT d.id,d.likes_count,d.comments_count INTO ad,baseline_likes,baseline_comments FROM public.classified_ads d
 WHERE d.is_active AND NOT EXISTS(SELECT 1 FROM public.classified_ad_likes l WHERE l.ad_id=d.id AND l.user_id IN(a,b)) LIMIT 1;
 IF a IS NULL OR b IS NULL OR ad IS NULL THEN RAISE EXCEPTION 'Insufficient fixtures for two-user RLS test'; END IF;
 PERFORM set_config('request.jwt.claim.sub',a::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 BEGIN
  UPDATE public.profiles SET is_verified=NOT coalesce(is_verified,false) WHERE id=a;
  RAISE EXCEPTION 'Client can change verification badge';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.unban_user(b);
  RAISE EXCEPTION 'Non-admin can unban users';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.approve_pending_ban(gen_random_uuid(),'permanent',NULL);
  RAISE EXCEPTION 'Non-admin can approve bans';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.ban_user(b,'Unauthorized audit','permanent',NULL,NULL,NULL);
  RAISE EXCEPTION 'Non-admin can ban another user';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.get_database_size();
  RAISE EXCEPTION 'Non-admin can inspect database size';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE public.profiles SET credits_ad_premium_7d=coalesce(credits_ad_premium_7d,0)+1 WHERE id=a;
  RAISE EXCEPTION 'Client can mint premium credits';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 UPDATE public.profiles SET full_name=full_name WHERE id=a;
 INSERT INTO public.classified_ad_likes(ad_id,user_id) VALUES(ad,a);
 INSERT INTO public.classified_ad_likes(ad_id,user_id) VALUES(ad,a) ON CONFLICT(ad_id,user_id) DO NOTHING;
 INSERT INTO public.classified_ad_comments(ad_id,user_id,content) VALUES(ad,a,'Temporary RLS audit - transaction rollback') RETURNING id INTO comment_id;
 UPDATE public.classified_ad_comments SET content='Temporary edited comment' WHERE id=comment_id;
 SELECT count(*) INTO n FROM public.classified_ad_comments c JOIN public.profiles p ON p.id=c.user_id WHERE c.id=comment_id;
 IF n<>1 THEN RAISE EXCEPTION 'Author profile embed failed'; END IF;
 BEGIN
  INSERT INTO public.classified_ad_likes(ad_id,user_id) VALUES(ad,b);
  RAISE EXCEPTION 'Spoofed like was accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE public.classified_ad_comments SET user_id=b WHERE id=comment_id;
  RAISE EXCEPTION 'Comment ownership update was accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.approve_points_purchase(gen_random_uuid());
  RAISE EXCEPTION 'Client can approve payments';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.grant_signup_bonus(a,'organic');
  RAISE EXCEPTION 'Client can grant credits';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 SELECT count(*) INTO n FROM public.classified_ads WHERE id=ad AND likes_count=baseline_likes+1 AND comments_count=baseline_comments+1;
 IF n<>1 THEN RAISE EXCEPTION 'Counter triggers failed or duplicate like incremented twice'; END IF;
 INSERT INTO audit_results VALUES('Profile editing allowed; verification/credits protected; own like, duplicate, comment, edit, author join, spoof denial, financial RPC denial and counters',true);
 PERFORM set_config('request.jwt.claim.sub',b::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.classified_ad_likes WHERE ad_id=ad AND user_id=a;
 IF n<>0 THEN RAISE EXCEPTION 'Another user can read private likes'; END IF;
 SELECT count(*) INTO n FROM public.classified_ad_comments WHERE id=comment_id;
 IF n<>1 THEN RAISE EXCEPTION 'Public comment is not readable by another user'; END IF;
 DELETE FROM public.classified_ad_comments WHERE id=comment_id;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'Another user deleted the comment'; END IF;
 UPDATE public.classified_ad_comments SET content='Forbidden' WHERE id=comment_id;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'Another user edited the comment'; END IF;
 DELETE FROM public.classified_ad_likes WHERE ad_id=ad AND user_id=a;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>0 THEN RAISE EXCEPTION 'Another user removed the like'; END IF;
 SELECT count(*) INTO n FROM public.notifications WHERE user_id<>b;
 IF n<>0 THEN RAISE EXCEPTION 'Another user notifications are exposed'; END IF;
 SELECT count(*) INTO n FROM public.system_logs;
 IF n<>0 THEN RAISE EXCEPTION 'Non-admin can read system logs'; END IF;
 EXECUTE 'RESET ROLE';
 INSERT INTO audit_results VALUES('Second-user read isolation, public comment read, forbidden edit/delete, private notifications and logs',true);
 PERFORM set_config('request.jwt.claim.sub','',true);
 PERFORM set_config('request.jwt.claims','{"role":"anon"}',true);
 EXECUTE 'SET LOCAL ROLE anon';
 SELECT count(*) INTO n FROM public.classified_ad_comments WHERE id=comment_id;
 IF n<>1 THEN RAISE EXCEPTION 'Guest cannot read active ad comments'; END IF;
 BEGIN
  INSERT INTO public.classified_ad_comments(ad_id,user_id,content) VALUES(ad,a,'Forbidden guest comment');
  RAISE EXCEPTION 'Guest comment accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.classified_ad_likes(ad_id,user_id) VALUES(ad,b);
  RAISE EXCEPTION 'Guest like accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 INSERT INTO audit_results VALUES('Guest reads public comments but cannot like or comment',true);
 UPDATE public.classified_ads SET is_active=false WHERE id=ad;
 PERFORM set_config('request.jwt.claim.sub',b::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 BEGIN
  INSERT INTO public.classified_ad_comments(ad_id,user_id,content) VALUES(ad,b,'Forbidden inactive comment');
  RAISE EXCEPTION 'Inactive ad comment accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.classified_ad_likes(ad_id,user_id) VALUES(ad,b);
  RAISE EXCEPTION 'Inactive ad like accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 UPDATE public.classified_ads SET is_active=true WHERE id=ad;
 PERFORM set_config('request.jwt.claim.sub',a::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 DELETE FROM public.classified_ad_comments WHERE id=comment_id;
 DELETE FROM public.classified_ad_likes WHERE ad_id=ad AND user_id=a;
 EXECUTE 'RESET ROLE';
 SELECT count(*) INTO n FROM public.classified_ads WHERE id=ad AND likes_count=baseline_likes AND comments_count=baseline_comments;
 IF n<>1 THEN RAISE EXCEPTION 'Counter decrements failed'; END IF;
 INSERT INTO audit_results VALUES('Inactive ads reject writes, owner deletions restore counters',true);
END $$;
SELECT * FROM audit_results;
ROLLBACK;
