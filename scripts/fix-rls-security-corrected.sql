-- =====================================================
-- CORREÇÃO RLS - VERSÃO CORRIGIDA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classified_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 2: CRIAR POLÍTICAS RLS PARA CONVERSAS
-- =====================================================

-- Políticas para conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations" ON public.conversations
  FOR UPDATE USING (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

-- =====================================================
-- PARTE 3: CRIAR POLÍTICAS RLS PARA MENSAGENS
-- =====================================================

-- Políticas para messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
CREATE POLICY "Users can insert messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
      AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid());

-- =====================================================
-- PARTE 4: CRIAR POLÍTICAS RLS PARA CLASSIFICADOS
-- =====================================================

-- Políticas para classified_ads
DROP POLICY IF EXISTS "Users can view all active classified ads" ON public.classified_ads;
CREATE POLICY "Users can view all active classified ads" ON public.classified_ads
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can insert their own classified ads" ON public.classified_ads;
CREATE POLICY "Users can insert their own classified ads" ON public.classified_ads
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own classified ads" ON public.classified_ads;
CREATE POLICY "Users can update their own classified ads" ON public.classified_ads
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own classified ads" ON public.classified_ads;
CREATE POLICY "Users can delete their own classified ads" ON public.classified_ads
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- PARTE 5: CRIAR POLÍTICAS RLS PARA AVALIAÇÕES
-- =====================================================

-- Políticas para reviews
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
CREATE POLICY "Users can view all reviews" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (reviewer_id = auth.uid());

-- =====================================================
-- PARTE 6: CRIAR POLÍTICAS RLS PARA PORTFÓLIO
-- =====================================================

-- Políticas para portfolio_projects
DROP POLICY IF EXISTS "Users can view all portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Users can view all portfolio projects" ON public.portfolio_projects
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Users can insert their own portfolio projects" ON public.portfolio_projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Users can update their own portfolio projects" ON public.portfolio_projects
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Users can delete their own portfolio projects" ON public.portfolio_projects
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- PARTE 7: CRIAR POLÍTICAS RLS PARA NOTIFICAÇÕES
-- =====================================================

-- Políticas para notification_logs
DROP POLICY IF EXISTS "Users can view their own notification logs" ON public.notification_logs;
CREATE POLICY "Users can view their own notification logs" ON public.notification_logs
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notification logs" ON public.notification_logs;
CREATE POLICY "System can insert notification logs" ON public.notification_logs
  FOR INSERT WITH CHECK (true);

-- Políticas para notification_templates (apenas admins)
DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- =====================================================
-- PARTE 8: CRIAR POLÍTICAS RLS PARA RECOMENDAÇÕES
-- =====================================================

-- Políticas para user_recommendations
DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.user_recommendations;
CREATE POLICY "Users can view their own recommendations" ON public.user_recommendations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own recommendations" ON public.user_recommendations;
CREATE POLICY "Users can insert their own recommendations" ON public.user_recommendations
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own recommendations" ON public.user_recommendations;
CREATE POLICY "Users can update their own recommendations" ON public.user_recommendations
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own recommendations" ON public.user_recommendations;
CREATE POLICY "Users can delete their own recommendations" ON public.user_recommendations
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- PARTE 9: CRIAR POLÍTICAS RLS PARA AGENDAMENTOS
-- =====================================================

-- Políticas para appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;
CREATE POLICY "Users can delete their own appointments" ON public.appointments
  FOR DELETE USING (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

-- =====================================================
-- PARTE 10: CRIAR POLÍTICAS RLS PARA PARTICIPANTES
-- =====================================================

-- Políticas para conversation_participants
DROP POLICY IF EXISTS "Users can view their own conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can view their own conversation participants" ON public.conversation_participants
  FOR SELECT USING (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can insert their own conversation participants" ON public.conversation_participants;
CREATE POLICY "Users can insert their own conversation participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- =====================================================
-- PARTE 11: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se RLS está habilitado em todas as tabelas
SELECT 
  'TABELAS COM RLS HABILITADO:' as status,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'conversations', 'messages', 'classified_ads', 'reviews',
  'portfolio_projects', 'notification_logs', 'user_recommendations',
  'appointments', 'conversation_participants', 'notification_templates'
)
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
  'POLÍTICAS RLS CRIADAS:' as status,
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'conversations', 'messages', 'classified_ads', 'reviews',
  'portfolio_projects', 'notification_logs', 'user_recommendations',
  'appointments', 'conversation_participants', 'notification_templates'
)
ORDER BY tablename, policyname;

-- =====================================================
-- CORREÇÃO RLS CONCLUÍDA COM SUCESSO!
-- =====================================================



