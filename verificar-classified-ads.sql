-- Script para verificar dados na tabela classified_ads
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'classified_ads'
) as tabela_existe;

-- 2. Se a tabela existir, verificar quantos registros tem
SELECT COUNT(*) as total_anuncios FROM classified_ads;

-- 3. Verificar alguns registros de exemplo
SELECT 
  id,
  title,
  category,
  user_type,
  location_state,
  location_city,
  is_active,
  created_at
FROM classified_ads 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Verificar se há anúncios ativos
SELECT COUNT(*) as anuncios_ativos FROM classified_ads WHERE is_active = true;

-- 5. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'classified_ads'
ORDER BY ordinal_position;
