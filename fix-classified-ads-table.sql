-- Script para verificar e corrigir a tabela classified_ads
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'classified_ads'
) as table_exists;

-- 2. Verificar a estrutura atual da tabela (se existir)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'classified_ads'
ORDER BY ordinal_position;

-- 3. Se a tabela não existir ou estiver incompleta, criar/corrigir
CREATE TABLE IF NOT EXISTS classified_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location_state TEXT NOT NULL,
  location_city TEXT,
  user_avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Adicionar colunas que podem estar faltando
DO $$ 
BEGIN
  -- Adicionar user_avatar_url se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'classified_ads' 
    AND column_name = 'user_avatar_url'
  ) THEN
    ALTER TABLE classified_ads ADD COLUMN user_avatar_url TEXT;
  END IF;

  -- Adicionar views se não existir (pode ser views_count em algumas versões)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'classified_ads' 
    AND column_name = 'views'
  ) THEN
    ALTER TABLE classified_ads ADD COLUMN views INTEGER DEFAULT 0;
  END IF;

  -- Renomear views_count para views se necessário
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'classified_ads' 
    AND column_name = 'views_count'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'classified_ads' 
    AND column_name = 'views'
  ) THEN
    ALTER TABLE classified_ads RENAME COLUMN views_count TO views;
  END IF;
END $$;

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_classified_ads_user_id ON classified_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_classified_ads_category ON classified_ads(category);
CREATE INDEX IF NOT EXISTS idx_classified_ads_location_state ON classified_ads(location_state);
CREATE INDEX IF NOT EXISTS idx_classified_ads_location_city ON classified_ads(location_city);
CREATE INDEX IF NOT EXISTS idx_classified_ads_created_at ON classified_ads(created_at);
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_active ON classified_ads(is_active);

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE classified_ads ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS
-- Política para usuários autenticados verem todos os anúncios ativos
DROP POLICY IF EXISTS "Usuários autenticados podem ver anúncios ativos" ON classified_ads;
CREATE POLICY "Usuários autenticados podem ver anúncios ativos" ON classified_ads
  FOR SELECT USING (is_active = true);

-- Política para usuários criarem seus próprios anúncios
DROP POLICY IF EXISTS "Usuários podem criar seus próprios anúncios" ON classified_ads;
CREATE POLICY "Usuários podem criar seus próprios anúncios" ON classified_ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários editarem seus próprios anúncios
DROP POLICY IF EXISTS "Usuários podem editar seus próprios anúncios" ON classified_ads;
CREATE POLICY "Usuários podem editar seus próprios anúncios" ON classified_ads
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem seus próprios anúncios
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios anúncios" ON classified_ads;
CREATE POLICY "Usuários podem deletar seus próprios anúncios" ON classified_ads
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Inserir alguns dados de teste (opcional)
INSERT INTO classified_ads (
  user_id, 
  user_name, 
  user_type, 
  title, 
  description, 
  category, 
  location_state, 
  location_city,
  is_active
) VALUES 
(
  auth.uid(),
  'João Silva',
  'professional',
  'Serviços de Pedreiro',
  'Ofereço serviços de pedreiro com 10 anos de experiência. Reformas, construções e reparos.',
  'Construção',
  'SP',
  'São Paulo',
  true
),
(
  auth.uid(),
  'Maria Santos',
  'client',
  'Preciso de Encanador',
  'Preciso de um encanador para consertar vazamento na cozinha. Urgente!',
  'Encanamento',
  'RJ',
  'Rio de Janeiro',
  true
)
ON CONFLICT DO NOTHING;

-- 9. Verificar se os dados foram inseridos
SELECT COUNT(*) as total_ads FROM classified_ads WHERE is_active = true;

