-- 1. Conversation Participants refinement
DROP POLICY IF EXISTS "Usuários podem adicionar participantes" ON public.conversation_participants;
DROP POLICY IF EXISTS "Usuários podem ver participantes de suas conversas" ON public.conversation_participants;
DROP POLICY IF EXISTS "cp_insert_simple" ON public.conversation_participants;
DROP POLICY IF EXISTS "cp_select_simple" ON public.conversation_participants;
DROP POLICY IF EXISTS "cp_select_participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "cp_insert_self" ON public.conversation_participants;

-- Correct SELECT: Users can see participants of conversations they are part of
CREATE POLICY "cp_select_participants" ON public.conversation_participants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants AS sub
            WHERE sub.conversation_id = conversation_participants.conversation_id 
              AND sub.profile_id = auth.uid()
        )
    );

-- Correct INSERT: User can only add themselves to a conversation
CREATE POLICY "cp_insert_self" ON public.conversation_participants
    FOR INSERT TO authenticated
    WITH CHECK (profile_id = auth.uid());

-- 2. Secure functions with corrected signatures
ALTER FUNCTION public.get_public_url(text, text) SET search_path = public;
ALTER FUNCTION public.cleanup_temp_files() SET search_path = public;
ALTER FUNCTION public.increment_points(uuid, integer) SET search_path = public;
ALTER FUNCTION public.notify_review() SET search_path = public;
ALTER FUNCTION public.validate_password_strength(text) SET search_path = public;
ALTER FUNCTION public.log_weak_password_attempt(text, jsonb) SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.is_user_banned(uuid) SET search_path = public;
ALTER FUNCTION public.add_points(uuid, integer, character varying, text, jsonb) SET search_path = public;
ALTER FUNCTION public.add_points(uuid, character varying, text, jsonb, uuid, uuid, uuid) SET search_path = public;
ALTER FUNCTION public.get_public_referral_stats() SET search_path = public;
ALTER FUNCTION public.deduct_points(uuid, integer, character varying, text) SET search_path = public;
ALTER FUNCTION public.get_user_points_balance(uuid) SET search_path = public;
ALTER FUNCTION public.transfer_points(uuid, uuid, integer, text) SET search_path = public;
ALTER FUNCTION public.create_notification(uuid, text, text, text, text, text, jsonb) SET search_path = public;
ALTER FUNCTION public.get_average_rating(uuid) SET search_path = public;
ALTER FUNCTION public.get_reviews_count(uuid) SET search_path = public;
ALTER FUNCTION public.format_cpf_cnpj(text) SET search_path = public;
ALTER FUNCTION public.format_phone(text) SET search_path = public;
ALTER FUNCTION public.calculate_age(date) SET search_path = public;
ALTER FUNCTION public.calcular_idade(date) SET search_path = public;
ALTER FUNCTION public.is_professional(uuid) SET search_path = public;
ALTER FUNCTION public.is_client(uuid) SET search_path = public;
ALTER FUNCTION public.get_admin_confipoints_stats() SET search_path = public;
ALTER FUNCTION public.get_admin_confipoints_users(integer, integer, text) SET search_path = public;
ALTER FUNCTION public.get_admin_confipoints_transactions(integer, integer, uuid, text, timestamp with time zone, timestamp with time zone) SET search_path = public;
ALTER FUNCTION public.get_admin_confipoints_by_source() SET search_path = public;
ALTER FUNCTION public.create_simple_notification(uuid, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.ban_user(uuid, text, character varying, integer, text, uuid) SET search_path = public;
ALTER FUNCTION public.approve_pending_ban(uuid, character varying, integer) SET search_path = public;
ALTER FUNCTION public.unban_user(uuid) SET search_path = public;
ALTER FUNCTION public.approve_points_purchase(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_rating(uuid) SET search_path = public;
ALTER FUNCTION public.send_message(uuid, uuid, uuid, text, text) SET search_path = public;
ALTER FUNCTION public.create_conversation(uuid, uuid, uuid) SET search_path = public;
ALTER FUNCTION public.mark_messages_as_read(uuid, uuid) SET search_path = public;
