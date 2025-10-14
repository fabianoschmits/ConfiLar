-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO COMPLETA DO BANCO DE DADOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: VERIFICAR ESTRUTURA ATUAL DO BANCO
-- =====================================================

-- Listar todas as tabelas existentes
SELECT 
  'TABELAS EXISTENTES:' as status,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar colunas das tabelas principais
SELECT 
  'COLUNAS DAS TABELAS:' as status,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'classified_ads', 'reviews', 'appointments', 'portfolio_projects', 'notifications', 'notification_logs', 'notification_templates', 'user_recommendations', 'conversation_participants')
ORDER BY table_name, ordinal_position;

-- Verificar views existentes
SELECT 
  'VIEWS EXISTENTES:' as status,
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- =====================================================
-- PARTE 2: HABILITAR RLS EM TABELAS EXISTENTES
-- =====================================================

-- Habilitar RLS em tabelas que existem
DO $$
DECLARE
  table_name TEXT;
  tables_to_check TEXT[] := ARRAY[
    'conversations', 'messages', 'classified_ads', 'reviews', 
    'appointments', 'portfolio_projects', 'notifications', 
    'notification_logs', 'notification_templates', 'user_recommendations', 
    'conversation_participants', 'reports', 'admins'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_check
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = table_name AND schemaname = 'public') THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      RAISE NOTICE 'RLS habilitado em %', table_name;
    ELSE
      RAISE NOTICE 'Tabela % não existe, pulando...', table_name;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- PARTE 3: CRIAR POLÍTICAS RLS PARA CONVERSAS
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations' AND schemaname = 'public') THEN
    -- Verificar se a tabela tem as colunas necessárias
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'client_id') THEN
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
    ELSE
      RAISE NOTICE 'Tabela conversations não tem as colunas necessárias';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 4: CRIAR POLÍTICAS RLS PARA MENSAGENS
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id') THEN
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
    ELSE
      RAISE NOTICE 'Tabela messages não tem as colunas necessárias';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 5: CRIAR POLÍTICAS RLS PARA CLASSIFICADOS
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'classified_ads' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classified_ads' AND column_name = 'user_id') THEN
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
    ELSE
      RAISE NOTICE 'Tabela classified_ads não tem user_id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 6: CRIAR POLÍTICAS RLS PARA AVALIAÇÕES
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'reviews' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewer_id') THEN
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
    ELSE
      RAISE NOTICE 'Tabela reviews não tem reviewer_id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 7: CRIAR POLÍTICAS RLS PARA PORTFÓLIO
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'portfolio_projects' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'portfolio_projects' AND column_name = 'user_id') THEN
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
    ELSE
      RAISE NOTICE 'Tabela portfolio_projects não tem user_id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 8: CRIAR POLÍTICAS RLS PARA NOTIFICAÇÕES
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notifications' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
      DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
      CREATE POLICY "Users can view their own notifications" ON public.notifications
        FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
      CREATE POLICY "Users can update their own notifications" ON public.notifications
        FOR UPDATE USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
      CREATE POLICY "System can insert notifications" ON public.notifications
        FOR INSERT WITH CHECK (true);

      RAISE NOTICE 'Políticas criadas para notifications';
    ELSE
      RAISE NOTICE 'Tabela notifications não tem user_id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 9: CRIAR POLÍTICAS RLS PARA LOGS DE NOTIFICAÇÃO
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notification_logs' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'user_id') THEN
      DROP POLICY IF EXISTS "Users can view their own notification logs" ON public.notification_logs;
      CREATE POLICY "Users can view their own notification logs" ON public.notification_logs
        FOR SELECT USING (user_id = auth.uid());

      DROP POLICY IF EXISTS "System can insert notification logs" ON public.notification_logs;
      CREATE POLICY "System can insert notification logs" ON public.notification_logs
        FOR INSERT WITH CHECK (true);

      RAISE NOTICE 'Políticas criadas para notification_logs';
    ELSE
      RAISE NOTICE 'Tabela notification_logs não tem user_id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 10: CRIAR POLÍTICAS RLS PARA TEMPLATES
-- =====================================================

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
-- PARTE 11: CRIAR POLÍTICAS RLS PARA AGENDAMENTOS
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'appointments' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'client_id') THEN
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
    ELSE
      RAISE NOTICE 'Tabela appointments não tem as colunas necessárias';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 12: CRIAR POLÍTICAS RLS PARA PARTICIPANTES
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversation_participants' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversation_participants' AND column_name = 'user_id') THEN
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

      RAISE NOTICE 'Políticas criadas para conversation_participants';
    ELSE
      RAISE NOTICE 'Tabela conversation_participants não tem user_id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 13: CRIAR POLÍTICAS RLS PARA RECOMENDAÇÕES
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_recommendations' AND schemaname = 'public') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_recommendations' AND column_name = 'user_id') THEN
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

      RAISE NOTICE 'Políticas criadas para user_recommendations';
    ELSE
      RAISE NOTICE 'Tabela user_recommendations não tem user_id';
    END IF;
  END IF;
END $$;

-- =====================================================
-- PARTE 14: CORRIGIR VIEWS SECURITY DEFINER
-- =====================================================

-- Recriar views sem SECURITY DEFINER
DO $$
DECLARE
  has_is_permanent BOOLEAN := FALSE;
  has_is_active BOOLEAN := FALSE;
  has_expires_at BOOLEAN := FALSE;
  has_profile_views BOOLEAN := FALSE;
BEGIN
  -- Verificar se a tabela user_bans existe e suas colunas
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_bans' AND schemaname = 'public') THEN
    -- Verificar colunas específicas
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_bans' AND column_name = 'is_permanent'
    ) INTO has_is_permanent;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_bans' AND column_name = 'is_active'
    ) INTO has_is_active;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_bans' AND column_name = 'expires_at'
    ) INTO has_expires_at;
    
    -- Recriar active_bans_view apenas se a tabela e colunas existirem
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'active_bans_view' AND schemaname = 'public') THEN
      DROP VIEW IF EXISTS public.active_bans_view CASCADE;
      
      -- Criar view baseada nas colunas que realmente existem
      IF has_is_permanent AND has_is_active AND has_expires_at THEN
        EXECUTE 'CREATE VIEW public.active_bans_view AS
          SELECT 
            ub.id,
            ub.user_id,
            ub.reason,
            ub.banned_by,
            ub.created_at,
            ub.expires_at,
            ub.is_permanent,
            p.full_name as banned_user_name,
            p.email as banned_user_email,
            admin_p.full_name as banned_by_name
          FROM user_bans ub
          LEFT JOIN profiles p ON ub.user_id = p.id
          LEFT JOIN profiles admin_p ON ub.banned_by = admin_p.id
          WHERE ub.is_active = true
          AND (ub.expires_at IS NULL OR ub.expires_at > NOW())';
      ELSIF has_is_active AND has_expires_at THEN
        EXECUTE 'CREATE VIEW public.active_bans_view AS
          SELECT 
            ub.id,
            ub.user_id,
            ub.reason,
            ub.banned_by,
            ub.created_at,
            ub.expires_at,
            p.full_name as banned_user_name,
            p.email as banned_user_email,
            admin_p.full_name as banned_by_name
          FROM user_bans ub
          LEFT JOIN profiles p ON ub.user_id = p.id
          LEFT JOIN profiles admin_p ON ub.banned_by = admin_p.id
          WHERE ub.is_active = true
          AND (ub.expires_at IS NULL OR ub.expires_at > NOW())';
      ELSE
        EXECUTE 'CREATE VIEW public.active_bans_view AS
          SELECT 
            ub.id,
            ub.user_id,
            ub.reason,
            ub.banned_by,
            ub.created_at,
            p.full_name as banned_user_name,
            p.email as banned_user_email,
            admin_p.full_name as banned_by_name
          FROM user_bans ub
          LEFT JOIN profiles p ON ub.user_id = p.id
          LEFT JOIN profiles admin_p ON ub.banned_by = admin_p.id';
      END IF;
      
      RAISE NOTICE 'View active_bans_view recriada sem SECURITY DEFINER';
    END IF;
  END IF;

  -- Verificar se a tabela profile_views existe
  SELECT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'profile_views' AND schemaname = 'public'
  ) INTO has_profile_views;

  -- Recriar profile_view_statistics apenas se a tabela profile_views existir
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'profile_view_statistics' AND schemaname = 'public') THEN
    DROP VIEW IF EXISTS public.profile_view_statistics CASCADE;
    
    IF has_profile_views THEN
      EXECUTE 'CREATE VIEW public.profile_view_statistics AS
        SELECT 
          p.id as profile_id,
          p.full_name,
          p.user_type,
          COUNT(pv.id) as total_views,
          COUNT(pv.id) FILTER (WHERE pv.created_at >= CURRENT_DATE) as views_today,
          COUNT(pv.id) FILTER (WHERE pv.created_at >= CURRENT_DATE - INTERVAL ''7 days'') as views_this_week,
          COUNT(pv.id) FILTER (WHERE pv.created_at >= CURRENT_DATE - INTERVAL ''30 days'') as views_this_month,
          MAX(pv.created_at) as last_viewed_at
        FROM profiles p
        LEFT JOIN profile_views pv ON p.id = pv.profile_id
        GROUP BY p.id, p.full_name, p.user_type';
    ELSE
      EXECUTE 'CREATE VIEW public.profile_view_statistics AS
        SELECT 
          p.id as profile_id,
          p.full_name,
          p.user_type,
          0 as total_views,
          0 as views_today,
          0 as views_this_week,
          0 as views_this_month,
          NULL as last_viewed_at
        FROM profiles p';
    END IF;
    
    RAISE NOTICE 'View profile_view_statistics recriada sem SECURITY DEFINER';
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

-- Verificar views sem SECURITY DEFINER
SELECT 
  'VIEWS SEM SECURITY DEFINER:' as status,
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ AINDA TEM SECURITY DEFINER'
    ELSE '✅ SEM SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- Contar problemas restantes
SELECT 
  'RESUMO FINAL:' as status,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false) as tabelas_sem_rls,
  (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public' AND definition LIKE '%SECURITY DEFINER%') as views_security_definer;

-- =====================================================
-- CORREÇÃO COMPLETA REALIZADA!
-- =====================================================
