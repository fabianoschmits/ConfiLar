-- =====================================================
-- DELETAR ANÚNCIOS PREMIUM DE TESTE
-- =====================================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- ATENÇÃO: Execute primeiro a PARTE 1 para ver o que será deletado
-- =====================================================

-- =====================================================
-- PARTE 1: VERIFICAR ANÚNCIOS PREMIUM EXISTENTES
-- Execute esta parte PRIMEIRO para ver o que será deletado
-- =====================================================

-- Ver todos os anúncios premium
SELECT 
  'ANÚNCIOS PREMIUM EXISTENTES:' as info,
  id,
  title,
  user_name,
  is_premium,
  is_featured,
  premium_points_spent,
  created_at,
  ROUND(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600, 2) as horas_atras,
  CASE 
    WHEN created_at > NOW() - INTERVAL '1 hour' THEN 'Menos de 1 hora'
    WHEN created_at > NOW() - INTERVAL '24 hours' THEN 'Últimas 24 horas'
    WHEN created_at > NOW() - INTERVAL '7 days' THEN 'Última semana'
    ELSE 'Mais antigo'
  END as periodo
FROM classified_ads
WHERE is_premium = true
ORDER BY created_at DESC;

-- Contar total de anúncios premium
SELECT 
  'TOTAL DE ANÚNCIOS PREMIUM:' as info,
  COUNT(*) as total
FROM classified_ads
WHERE is_premium = true;

-- =====================================================
-- PARTE 2: DELETAR ANÚNCIOS PREMIUM
-- ATENÇÃO: Execute apenas depois de verificar a PARTE 1
-- =====================================================

-- Opção 1: Deletar anúncios premium criados nas últimas 24 horas
-- DELETE FROM classified_ads
-- WHERE is_premium = true
--   AND created_at > NOW() - INTERVAL '24 hours';

-- Opção 2: Deletar TODOS os anúncios premium
-- DELETE FROM classified_ads 
-- WHERE is_premium = true;

-- Opção 3: Deletar anúncios premium criados nas últimas 2 horas (mais conservador)
-- DELETE FROM classified_ads
-- WHERE is_premium = true
--   AND created_at > NOW() - INTERVAL '2 hours';

-- =====================================================
-- PARTE 3: VERIFICAR RESULTADO APÓS DELETAR
-- =====================================================

-- Verificar quantos anúncios premium restam
-- SELECT 
--   'ANÚNCIOS PREMIUM RESTANTES:' as info,
--   COUNT(*) as total
-- FROM classified_ads
-- WHERE is_premium = true;

