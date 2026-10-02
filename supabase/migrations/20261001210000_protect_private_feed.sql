BEGIN;
DROP POLICY IF EXISTS "Anyone can view active feed posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.feed_posts;
DROP POLICY IF EXISTS "Read visible feed posts" ON public.feed_posts;
CREATE POLICY "Read visible feed posts" ON public.feed_posts FOR SELECT TO anon,authenticated
 USING((is_active=true AND is_public=true) OR auth.uid() IN(user_id,professional_id));
DROP POLICY IF EXISTS "Users can view all comments" ON public.post_comments;
DROP POLICY IF EXISTS "Read comments on visible posts" ON public.post_comments;
CREATE POLICY "Read comments on visible posts" ON public.post_comments FOR SELECT TO anon,authenticated
 USING(EXISTS(SELECT 1 FROM public.feed_posts f WHERE f.id=post_id));
DROP POLICY IF EXISTS "Users can insert own comments" ON public.post_comments;
CREATE POLICY "Users can insert own comments" ON public.post_comments FOR INSERT TO authenticated
 WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.feed_posts f WHERE f.id=post_id AND f.is_active=true));
REVOKE UPDATE ON public.post_comments FROM anon,authenticated;
GRANT UPDATE(content,is_deleted,is_active,updated_at,mentions,hashtags) ON public.post_comments TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
