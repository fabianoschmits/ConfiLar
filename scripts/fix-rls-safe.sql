-- =====================================================
-- CORREÇÃO RLS - VERSÃO SEGURA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: VERIFICAR QUAIS TABELAS EXISTEM
-- =====================================================

-- Listar todas as tabelas públicas
SELECT 
  'TABELAS EXISTENTES:' as status,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- PARTE 2: HABILITAR RLS APENAS EM TABELAS QUE EXISTEM
-- =====================================================

-- Habilitar RLS em tabelas que sabemos que existem
DO $$
BEGIN
  -- conversations
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations' AND schemaname = 'public') THEN
    ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em conversations';
  END IF;

  -- messages
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages' AND schemaname = 'public') THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em messages';
  END IF;

  -- classified_ads
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'classified_ads' AND schemaname = 'public') THEN
    ALTER TABLE public.classified_ads ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em classified_ads';
  END IF;

  -- reviews
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reviews' AND schemaname = 'public') THEN
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em reviews';
  END IF;

  -- portfolio_projects
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'portfolio_projects' AND schemaname = 'public') THEN
    ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em portfolio_projects';
  END IF;

  -- appointments
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'appointments' AND schemaname = 'public') THEN
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em appointments';
  END IF;

  -- notification_templates
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notification_templates' AND schemaname = 'public') THEN
    ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado em notification_templates';
  END IF;
END $$;

-- =====================================================
-- PARTE 3: CRIAR POLÍTICAS RLS PARA CONVERSAS
-- =====================================================

-- Políticas para conversations (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations' AND schemaname = 'public') THEN
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

    RAISE NOTICE 'Políticas criadas para conversations';
  END IF;
END $$;

-- =====================================================
-- PARTE 4: CRIAR POLÍTICAS RLS PARA MENSAGENS
-- =====================================================

-- Políticas para messages (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages' AND schemaname = 'public') THEN
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

    RAISE NOTICE 'Políticas criadas para messages';
  END IF;
END $$;

-- =====================================================
-- PARTE 5: CRIAR POLÍTICAS RLS PARA CLASSIFICADOS
-- =====================================================

-- Políticas para classified_ads (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'classified_ads' AND schemaname = 'public') THEN
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

    RAISE NOTICE 'Políticas criadas para classified_ads';
  END IF;
END $$;

-- =====================================================
-- PARTE 6: CRIAR POLÍTICAS RLS PARA AVALIAÇÕES
-- =====================================================

-- Políticas para reviews (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reviews' AND schemaname = 'public') THEN
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

    RAISE NOTICE 'Políticas criadas para reviews';
  END IF;
END $$;

-- =====================================================
-- PARTE 7: CRIAR POLÍTICAS RLS PARA PORTFÓLIO
-- =====================================================

-- Políticas para portfolio_projects (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'portfolio_projects' AND schemaname = 'public') THEN
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

    RAISE NOTICE 'Políticas criadas para portfolio_projects';
  END IF;
END $$;

-- =====================================================
-- PARTE 8: CRIAR POLÍTICAS RLS PARA AGENDAMENTOS
-- =====================================================

-- Políticas para appointments (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'appointments' AND schemaname = 'public') THEN
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

    RAISE NOTICE 'Políticas criadas para appointments';
  END IF;
END $$;

-- =====================================================
-- PARTE 9: CRIAR POLÍTICAS RLS PARA TEMPLATES
-- =====================================================

-- Políticas para notification_templates (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notification_templates' AND schemaname = 'public') THEN
    DROP POLICY IF EXISTS "Admins can manage notification templates" ON public.notification_templates;
    CREATE POLICY "Admins can manage notification templates" ON public.notification_templates
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.admins 
          WHERE admins.user_id = auth.uid() 
          AND admins.is_active = true
        )
      );

    RAISE NOTICE 'Políticas criadas para notification_templates';
  END IF;
END $$;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar tabelas com RLS habilitado
SELECT 
  'TABELAS COM RLS HABILITADO:' as status,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
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
ORDER BY tablename, policyname;



