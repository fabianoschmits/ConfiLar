-- ==================================================================================
-- FIX RLS A PARTIR DO INVENTÁRIO ENVIADO (customizado para os seus schemas)
-- Execute no Supabase > SQL Editor. O script é idempotente e seguro.
-- ==================================================================================

BEGIN;

-- 1) Habilitar RLS nas tabelas listadas
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

-- 2) POLÍTICAS – Conversas: acesso por participação (via conversation_participants.profile_id)
-- SELECT: ver conversas onde o usuário participa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversations' AND policyname='conversations_select_if_participant'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
END$$;

-- (Opcional) INSERT/UPDATE/DELETE em conversations – normalmente restritos ou feitos via backend
-- Mantemos sem políticas adicionais para permanecer negado por padrão.

-- 3) POLÍTICAS – Messages: apenas participantes podem ler; somente o remetente pode enviar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='messages_select_if_participant'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='messages_insert_if_participant_and_sender'
  ) THEN
    EXECUTE $$
      CREATE POLICY messages_insert_if_participant_and_sender
      ON public.messages
      FOR INSERT TO authenticated
      WITH CHECK (
        NEW.sender_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.conversation_participants cp
          WHERE cp.conversation_id = NEW.conversation_id
            AND cp.profile_id = auth.uid()
        )
      );
    $$;
  END IF;
END$$;

-- 4) POLÍTICAS – Conversation Participants: cada usuário só vê/insere os seus
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversation_participants' AND policyname='cp_select_own'
  ) THEN
    EXECUTE $$
      CREATE POLICY cp_select_own
      ON public.conversation_participants
      FOR SELECT TO authenticated
      USING (profile_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='conversation_participants' AND policyname='cp_insert_own'
  ) THEN
    EXECUTE $$
      CREATE POLICY cp_insert_own
      ON public.conversation_participants
      FOR INSERT TO authenticated
      WITH CHECK (NEW.profile_id = auth.uid());
    $$;
  END IF;
END$$;

-- 5) POLÍTICAS – Classified Ads: ativos visíveis; dono gerencia seus anúncios
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='classified_ads' AND policyname='classified_ads_select_active'
  ) THEN
    EXECUTE $$
      CREATE POLICY classified_ads_select_active
      ON public.classified_ads
      FOR SELECT TO anon, authenticated
      USING (is_active = true);
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='classified_ads' AND policyname='classified_ads_insert_owner'
  ) THEN
    EXECUTE $$
      CREATE POLICY classified_ads_insert_owner
      ON public.classified_ads
      FOR INSERT TO authenticated
      WITH CHECK (NEW.user_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='classified_ads' AND policyname='classified_ads_update_owner'
  ) THEN
    EXECUTE $$
      CREATE POLICY classified_ads_update_owner
      ON public.classified_ads
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='classified_ads' AND policyname='classified_ads_delete_owner'
  ) THEN
    EXECUTE $$
      CREATE POLICY classified_ads_delete_owner
      ON public.classified_ads
      FOR DELETE TO authenticated
      USING (user_id = auth.uid());
    $$;
  END IF;
END$$;

-- 6) POLÍTICAS – Appointments: cliente ou profissional envolvidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_select_involved'
  ) THEN
    EXECUTE $$
      CREATE POLICY appointments_select_involved
      ON public.appointments
      FOR SELECT TO authenticated
      USING (client_id = auth.uid() OR professional_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_insert_involved'
  ) THEN
    EXECUTE $$
      CREATE POLICY appointments_insert_involved
      ON public.appointments
      FOR INSERT TO authenticated
      WITH CHECK (NEW.client_id = auth.uid() OR NEW.professional_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_update_involved'
  ) THEN
    EXECUTE $$
      CREATE POLICY appointments_update_involved
      ON public.appointments
      FOR UPDATE TO authenticated
      USING (client_id = auth.uid() OR professional_id = auth.uid())
      WITH CHECK (client_id = auth.uid() OR professional_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='appointments_delete_involved'
  ) THEN
    EXECUTE $$
      CREATE POLICY appointments_delete_involved
      ON public.appointments
      FOR DELETE TO authenticated
      USING (client_id = auth.uid() OR professional_id = auth.uid());
    $$;
  END IF;
END$$;

-- 7) POLÍTICAS – Portfolio Projects (owner = user_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_projects' AND policyname='portfolio_select_owner_or_public'
  ) THEN
    EXECUTE $$
      CREATE POLICY portfolio_select_owner_or_public
      ON public.portfolio_projects
      FOR SELECT TO authenticated, anon
      USING (true);
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_projects' AND policyname='portfolio_insert_owner'
  ) THEN
    EXECUTE $$
      CREATE POLICY portfolio_insert_owner
      ON public.portfolio_projects
      FOR INSERT TO authenticated
      WITH CHECK (NEW.user_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_projects' AND policyname='portfolio_update_owner'
  ) THEN
    EXECUTE $$
      CREATE POLICY portfolio_update_owner
      ON public.portfolio_projects
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='portfolio_projects' AND policyname='portfolio_delete_owner'
  ) THEN
    EXECUTE $$
      CREATE POLICY portfolio_delete_owner
      ON public.portfolio_projects
      FOR DELETE TO authenticated
      USING (user_id = auth.uid());
    $$;
  END IF;
END$$;

-- 8) POLÍTICAS – Reviews: acesso quando envolvido (reviewer ou reviewed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_select_involved'
  ) THEN
    EXECUTE $$
      CREATE POLICY reviews_select_involved
      ON public.reviews
      FOR SELECT TO authenticated, anon
      USING (true);
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_insert_reviewer'
  ) THEN
    EXECUTE $$
      CREATE POLICY reviews_insert_reviewer
      ON public.reviews
      FOR INSERT TO authenticated
      WITH CHECK (NEW.reviewer_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_update_reviewer'
  ) THEN
    EXECUTE $$
      CREATE POLICY reviews_update_reviewer
      ON public.reviews
      FOR UPDATE TO authenticated
      USING (reviewer_id = auth.uid())
      WITH CHECK (reviewer_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_delete_reviewer'
  ) THEN
    EXECUTE $$
      CREATE POLICY reviews_delete_reviewer
      ON public.reviews
      FOR DELETE TO authenticated
      USING (reviewer_id = auth.uid());
    $$;
  END IF;
END$$;

-- 9) POLÍTICAS – Notification Logs: por user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notification_logs' AND policyname='notification_logs_select_own'
  ) THEN
    EXECUTE $$
      CREATE POLICY notification_logs_select_own
      ON public.notification_logs
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
    $$;
  END IF;

  -- Inserção geralmente via backend/service key; manter fechado para clientes
END$$;

-- 10) POLÍTICAS – Notification Templates: manter fechado (sem políticas de anon/authenticated)

-- 11) POLÍTICAS – User Recommendations: somente envolvidos (recommender ou recommended)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_recommendations' AND policyname='user_recommendations_select_involved'
  ) THEN
    EXECUTE $$
      CREATE POLICY user_recommendations_select_involved
      ON public.user_recommendations
      FOR SELECT TO authenticated
      USING (recommender_id = auth.uid() OR recommended_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_recommendations' AND policyname='user_recommendations_insert_recommender'
  ) THEN
    EXECUTE $$
      CREATE POLICY user_recommendations_insert_recommender
      ON public.user_recommendations
      FOR INSERT TO authenticated
      WITH CHECK (NEW.recommender_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_recommendations' AND policyname='user_recommendations_update_recommender'
  ) THEN
    EXECUTE $$
      CREATE POLICY user_recommendations_update_recommender
      ON public.user_recommendations
      FOR UPDATE TO authenticated
      USING (recommender_id = auth.uid())
      WITH CHECK (recommender_id = auth.uid());
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_recommendations' AND policyname='user_recommendations_delete_recommender'
  ) THEN
    EXECUTE $$
      CREATE POLICY user_recommendations_delete_recommender
      ON public.user_recommendations
      FOR DELETE TO authenticated
      USING (recommender_id = auth.uid());
    $$;
  END IF;
END$$;

-- 12) Views: tentar usar security_invoker (não destrutivo)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER VIEW public.active_bans_view SET (security_invoker = true)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Não foi possível definir security_invoker para active_bans_view. Versão do PG pode não suportar.';
  END;
  BEGIN
    EXECUTE 'ALTER VIEW public.profile_view_statistics SET (security_invoker = true)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Não foi possível definir security_invoker para profile_view_statistics. Versão do PG pode não suportar.';
  END;
END$$;

COMMIT;

-- ==================================================================================
-- Verificações rápidas (opcionais)
-- SELECT relname, relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
-- WHERE n.nspname='public' AND relname IN ('appointments','classified_ads','conversation_participants','conversations','messages','notification_logs','notification_templates','portfolio_projects','reviews','user_recommendations');
-- SELECT schemaname, tablename, policyname, cmd FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;
-- ==================================================================================


