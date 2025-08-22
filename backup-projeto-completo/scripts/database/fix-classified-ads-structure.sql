-- Script para corrigir a estrutura da tabela classified_ads
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'classified_ads'
);

-- 2. Verificar a estrutura atual da tabela (se existir)
\d classified_ads;

-- 3. Se a tabela não existir, criar com a estrutura correta
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0
);

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_classified_ads_user_id ON classified_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_classified_ads_category ON classified_ads(category);
CREATE INDEX IF NOT EXISTS idx_classified_ads_location_state ON classified_ads(location_state);
CREATE INDEX IF NOT EXISTS idx_classified_ads_location_city ON classified_ads(location_city);
CREATE INDEX IF NOT EXISTS idx_classified_ads_created_at ON classified_ads(created_at);
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_active ON classified_ads(is_active);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE classified_ads ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
-- Política para usuários autenticados verem todos os anúncios ativos
CREATE POLICY "Usuários autenticados podem ver anúncios ativos" ON classified_ads
  FOR SELECT USING (is_active = true);

-- Política para usuários criarem seus próprios anúncios
CREATE POLICY "Usuários podem criar seus próprios anúncios" ON classified_ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários editarem seus próprios anúncios
CREATE POLICY "Usuários podem editar seus próprios anúncios" ON classified_ads
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem seus próprios anúncios
CREATE POLICY "Usuários podem deletar seus próprios anúncios" ON classified_ads
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Verificar se a tabela foi criada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'classified_ads' 
ORDER BY ordinal_position;




