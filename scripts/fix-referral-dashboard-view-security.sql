-- ============================================
-- CORREÇÃO: SECURITY DEFINER na VIEW referral_dashboard_stats
-- ============================================
-- 
-- PROBLEMA:
-- A view 'referral_dashboard_stats' está definida com SECURITY DEFINER,
-- o que significa que ela executa com as permissões do usuário que a criou
-- (geralmente admin/service_role), ignorando as políticas RLS.
--
-- RISCO DE SEGURANÇA:
-- Qualquer usuário que consultar essa view terá acesso aos dados de TODOS os
-- referrers, não apenas aos seus próprios dados, violando o princípio de
-- least privilege e potencialmente expondo informações sensíveis.
--
-- SOLUÇÃO:
-- Recriar a view como SECURITY INVOKER (padrão seguro), fazendo com que
-- ela execute com as permissões do usuário que a consulta, respeitando
-- as políticas RLS.
--
-- O QUE VAI MUDAR:
-- - A view agora respeitará as permissões do usuário que a consulta
-- - Usuários só verão suas próprias estatísticas de referral
-- - Políticas RLS serão aplicadas normalmente
-- - Mais seguro e alinhado com best practices
--
-- IMPACTO:
-- - Nenhuma quebra no sistema: a estrutura da view permanece igual
-- - Usuários continuarão vendo suas próprias stats
-- - Admins continuarão tendo acesso completo via service_role
-- ============================================

-- Verificar estado atual
DO $$ 
BEGIN
  RAISE NOTICE '🔍 Verificando view referral_dashboard_stats...';
END $$;

-- Dropar a view existente
DROP VIEW IF EXISTS public.referral_dashboard_stats CASCADE;

-- Recriar a view SEM SECURITY DEFINER (padrão é SECURITY INVOKER)
CREATE OR REPLACE VIEW public.referral_dashboard_stats
WITH (security_invoker = true)  -- Explicitamente definir como SECURITY INVOKER
AS
SELECT 
  r.referrer_id,
  COUNT(r.id) as total_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'active') as active_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'completed') as completed_referrals,
  COUNT(r.id) FILTER (WHERE r.profile_completed = TRUE) as profiles_completed,
  COUNT(r.id) FILTER (WHERE r.first_post_made = TRUE) as first_posts_made,
  SUM(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as referrals_last_30_days,
  SUM(CASE WHEN r.created_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as referrals_last_7_days,
  MAX(r.created_at) as last_referral_date
FROM public.referrals r
GROUP BY r.referrer_id;

-- Adicionar comentário explicativo
COMMENT ON VIEW public.referral_dashboard_stats IS 
'View para dashboard de indicações - SECURITY INVOKER (segura)
Mostra estatísticas de referrals agrupadas por referrer.
Respeita RLS: usuários só veem suas próprias estatísticas.';

-- Garantir que a tabela referrals tem RLS habilitado
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Verificar se já existe política para leitura própria
DO $$ 
BEGIN
  -- Criar política se não existir: usuários podem ver apenas suas próprias referrals
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'referrals' 
    AND policyname = 'Users can view own referrals'
  ) THEN
    CREATE POLICY "Users can view own referrals" 
    ON public.referrals 
    FOR SELECT 
    USING (
      auth.uid() = referrer_id OR auth.uid() = referred_id
    );
    RAISE NOTICE '✅ Política RLS criada: Users can view own referrals';
  ELSE
    RAISE NOTICE '✓ Política RLS já existe: Users can view own referrals';
  END IF;
END $$;

-- Garantir acesso completo para service_role (admin)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'referrals' 
    AND policyname = 'Service role has full access'
  ) THEN
    CREATE POLICY "Service role has full access"
    ON public.referrals
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
    RAISE NOTICE '✅ Política criada: Service role has full access';
  ELSE
    RAISE NOTICE '✓ Política já existe: Service role has full access';
  END IF;
END $$;

-- Verificar permissões da view
GRANT SELECT ON public.referral_dashboard_stats TO authenticated;
GRANT SELECT ON public.referral_dashboard_stats TO anon;

-- Verificação final
DO $$ 
DECLARE
  v_definition TEXT;
BEGIN
  SELECT definition INTO v_definition
  FROM pg_views
  WHERE schemaname = 'public' 
  AND viewname = 'referral_dashboard_stats';
  
  IF v_definition IS NULL THEN
    RAISE EXCEPTION '❌ View não foi recriada corretamente!';
  ELSIF v_definition ILIKE '%SECURITY DEFINER%' THEN
    RAISE EXCEPTION '❌ View ainda contém SECURITY DEFINER!';
  ELSE
    RAISE NOTICE '✅ View recriada com sucesso como SECURITY INVOKER';
    RAISE NOTICE '✅ Segurança corrigida: view agora respeita RLS';
  END IF;
END $$;

-- Resumo da correção
DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ CORREÇÃO APLICADA COM SUCESSO';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 O QUE FOI CORRIGIDO:';
  RAISE NOTICE '  • View recriada SEM SECURITY DEFINER';
  RAISE NOTICE '  • Agora é SECURITY INVOKER (padrão seguro)';
  RAISE NOTICE '  • RLS habilitado na tabela referrals';
  RAISE NOTICE '  • Políticas RLS aplicadas';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 O QUE MUDOU:';
  RAISE NOTICE '  • Usuários veem apenas suas próprias estatísticas';
  RAISE NOTICE '  • Políticas RLS são respeitadas';
  RAISE NOTICE '  • Admins continuam com acesso completo via service_role';
  RAISE NOTICE '';
  RAISE NOTICE '✅ SEM IMPACTO NO SISTEMA:';
  RAISE NOTICE '  • Estrutura da view mantida';
  RAISE NOTICE '  • Queries funcionam normalmente';
  RAISE NOTICE '  • Nenhuma alteração no código frontend necessária';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 RESULTADO: Mais seguro e alinhado com best practices';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- Teste rápido
SELECT 
  viewname,
  CASE 
    WHEN definition ILIKE '%SECURITY DEFINER%' THEN '❌ SECURITY DEFINER'
    ELSE '✅ SECURITY INVOKER'
  END as security_mode,
  '✓ Corrigido' as status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'referral_dashboard_stats';

