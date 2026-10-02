BEGIN;
-- Remove permissive legacy policies: permissive policies are combined with OR.
DROP POLICY IF EXISTS notifications_select_policy ON public.notifications;
DROP POLICY IF EXISTS notifications_update_policy ON public.notifications;
DROP POLICY IF EXISTS notifications_insert_policy ON public.notifications;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated notification producers" ON public.notifications;
CREATE POLICY "Authenticated notification producers" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL AND is_read = false);
REVOKE ALL ON public.notifications FROM anon;
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;
DROP POLICY IF EXISTS "Admins can view system_logs" ON public.system_logs;
DROP POLICY IF EXISTS "Service role can insert logs" ON public.system_logs;
GRANT ALL ON public.system_logs TO service_role;
REVOKE INSERT, UPDATE, DELETE ON public.system_logs FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.points_purchases FROM anon, authenticated;

-- Privileged operations are reached through authenticated server handlers.
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure AS signature, p.proname, p.prorettype, p.prosecdef, p.proconfig
 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
 LOOP
   IF f.prosecdef AND NOT EXISTS (SELECT 1 FROM unnest(f.proconfig) c WHERE c LIKE 'search_path=%') THEN
     EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp',f.signature);
   END IF;
   IF f.prorettype='trigger'::regtype OR f.proname = ANY(ARRAY[
     'increment_points','add_referral_points','admin_refund_purchase','approve_points_purchase',
     'create_points_purchase','purchase_store_item','create_withdrawal','decrement_credit_count',
     'grant_signup_bonus','maintain_premium_classifieds','maintain_premium_posts',
     'maintain_premium_notifications','maintain_premium_posts_notifications',
     'deactivate_expired_premium_classifieds','deactivate_expired_premium_posts',
     'delete_expired_premium_posts','notify_premium_classifieds_expired','notify_premium_classifieds_expiring',
     'notify_premium_posts_expired','notify_premium_posts_expiring','cleanup_expired_stories',
     'cleanup_expired_stories_report','cleanup_temp_files','send_message','mark_messages_as_read',
     'create_conversation','create_contact_agreement','create_post_normal',
     'can_send_email_notification','update_email_notification_control'
   ]) THEN
     EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
     EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',f.signature);
   END IF;
 END LOOP;
END $$;

-- Comments have mutable content, not mutable ownership; timestamps are server-owned.
CREATE OR REPLACE FUNCTION public.touch_classified_comment() RETURNS trigger
LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS touch_classified_comment ON public.classified_ad_comments;
CREATE TRIGGER touch_classified_comment BEFORE UPDATE ON public.classified_ad_comments
  FOR EACH ROW EXECUTE FUNCTION public.touch_classified_comment();
REVOKE EXECUTE ON FUNCTION public.touch_classified_comment() FROM PUBLIC, anon, authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
