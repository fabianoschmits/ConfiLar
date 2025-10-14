-- =====================================================
-- CORREÇÃO DAS VIEWS SECURITY DEFINER
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: RECRIAR VIEWS SEM SECURITY DEFINER
-- =====================================================

-- Recriar active_bans_view sem SECURITY DEFINER
DROP VIEW IF EXISTS public.active_bans_view CASCADE;

CREATE VIEW public.active_bans_view AS
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
AND (ub.expires_at IS NULL OR ub.expires_at > NOW());

-- Recriar profile_view_statistics sem SECURITY DEFINER
DROP VIEW IF EXISTS public.profile_view_statistics CASCADE;

CREATE VIEW public.profile_view_statistics AS
SELECT 
  p.id as profile_id,
  p.full_name,
  p.user_type,
  COUNT(pv.id) as total_views,
  COUNT(pv.id) FILTER (WHERE pv.created_at >= CURRENT_DATE) as views_today,
  COUNT(pv.id) FILTER (WHERE pv.created_at >= CURRENT_DATE - INTERVAL '7 days') as views_this_week,
  COUNT(pv.id) FILTER (WHERE pv.created_at >= CURRENT_DATE - INTERVAL '30 days') as views_this_month,
  MAX(pv.created_at) as last_viewed_at
FROM profiles p
LEFT JOIN profile_views pv ON p.id = pv.profile_id
GROUP BY p.id, p.full_name, p.user_type;

-- =====================================================
-- PARTE 2: CRIAR POLÍTICAS RLS PARA AS VIEWS
-- =====================================================

-- Políticas para active_bans_view
DROP POLICY IF EXISTS "Admins can view active bans" ON public.active_bans_view;
CREATE POLICY "Admins can view active bans" ON public.active_bans_view
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Políticas para profile_view_statistics
DROP POLICY IF EXISTS "Users can view profile statistics" ON public.profile_view_statistics;
CREATE POLICY "Users can view profile statistics" ON public.profile_view_statistics
  FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- =====================================================
-- PARTE 3: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as views foram criadas corretamente
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('active_bans_view', 'profile_view_statistics');

-- Verificar se não há mais SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views 
WHERE schemaname = 'public'
AND definition LIKE '%SECURITY DEFINER%';

-- =====================================================
-- VIEWS SECURITY DEFINER CORRIGIDAS COM SUCESSO!
-- =====================================================



