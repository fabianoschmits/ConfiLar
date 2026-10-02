BEGIN;
SET LOCAL lock_timeout='3s';
SET LOCAL statement_timeout='45s';
CREATE TEMP TABLE social_results (scenario text,passed boolean);
DO $$ DECLARE a uuid; b uuid; outsider uuid; conv uuid; msg uuid; post uuid; comment_id uuid; ad uuid; notification uuid; n integer;
BEGIN
 SELECT p.id INTO a FROM public.profiles p WHERE NOT EXISTS(SELECT 1 FROM public.admins x WHERE x.user_id=p.id) ORDER BY p.id LIMIT 1;
 SELECT p.id INTO b FROM public.profiles p WHERE p.id<>a AND NOT EXISTS(SELECT 1 FROM public.admins x WHERE x.user_id=p.id) ORDER BY p.id LIMIT 1;
 SELECT p.id INTO outsider FROM public.profiles p WHERE p.id NOT IN(a,b) AND NOT EXISTS(SELECT 1 FROM public.admins x WHERE x.user_id=p.id) LIMIT 1;
 IF outsider IS NULL THEN RAISE EXCEPTION 'Need three non-admin test identities'; END IF;
 PERFORM set_config('request.jwt.claim.sub',a::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 INSERT INTO public.conversations(client_id,professional_id,status) VALUES(a,b,'active') RETURNING id INTO conv;
 INSERT INTO public.conversation_participants(conversation_id,profile_id) VALUES(conv,a);
 INSERT INTO public.messages(conversation_id,sender_id,receiver_id,content,message_type) VALUES(conv,a,b,'Temporary audit message','text') RETURNING id INTO msg;
 UPDATE public.messages SET content='Temporary edited message',is_edited=true WHERE id=msg;
 BEGIN
  INSERT INTO public.messages(conversation_id,sender_id,receiver_id,content) VALUES(conv,a,outsider,'Forbidden recipient');
  RAISE EXCEPTION 'Unrelated recipient accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 notification:=gen_random_uuid();
 INSERT INTO public.notifications(id,user_id,type,title,message,action_url) VALUES(notification,b,'message','Temporary message notification','Rolled back','/mensagens');
 -- Return representation of another recipient is forbidden; ordinary clients use minimal INSERT.
 EXECUTE 'RESET ROLE';
 INSERT INTO social_results VALUES('Create own chat, membership, send/edit message, reject unrelated recipient',true);
 PERFORM set_config('request.jwt.claim.sub',b::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 UPDATE public.messages SET is_read=true WHERE id=msg;
 BEGIN
  UPDATE public.messages SET content='Forbidden recipient edit' WHERE id=msg;
  RAISE EXCEPTION 'Recipient edited sender content';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 SELECT count(*) INTO n FROM public.notifications WHERE id=notification;
 IF n<>1 THEN RAISE EXCEPTION 'Recipient cannot read own notification'; END IF;
 UPDATE public.notifications SET is_read=true WHERE id=notification;
 EXECUTE 'RESET ROLE';
 INSERT INTO social_results VALUES('Recipient reads chat and notification, marks read, cannot edit sender content',true);
 PERFORM set_config('request.jwt.claim.sub',outsider::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',outsider,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.messages WHERE id=msg;
 IF n<>0 THEN RAISE EXCEPTION 'Outsider reads chat'; END IF;
 BEGIN
  INSERT INTO public.conversation_participants(conversation_id,profile_id) VALUES(conv,outsider);
  RAISE EXCEPTION 'Outsider joins private chat';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.notifications(user_id,type,title,message) VALUES(b,'achievement','Fake award','Forbidden');
  RAISE EXCEPTION 'Forged notification accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 INSERT INTO social_results VALUES('Outsider cannot read or join chat, cannot forge recipient notification',true);
 PERFORM set_config('request.jwt.claim.sub',a::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 INSERT INTO public.feed_posts(user_id,professional_id,title,description,is_public,is_active) VALUES(a,a,'Temporary audit post','Rolled back',true,true) RETURNING id INTO post;
 INSERT INTO public.post_comments(post_id,user_id,content) VALUES(post,a,'Temporary comment') RETURNING id INTO comment_id;
 UPDATE public.post_comments SET content='Edited temporary comment' WHERE id=comment_id;
 INSERT INTO public.classified_ads(user_id,title,description,category,location_city,location_state,ad_type,is_active)
 SELECT a,'Temporary audit ad','Rolled back',category,location_city,location_state,ad_type,true FROM public.classified_ads WHERE is_active LIMIT 1 RETURNING id INTO ad;
 UPDATE public.classified_ads SET title='Edited temporary ad' WHERE id=ad;
 DELETE FROM public.classified_ads WHERE id=ad;
 UPDATE public.feed_posts SET is_public=false WHERE id=post;
 EXECUTE 'RESET ROLE';
 INSERT INTO social_results VALUES('Create/edit/delete classified including notification trigger; create feed post and edit comment',true);
 PERFORM set_config('request.jwt.claim.sub',b::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',b,'role','authenticated')::text,true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.feed_posts WHERE id=post;
 IF n<>0 THEN RAISE EXCEPTION 'Private post exposed'; END IF;
 SELECT count(*) INTO n FROM public.post_comments WHERE id=comment_id;
 IF n<>0 THEN RAISE EXCEPTION 'Private post comments exposed'; END IF;
 EXECUTE 'RESET ROLE';
 INSERT INTO social_results VALUES('Private feed posts and comments are hidden from other users',true);
END $$;
SELECT * FROM social_results;
ROLLBACK;
