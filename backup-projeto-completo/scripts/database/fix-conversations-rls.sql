-- =====================================================
-- CORRIGIR POLÍTICAS RLS PARA CONVERSAS
-- =====================================================

-- 1. POLÍTICAS PARA TABELA CONVERSATIONS
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

-- Política para visualizar conversas (através de conversation_participants)
CREATE POLICY "Users can view their conversations" ON public.conversations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversations.id 
    AND profile_id = auth.uid()
  )
);

-- Política para criar conversas (qualquer usuário autenticado)
CREATE POLICY "Users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para atualizar conversas (apenas participantes)
CREATE POLICY "Users can update their conversations" ON public.conversations
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = conversations.id 
    AND profile_id = auth.uid()
  )
);

-- 2. POLÍTICAS PARA TABELA CONVERSATION_PARTICIPANTS
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can remove themselves from conversations" ON public.conversation_participants;

-- Política para visualizar participantes (apenas de conversas onde o usuário participa)
CREATE POLICY "Users can view conversation participants" ON public.conversation_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp2 
    WHERE cp2.conversation_id = conversation_participants.conversation_id 
    AND cp2.profile_id = auth.uid()
  )
);

-- Política para adicionar participantes (qualquer usuário autenticado pode adicionar)
CREATE POLICY "Users can add conversation participants" ON public.conversation_participants
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- O usuário pode se adicionar
    profile_id = auth.uid() OR
    -- Ou adicionar outros se ele já é participante da conversa
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = conversation_participants.conversation_id 
      AND profile_id = auth.uid()
    )
  )
);

-- Política para remover participantes (apenas a si mesmo)
CREATE POLICY "Users can remove themselves from conversations" ON public.conversation_participants
FOR DELETE USING (profile_id = auth.uid());

-- 3. POLÍTICAS PARA TABELA MESSAGES
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Política para visualizar mensagens (apenas de conversas onde o usuário participa)
CREATE POLICY "Users can view messages from their conversations" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = messages.conversation_id 
    AND profile_id = auth.uid()
  )
);

-- Política para enviar mensagens (apenas para conversas onde o usuário participa)
CREATE POLICY "Users can send messages to their conversations" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = messages.conversation_id 
    AND profile_id = auth.uid()
  )
);

-- Política para atualizar mensagens (apenas suas próprias)
CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================

-- Habilitar RLS nas tabelas (caso não esteja)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. LOGS PARA CONFIRMAÇÃO
-- =====================================================

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;




