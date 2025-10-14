-- ============================================================================
-- Fix RLS and Security Issues (consolidated)
-- Context: Supabase project – enable RLS where required, add minimal safe
-- policies for conversations/messages, and convert views to security invoker.
--
-- Safety principles:
-- - Enable RLS first; by default access is denied unless policies exist
-- - Do NOT create broad read policies for admin tables (e.g. notifications)
-- - Keep policies minimal and principle-of-least-privilege
-- - Use IF NOT EXISTS to keep script idempotent
--
-- NOTE: Review owner columns before applying optional sections (appointments,
-- reviews, portfolio_projects). Adjust column names if they differ.
-- ============================================================================

BEGIN;

-- 1) Enable RLS on tables flagged by linter
-- Tables that already have policies defined (leave policies as-is):
ALTER TABLE IF EXISTS public.classified_ads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_recommendations     ENABLE ROW LEVEL SECURITY;

-- Other public tables (no broad policies added here; access remains denied
-- to anon/authenticated unless specific policies are created):
ALTER TABLE IF EXISTS public.conversations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.portfolio_projects       ENABLE ROW LEVEL SECURITY;

-- 2) Minimal policies for conversations/messages based on membership
-- Assumptions (adjust if your schema differs):
-- - conversation_participants(conversation_id, user_id)
-- - messages(conversation_id, sender_id)

-- Conversations: SELECT only for participants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversations' AND policyname = 'conversations_select_own'
  ) THEN
    EXECUTE $$
      CREATE POLICY conversations_select_own
      ON public.conversations
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.conversation_participants cp
          WHERE cp.conversation_id = conversations.id
            AND cp.user_id = auth.uid()
        )
      );
    $$;
  END IF;
END$$;

-- Messages: SELECT only if participant of the conversation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_select_in_own_conversations'
  ) THEN
    EXECUTE $$
      CREATE POLICY messages_select_in_own_conversations
      ON public.messages
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.conversation_participants cp
          WHERE cp.conversation_id = messages.conversation_id
            AND cp.user_id = auth.uid()
        )
      );
    $$;
  END IF;
END$$;

-- Messages: INSERT only if participant and sender is current user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'messages_insert_if_participant'
  ) THEN
    EXECUTE $$
      CREATE POLICY messages_insert_if_participant
      ON public.messages
      FOR INSERT
      TO authenticated
      WITH CHECK (
        NEW.sender_id = auth.uid()
        AND EXISTS (
          SELECT 1
          FROM public.conversation_participants cp
          WHERE cp.conversation_id = NEW.conversation_id
            AND cp.user_id = auth.uid()
        )
      );
    $$;
  END IF;
END$$;

-- (Optional) appointments/reviews/portfolio_projects owner policies
-- Uncomment and adjust owner column names (e.g., user_id, author_id, profile_id)
-- if you want owners to manage their own rows.
/*
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_owner_select'
  ) THEN
    EXECUTE $$
      CREATE POLICY appointments_owner_select
      ON public.appointments
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_owner_insert'
  ) THEN
    EXECUTE $$
      CREATE POLICY appointments_owner_insert
      ON public.appointments
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_owner_update'
  ) THEN
    EXECUTE $$
      CREATE POLICY appointments_owner_update
      ON public.appointments
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    $$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_owner_select'
  ) THEN
    EXECUTE $$
      CREATE POLICY reviews_owner_select
      ON public.reviews
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_owner_insert'
  ) THEN
    EXECUTE $$
      CREATE POLICY reviews_owner_insert
      ON public.reviews
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_owner_update'
  ) THEN
    EXECUTE $$
      CREATE POLICY reviews_owner_update
      ON public.reviews
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    $$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_projects' AND policyname='portfolio_owner_select'
  ) THEN
    EXECUTE $$
      CREATE POLICY portfolio_owner_select
      ON public.portfolio_projects
      FOR SELECT TO authenticated
      USING (user_id = auth.uid()); -- ajuste a coluna do dono
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_projects' AND policyname='portfolio_owner_insert'
  ) THEN
    EXECUTE $$
      CREATE POLICY portfolio_owner_insert
      ON public.portfolio_projects
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid()); -- ajuste a coluna do dono
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_projects' AND policyname='portfolio_owner_update'
  ) THEN
    EXECUTE $$
      CREATE POLICY portfolio_owner_update
      ON public.portfolio_projects
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid()); -- ajuste a coluna do dono
    $$;
  END IF;
END$$;
*/

-- 3) Views: convert to security invoker (Postgres 15+)
-- If ALTER VIEW fails (older PG), recreate the view with WITH (security_invoker = true)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER VIEW public.active_bans_view SET (security_invoker = true)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not set security_invoker for active_bans_view. Recreate the view with WITH (security_invoker=true).';
  END;

  BEGIN
    EXECUTE 'ALTER VIEW public.profile_view_statistics SET (security_invoker = true)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not set security_invoker for profile_view_statistics. Recreate the view with WITH (security_invoker=true).';
  END;
END$$;

COMMIT;

-- ============================================================================
-- Verification (optional)
-- SELECT relname, relrowsecurity FROM pg_class 
-- WHERE relname IN (
--   'classified_ads','conversation_participants','user_recommendations',
--   'conversations','messages','notification_templates','notification_logs',
--   'appointments','reviews','portfolio_projects'
-- );
-- ============================================================================

-- =====================================================
-- CORREÇÃO COMPLETA DOS PROBLEMAS DE SEGURANÇA RLS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Habilitar RLS nas tabelas que estão sem RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classified_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 2: CRIAR POLÍTICAS RLS PARA CONVERSAS
-- =====================================================

-- Políticas para conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
CREATE POLICY "Users can insert their own conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations" ON public.conversations
  FOR UPDATE USING (
    client_id = auth.uid() OR professional_id = auth.uid()
  );

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

DROP POLICY IF EXISTS "Users can insert their own appointments" ON public.appointments;
CREATE POLICY "Users can insert their own appointments" ON public.appointments
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
-- PARTE 10: CORRIGIR VIEWS SECURITY DEFINER
-- =====================================================

-- Remover SECURITY DEFINER das views se existir
-- (Isso deve ser feito manualmente no Supabase Dashboard)

-- =====================================================
-- PARTE 11: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar quais tabelas têm RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'conversations', 'messages', 'notification_templates', 
  'conversation_participants', 'classified_ads', 'notification_logs',
  'user_recommendations', 'appointments', 'reviews', 'portfolio_projects'
)
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
  'conversations', 'messages', 'notification_templates', 
  'conversation_participants', 'classified_ads', 'notification_logs',
  'user_recommendations', 'appointments', 'reviews', 'portfolio_projects'
)
ORDER BY tablename, policyname;

-- =====================================================
-- SISTEMA DE SEGURANÇA RLS CORRIGIDO COM SUCESSO!
-- =====================================================

