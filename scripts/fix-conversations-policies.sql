-- ==================================================================================
-- CORREÇÃO DAS POLÍTICAS DE CONVERSAS (chat não abrindo)
-- Problema: políticas muito restritivas impedem acesso às conversas
-- ==================================================================================

BEGIN;

-- 1) Corrigir política de SELECT para conversations
-- Permitir acesso se o usuário é cliente OU profissional OU participante
DROP POLICY IF EXISTS conversations_select_if_participant ON public.conversations;
CREATE POLICY conversations_select_if_participant
ON public.conversations
FOR SELECT TO authenticated
USING (
  -- Acesso direto se é cliente ou profissional
  client_id = auth.uid() OR professional_id = auth.uid()
  OR
  -- Acesso via participação em conversation_participants
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversations.id
      AND cp.profile_id = auth.uid()
  )
);

-- 2) Permitir INSERT de conversas (criação)
DROP POLICY IF EXISTS conversations_insert_own ON public.conversations;
CREATE POLICY conversations_insert_own
ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (
  client_id = auth.uid() OR professional_id = auth.uid()
);

-- 3) Permitir UPDATE de conversas (atualização de status, etc.)
DROP POLICY IF EXISTS conversations_update_own ON public.conversations;
CREATE POLICY conversations_update_own
ON public.conversations
FOR UPDATE TO authenticated
USING (
  client_id = auth.uid() OR professional_id = auth.uid()
)
WITH CHECK (
  client_id = auth.uid() OR professional_id = auth.uid()
);

-- 4) Corrigir política de SELECT para messages
-- Permitir acesso se o usuário é remetente OU receptor OU participante da conversa
DROP POLICY IF EXISTS messages_select_if_participant ON public.messages;
CREATE POLICY messages_select_if_participant
ON public.messages
FOR SELECT TO authenticated
USING (
  -- Acesso direto se é remetente ou receptor
  sender_id = auth.uid() OR receiver_id = auth.uid()
  OR
  -- Acesso via participação na conversa
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id
      AND cp.profile_id = auth.uid()
  )
  OR
  -- Acesso via client_id/professional_id da conversa
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
  )
);

-- 5) Permitir INSERT de messages (envio)
DROP POLICY IF EXISTS messages_insert_if_participant_and_sender ON public.messages;
CREATE POLICY messages_insert_if_participant_and_sender
ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND (
    -- Verificar se é participante da conversa
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id
        AND cp.profile_id = auth.uid()
    )
    OR
    -- Verificar se é cliente ou profissional da conversa
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
    )
  )
);

-- 6) Permitir UPDATE de messages (marcar como lida, etc.)
DROP POLICY IF EXISTS messages_update_own ON public.messages;
CREATE POLICY messages_update_own
ON public.messages
FOR UPDATE TO authenticated
USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
)
WITH CHECK (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- 7) Corrigir política de conversation_participants
-- Permitir acesso se é o próprio participante OU se é cliente/profissional da conversa
DROP POLICY IF EXISTS cp_select_own ON public.conversation_participants;
CREATE POLICY cp_select_own
ON public.conversation_participants
FOR SELECT TO authenticated
USING (
  profile_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
  )
);

-- 8) Permitir INSERT de conversation_participants
DROP POLICY IF EXISTS cp_insert_own ON public.conversation_participants;
CREATE POLICY cp_insert_own
ON public.conversation_participants
FOR INSERT TO authenticated
WITH CHECK (
  profile_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
  )
);

COMMIT;

-- Verificação: testar se as políticas estão funcionando
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies 
-- WHERE schemaname='public' AND tablename IN ('conversations','messages','conversation_participants')
-- ORDER BY tablename, policyname;
