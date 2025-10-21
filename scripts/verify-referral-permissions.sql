-- ============================================
-- VERIFICAR E CORRIGIR PERMISSÕES DE REFERRAL
-- ============================================

-- Verificar se as tabelas existem
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM (
  VALUES 
    ('referrals'),
    ('user_referral_stats'),
    ('referral_points_history'),
    ('referral_badges')
) AS t(table_name);

-- Verificar RLS
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Habilitado'
    ELSE '❌ RLS Desabilitado'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE '%referral%'
ORDER BY tablename;

-- Contar policies por tabela
SELECT 
  schemaname,
  tablename,
  COUNT(*) as num_policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE '%referral%'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Testar acesso simples (como usuário autenticado)
-- Esta query deve funcionar sem erro
SELECT COUNT(*) as total_stats FROM public.user_referral_stats;
SELECT COUNT(*) as total_referrals FROM public.referrals;
SELECT COUNT(*) as total_badges FROM public.referral_badges;

-- Mostrar exemplo de dados
SELECT 
  'user_referral_stats' as tabela,
  COUNT(*) as total_registros
FROM public.user_referral_stats
UNION ALL
SELECT 
  'referrals' as tabela,
  COUNT(*) as total_registros
FROM public.referrals
UNION ALL
SELECT 
  'referral_badges' as tabela,
  COUNT(*) as total_registros
FROM public.referral_badges;

-- Ver badges disponíveis
SELECT 
  code,
  name,
  tier,
  required_referrals
FROM public.referral_badges
ORDER BY required_referrals;

