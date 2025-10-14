-- ==================================================================================
-- FIX RLS (versão compatível com SQL Editor) – sem DO/EXECUTE
-- Estrutura: ENABLE RLS + DROP POLICY IF EXISTS + CREATE POLICY
-- Seguro e idempotente para rodar no Supabase SQL Editor
-- ==================================================================================

BEGIN;

-- 1) Habilitar RLS
ALTER TABLE IF EXISTS public.appointments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classified_ads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolio_projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_recommendations      ENABLE ROW LEVEL SECURITY;

-- 2) Conversations – participação via conversation_participants.profile_id
DROP POLICY IF EXISTS conversations_select_if_participant ON public.conversations;
CREATE POLICY conversations_select_if_participant
ON public.conversations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
      AND cp.profile_id = auth.uid()
  )
);

-- 3) Messages – só participantes leem; apenas o remetente envia
DROP POLICY IF EXISTS messages_select_if_participant ON public.messages;
CREATE POLICY messages_select_if_participant
ON public.messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS messages_insert_if_participant_and_sender ON public.messages;
CREATE POLICY messages_insert_if_participant_and_sender
ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_id
      AND cp.profile_id = auth.uid()
  )
);

-- 4) Conversation Participants – cada usuário gerencia os seus registros
DROP POLICY IF EXISTS cp_select_own ON public.conversation_participants;
CREATE POLICY cp_select_own
ON public.conversation_participants
FOR SELECT TO authenticated
USING (profile_id = auth.uid());

DROP POLICY IF EXISTS cp_insert_own ON public.conversation_participants;
CREATE POLICY cp_insert_own
ON public.conversation_participants
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid());

-- 5) Classified Ads – ativos públicos; dono gerencia
DROP POLICY IF EXISTS classified_ads_select_active ON public.classified_ads;
CREATE POLICY classified_ads_select_active
ON public.classified_ads
FOR SELECT TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS classified_ads_insert_owner ON public.classified_ads;
CREATE POLICY classified_ads_insert_owner
ON public.classified_ads
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS classified_ads_update_owner ON public.classified_ads;
CREATE POLICY classified_ads_update_owner
ON public.classified_ads
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS classified_ads_delete_owner ON public.classified_ads;
CREATE POLICY classified_ads_delete_owner
ON public.classified_ads
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 6) Appointments – cliente ou profissional envolvidos
DROP POLICY IF EXISTS appointments_select_involved ON public.appointments;
CREATE POLICY appointments_select_involved
ON public.appointments
FOR SELECT TO authenticated
USING (client_id = auth.uid() OR professional_id = auth.uid());

DROP POLICY IF EXISTS appointments_insert_involved ON public.appointments;
CREATE POLICY appointments_insert_involved
ON public.appointments
FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid() OR professional_id = auth.uid());

DROP POLICY IF EXISTS appointments_update_involved ON public.appointments;
CREATE POLICY appointments_update_involved
ON public.appointments
FOR UPDATE TO authenticated
USING (client_id = auth.uid() OR professional_id = auth.uid())
WITH CHECK (client_id = auth.uid() OR professional_id = auth.uid());

DROP POLICY IF EXISTS appointments_delete_involved ON public.appointments;
CREATE POLICY appointments_delete_involved
ON public.appointments
FOR DELETE TO authenticated
USING (client_id = auth.uid() OR professional_id = auth.uid());

-- 7) Portfolio Projects – dono gerencia; leitura pública
DROP POLICY IF EXISTS portfolio_select_owner_or_public ON public.portfolio_projects;
CREATE POLICY portfolio_select_owner_or_public
ON public.portfolio_projects
FOR SELECT TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS portfolio_insert_owner ON public.portfolio_projects;
CREATE POLICY portfolio_insert_owner
ON public.portfolio_projects
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS portfolio_update_owner ON public.portfolio_projects;
CREATE POLICY portfolio_update_owner
ON public.portfolio_projects
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS portfolio_delete_owner ON public.portfolio_projects;
CREATE POLICY portfolio_delete_owner
ON public.portfolio_projects
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 8) Reviews – leitura pública; reviewer gerencia
DROP POLICY IF EXISTS reviews_select_involved ON public.reviews;
CREATE POLICY reviews_select_involved
ON public.reviews
FOR SELECT TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS reviews_insert_reviewer ON public.reviews;
CREATE POLICY reviews_insert_reviewer
ON public.reviews
FOR INSERT TO authenticated
WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS reviews_update_reviewer ON public.reviews;
CREATE POLICY reviews_update_reviewer
ON public.reviews
FOR UPDATE TO authenticated
USING (reviewer_id = auth.uid())
WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS reviews_delete_reviewer ON public.reviews;
CREATE POLICY reviews_delete_reviewer
ON public.reviews
FOR DELETE TO authenticated
USING (reviewer_id = auth.uid());

-- 9) Notification Logs – por user_id (somente leitura do próprio)
DROP POLICY IF EXISTS notification_logs_select_own ON public.notification_logs;
CREATE POLICY notification_logs_select_own
ON public.notification_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 10) Notification Templates – manter fechado (sem políticas para usuários comuns)

COMMIT;

-- Verificações (opcionais):
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;
-- SELECT relname, relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND relname IN ('appointments','classified_ads','conversation_participants','conversations','messages','notification_logs','notification_templates','portfolio_projects','reviews','user_recommendations');


