-- =====================================================
-- ADICIONAR COLUNAS PREMIUM NA TABELA CLASSIFIED_ADS
-- =====================================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- Adicionar colunas premium se não existirem
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

  -- is_featured (para destacar no topo)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Coluna is_featured adicionada';
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

  -- images (array de strings para fotos)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN images TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Coluna images adicionada';
  END IF;

  -- price_range (faixa de preço)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'price_range'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN price_range VARCHAR(50);
    RAISE NOTICE 'Coluna price_range adicionada';
  END IF;

  -- contact_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN contact_phone VARCHAR(20);
    RAISE NOTICE 'Coluna contact_phone adicionada';
  END IF;

  -- contact_email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classified_ads' 
    AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE classified_ads 
    ADD COLUMN contact_email VARCHAR(100);
    RAISE NOTICE 'Coluna contact_email adicionada';
  END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_premium ON classified_ads(is_premium);
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_featured ON classified_ads(is_featured);
CREATE INDEX IF NOT EXISTS idx_classified_ads_premium_expires_at ON classified_ads(premium_expires_at);
CREATE INDEX IF NOT EXISTS idx_classified_ads_premium_active ON classified_ads(is_premium, is_active, premium_expires_at) 
  WHERE is_premium = true AND is_active = true;

-- Comentários nas colunas
COMMENT ON COLUMN classified_ads.is_premium IS 'Indica se o anúncio é premium';
COMMENT ON COLUMN classified_ads.is_featured IS 'Indica se o anúncio deve aparecer destacado no topo';
COMMENT ON COLUMN classified_ads.premium_points_spent IS 'Quantidade de pontos gastos para tornar o anúncio premium';
COMMENT ON COLUMN classified_ads.premium_expires_at IS 'Data e hora de expiração do status premium';
COMMENT ON COLUMN classified_ads.premium_highlight_color IS 'Cor de destaque do anúncio premium (hex)';
COMMENT ON COLUMN classified_ads.images IS 'Array de URLs das imagens do anúncio';
COMMENT ON COLUMN classified_ads.price_range IS 'Faixa de preço do serviço';
COMMENT ON COLUMN classified_ads.contact_phone IS 'Telefone de contato';
COMMENT ON COLUMN classified_ads.contact_email IS 'Email de contato';

-- =====================================================
-- FUNÇÃO PARA DESATIVAR CLASSIFICADOS PREMIUM EXPIRADOS
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

-- =====================================================
-- CONFIGURAR PG_CRON PARA EXECUTAR A CADA HORA
-- =====================================================
-- NOTA: Isso requer extensão pg_cron habilitada no Supabase
-- Execute apenas se a extensão estiver disponível

-- Verificar se pg_cron está disponível
DO $$
BEGIN
  -- Tentar criar o job (falhará silenciosamente se pg_cron não estiver disponível)
  BEGIN
    PERFORM cron.schedule(
      'deactivate-expired-premium-classifieds',
      '0 * * * *', -- A cada hora
      'SELECT deactivate_expired_premium_classifieds();'
    );
    RAISE NOTICE 'Job pg_cron criado com sucesso!';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'pg_cron não está disponível ou job já existe. Use uma alternativa externa (Vercel Cron, etc.)';
  END;
END $$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'classified_ads'
AND column_name IN ('is_premium', 'is_featured', 'premium_points_spent', 'premium_expires_at', 'premium_highlight_color', 'images', 'price_range', 'contact_phone', 'contact_email')
ORDER BY ordinal_position;





