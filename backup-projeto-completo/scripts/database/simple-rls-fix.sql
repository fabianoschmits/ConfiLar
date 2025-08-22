-- POLÍTICAS RLS SIMPLES PARA CONVERSAS

-- 1. CONVERSATIONS: Usuários autenticados podem criar e ver suas conversas
DROP POLICY IF EXISTS "conversations_policy" ON public.conversations;
CREATE POLICY "conversations_policy" ON public.conversations
FOR ALL USING (auth.uid() IS NOT NULL);

-- 2. CONVERSATION_PARTICIPANTS: Usuários autenticados podem gerenciar participantes
DROP POLICY IF EXISTS "participants_policy" ON public.conversation_participants;
CREATE POLICY "participants_policy" ON public.conversation_participants
FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. MESSAGES: Usuários autenticados podem gerenciar mensagens
DROP POLICY IF EXISTS "messages_policy" ON public.messages;
CREATE POLICY "messages_policy" ON public.messages
FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Habilitar RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;




