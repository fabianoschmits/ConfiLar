-- =====================================================
-- CRIAÇÃO DA TABELA CLASSIFIED_ADS
-- =====================================================
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- Verificar se a tabela já existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'classified_ads' AND table_schema = 'public'
  ) THEN
    -- Criar tabela classified_ads
    CREATE TABLE classified_ads (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      user_name VARCHAR(255) NOT NULL,
      user_type VARCHAR(50) NOT NULL DEFAULT 'client',
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      location_state VARCHAR(2) NOT NULL,
      location_city VARCHAR(100) NOT NULL,
      ad_type VARCHAR(20) NOT NULL CHECK (ad_type IN ('oferecer', 'solicitar')),
      is_active BOOLEAN NOT NULL DEFAULT true,
      views INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Criar índices para performance
    CREATE INDEX idx_classified_ads_user_id ON classified_ads(user_id);
    CREATE INDEX idx_classified_ads_ad_type ON classified_ads(ad_type);
    CREATE INDEX idx_classified_ads_category ON classified_ads(category);
    CREATE INDEX idx_classified_ads_location ON classified_ads(location_state, location_city);
    CREATE INDEX idx_classified_ads_active ON classified_ads(is_active);
    CREATE INDEX idx_classified_ads_created_at ON classified_ads(created_at);
    
    -- Habilitar RLS (Row Level Security)
    ALTER TABLE classified_ads ENABLE ROW LEVEL SECURITY;
    
    -- Política para permitir leitura para todos os usuários autenticados
    CREATE POLICY "Permitir leitura para usuários autenticados" ON classified_ads
      FOR SELECT USING (auth.role() = 'authenticated');
    
    -- Política para permitir inserção para usuários autenticados
    CREATE POLICY "Permitir inserção para usuários autenticados" ON classified_ads
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    -- Política para permitir atualização apenas para o dono do anúncio
    CREATE POLICY "Permitir atualização para o dono" ON classified_ads
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- Política para permitir deleção apenas para o dono do anúncio
    CREATE POLICY "Permitir deleção para o dono" ON classified_ads
      FOR DELETE USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Tabela classified_ads criada com sucesso!';
  ELSE
    RAISE NOTICE 'Tabela classified_ads já existe.';
  END IF;
END $$;

-- Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'classified_ads'
ORDER BY ordinal_position;

-- Verificar se as políticas RLS estão ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'classified_ads';

-- Verificar se os índices foram criados
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'classified_ads'
ORDER BY indexname;
