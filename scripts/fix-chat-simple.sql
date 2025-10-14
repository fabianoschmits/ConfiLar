-- ==================================================================================
-- CORREÇÃO SIMPLES DO CHAT (políticas básicas que funcionam)
-- Remove políticas complexas e cria políticas simples
-- ==================================================================================

BEGIN;

-- 1) Remover todas as políticas existentes de conversations
DROP POLICY IF EXISTS conversations_select_if_participant ON public.conversations;
DROP POLICY IF EXISTS conversations_insert_own ON public.conversations;
DROP POLICY IF EXISTS conversations_update_own ON public.conversations;

-- 2) Criar políticas simples para conversations
CREATE POLICY conversations_select_simple
ON public.conversations
FOR SELECT TO authenticated
USING (client_id = auth.uid() OR professional_id = auth.uid());

CREATE POLICY conversations_insert_simple
ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid() OR professional_id = auth.uid());

CREATE POLICY conversations_update_simple
ON public.conversations
FOR UPDATE TO authenticated
USING (client_id = auth.uid() OR professional_id = auth.uid())
WITH CHECK (client_id = auth.uid() OR professional_id = auth.uid());

-- 3) Remover todas as políticas existentes de messages
DROP POLICY IF EXISTS messages_select_if_participant ON public.messages;
DROP POLICY IF EXISTS messages_insert_if_participant_and_sender ON public.messages;
DROP POLICY IF EXISTS messages_update_own ON public.messages;

-- 4) Criar políticas simples para messages
CREATE POLICY messages_select_simple
ON public.messages
FOR SELECT TO authenticated
USING (
  sender_id = auth.uid() 
  OR receiver_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
  )
);

CREATE POLICY messages_insert_simple
ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
  )
);

CREATE POLICY messages_update_simple
ON public.messages
FOR UPDATE TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid())
WITH CHECK (sender_id = auth.uid() OR receiver_id = auth.uid());

-- 5) Remover políticas de conversation_participants (não são essenciais para o chat básico)
DROP POLICY IF EXISTS cp_select_own ON public.conversation_participants;
DROP POLICY IF EXISTS cp_insert_own ON public.conversation_participants;

-- 6) Criar políticas básicas para conversation_participants
CREATE POLICY cp_select_simple
ON public.conversation_participants
FOR SELECT TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY cp_insert_simple
ON public.conversation_participants
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid());

COMMIT;

-- Verificação: listar políticas criadas
SELECT 
  'POLÍTICAS APLICADAS:' as status,
  tablename, 
  policyname, 
  cmd as operation
FROM pg_policies 
WHERE schemaname='public' 
  AND tablename IN ('conversations','messages','conversation_participants')
ORDER BY tablename, policyname;
