-- =============================================
-- CORRIGIR ENUM E ESTRUTURA DA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. VERIFICAR ENUMS EXISTENTES
SELECT 
  'Enums existentes:' as info,
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname LIKE '%report%' OR t.typname LIKE '%type%'
ORDER BY t.typname, e.enumsortorder;

-- 2. VERIFICAR ESTRUTURA ATUAL DA TABELA
SELECT 
  'Estrutura atual:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 3. ADICIONAR VALORES VÁLIDOS AO ENUM (se necessário)
DO $$
BEGIN
  -- Adicionar valores ao enum se não existirem
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_type') THEN
    -- Adicionar valores que podem não existir
    BEGIN
      ALTER TYPE report_type ADD VALUE IF NOT EXISTS 'user';
    EXCEPTION WHEN duplicate_object THEN
      -- Valor já existe, continuar
    END;
    
    BEGIN
      ALTER TYPE report_type ADD VALUE IF NOT EXISTS 'post';
    EXCEPTION WHEN duplicate_object THEN
      -- Valor já existe, continuar
    END;
    
    BEGIN
      ALTER TYPE report_type ADD VALUE IF NOT EXISTS 'message';
    EXCEPTION WHEN duplicate_object THEN
      -- Valor já existe, continuar
    END;
    
    BEGIN
      ALTER TYPE report_type ADD VALUE IF NOT EXISTS 'review';
    EXCEPTION WHEN duplicate_object THEN
      -- Valor já existe, continuar
    END;
    
    BEGIN
      ALTER TYPE report_type ADD VALUE IF NOT EXISTS 'other';
    EXCEPTION WHEN duplicate_object THEN
      -- Valor já existe, continuar
    END;
  END IF;
END $$;

-- 4. TESTE DE INSERÇÃO COM VALORES VÁLIDOS
INSERT INTO reports (
  report_type, 
  description, 
  status, 
  priority, 
  reporter_id
) VALUES (
  'other',  -- Usar valor válido do enum
  'Teste de sistema - verificação de estrutura',
  'pending',
  'low',
  auth.uid()
) ON CONFLICT DO NOTHING;

-- 5. VERIFICAR SE FUNCIONOU
SELECT 
  'Teste final:' as info,
  COUNT(*) as total_reports,
  MAX(created_at) as ultima_denuncia,
  report_type as ultimo_tipo
FROM reports
GROUP BY report_type
ORDER BY ultima_denuncia DESC;
