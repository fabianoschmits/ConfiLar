-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO SISTEMA DE EXPIRAÇÃO PREMIUM
-- =====================================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- Este script garante que tudo está configurado corretamente
-- =====================================================

-- =====================================================
-- 1. CRIAR/ATUALIZAR FUNÇÃO DE DESATIVAÇÃO
-- =====================================================
CREATE OR REPLACE FUNCTION deactivate_expired_premium_classifieds()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Desativar classificados premium expirados
  UPDATE classified_ads
  SET 
    is_active = false,
    is_premium = false,
    is_featured = false,
    updated_at = NOW()
  WHERE 
    is_premium = true
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < NOW()
    AND is_active = true;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  RETURN affected_count;
END;
$$;

COMMENT ON FUNCTION deactivate_expired_premium_classifieds() IS 'Desativa anúncios premium que expiraram. Deve ser executada periodicamente (recomendado: a cada hora)';

-- =====================================================
-- 2. GARANTIR QUE AS COLUNAS PREMIUM EXISTEM
-- =====================================================
DO $$ 
BEGIN
  -- is_premium
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Coluna is_premium adicionada';
  END IF;

  -- is_featured
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Coluna is_featured adicionada';
  END IF;

  -- premium_expires_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'premium_expires_at'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Coluna premium_expires_at adicionada';
  END IF;

  -- premium_points_spent
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'premium_points_spent'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN premium_points_spent INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna premium_points_spent adicionada';
  END IF;

  -- premium_highlight_color
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'premium_highlight_color'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN premium_highlight_color VARCHAR(7) DEFAULT '#FFD700';
    RAISE NOTICE 'Coluna premium_highlight_color adicionada';
  END IF;
END $$;

-- =====================================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_premium ON classified_ads(is_premium);
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_featured ON classified_ads(is_featured);
CREATE INDEX IF NOT EXISTS idx_classified_ads_premium_expires_at ON classified_ads(premium_expires_at);
CREATE INDEX IF NOT EXISTS idx_classified_ads_premium_active ON classified_ads(is_premium, is_active, premium_expires_at) 
  WHERE is_premium = true AND is_active = true;

-- =====================================================
-- 4. CONFIGURAR PG_CRON (SE DISPONÍVEL)
-- =====================================================
-- NOTA: pg_cron pode não estar disponível em todos os planos do Supabase
-- Se não funcionar, use Vercel Cron Jobs ou outra alternativa

DO $$
BEGIN
  -- Verificar se pg_cron está disponível
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Remover job existente se houver
    BEGIN
      PERFORM cron.unschedule('deactivate-expired-premium-classifieds');
      RAISE NOTICE 'Job antigo removido (se existia)';
    EXCEPTION
      WHEN OTHERS THEN
        NULL; -- Job não existe, tudo bem
    END;

    -- Criar novo job
    BEGIN
      PERFORM cron.schedule(
        'deactivate-expired-premium-classifieds',
        '59 2 * * *', -- Todos os dias às 02:59 UTC (23:59 horário de Brasília - UTC-3)
        'SELECT deactivate_expired_premium_classifieds();'
      );
      RAISE NOTICE '✅ Job pg_cron criado com sucesso!';
      RAISE NOTICE '   A função será executada automaticamente todos os dias às 23:59 (horário de Brasília)';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Erro ao criar job pg_cron: %', SQLERRM;
        RAISE NOTICE '   Você precisará executar manualmente ou usar uma alternativa externa';
    END;
  ELSE
    RAISE NOTICE '⚠️  pg_cron não está habilitado no seu projeto Supabase';
    RAISE NOTICE '   Opções:';
    RAISE NOTICE '   1. Habilitar pg_cron nas configurações do Supabase (se disponível no seu plano)';
    RAISE NOTICE '   2. Usar Vercel Cron Jobs: https://vercel.com/docs/cron-jobs';
    RAISE NOTICE '   3. Criar API route que execute a função periodicamente';
  END IF;
END $$;

-- =====================================================
-- 5. EXECUTAR FUNÇÃO MANUALMENTE PARA DESATIVAR JÁ EXPIRADOS
-- =====================================================
SELECT 
  'Executando função de desativação...' as info,
  deactivate_expired_premium_classifieds() as anuncios_desativados;

-- =====================================================
-- 6. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se a função existe
SELECT 
  'Verificação da função:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'deactivate_expired_premium_classifieds'
    ) THEN '✅ Função existe e está ativa'
    ELSE '❌ Função não encontrada'
  END as status;

-- Verificar se pg_cron está habilitado
SELECT 
  'Status do pg_cron:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN '✅ pg_cron está habilitado'
    ELSE '⚠️  pg_cron não está habilitado'
  END as status;

-- Verificar cron job (se pg_cron estiver disponível)
SELECT 
  'Status do cron job:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM cron.job 
      WHERE jobname = 'deactivate-expired-premium-classifieds'
      AND active = true
    ) THEN '✅ Cron job está configurado e ativo'
    WHEN EXISTS (
      SELECT 1 FROM cron.job 
      WHERE jobname = 'deactivate-expired-premium-classifieds'
    ) THEN '⚠️  Cron job existe mas está inativo'
    ELSE '⚠️  Cron job não encontrado'
  END as status;

-- Contar anúncios premium expirados ainda ativos
SELECT 
  'Anúncios premium expirados ainda ativos:' as info,
  COUNT(*) as total
FROM classified_ads
WHERE is_premium = true
  AND is_active = true
  AND premium_expires_at IS NOT NULL
  AND premium_expires_at < NOW();

-- Resumo de anúncios premium
SELECT 
  'Resumo de anúncios premium:' as info,
  COUNT(*) FILTER (WHERE is_premium = true AND is_active = true AND (premium_expires_at IS NULL OR premium_expires_at > NOW())) as ativos_nao_expirados,
  COUNT(*) FILTER (WHERE is_premium = true AND is_active = true AND premium_expires_at IS NOT NULL AND premium_expires_at < NOW()) as ativos_expirados,
  COUNT(*) FILTER (WHERE is_premium = true AND is_active = false) as inativos,
  COUNT(*) FILTER (WHERE is_premium = true) as total_premium
FROM classified_ads;

-- =====================================================
-- 7. TESTE MANUAL (OPCIONAL)
-- =====================================================
-- Execute esta query para testar manualmente a função:
-- SELECT deactivate_expired_premium_classifieds();

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. HORÁRIO DE EXECUÇÃO:
--    O cron está configurado para executar às 02:59 UTC todos os dias,
--    que corresponde a 23:59 (horário de Brasília - UTC-3).
--    Nota: Brasil não possui mais horário de verão desde 2019.
--
-- 2. Se pg_cron não estiver disponível, você precisa configurar
--    uma alternativa externa (Vercel Cron, GitHub Actions, etc.)
--
-- 3. Para Vercel Cron Jobs, crie um arquivo vercel.json:
--    {
--      "crons": [{
--        "path": "/api/cron/deactivate-premium-ads",
--        "schedule": "59 2 * * *"  -- 23:59 horário de Brasília (02:59 UTC)
--      }]
--    }
--
-- 4. A função verifica anúncios premium que:
--    - São premium (is_premium = true)
--    - Estão ativos (is_active = true)
--    - Têm data de expiração definida
--    - A data de expiração já passou (premium_expires_at < NOW())
--
-- 5. Quando um anúncio expira, ele é automaticamente:
--    - Marcado como inativo (is_active = false)
--    - Perde status premium (is_premium = false)
--    - Perde destaque (is_featured = false)
--    - Tem updated_at atualizado

