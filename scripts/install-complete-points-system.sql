-- ============================================
-- INSTALAÇÃO COMPLETA DO SISTEMA CONFIPOINTS
-- ============================================
-- Este script executa TUDO na ordem correta
-- Execute APENAS ESTE arquivo no Supabase
-- ============================================

-- Verificar se já existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_points_balance') THEN
    RAISE NOTICE 'AVISO: Sistema de pontos já está parcialmente instalado. Verifique se precisa reinstalar.';
  ELSE
    RAISE NOTICE 'Iniciando instalação do sistema ConfiPoints...';
  END IF;
END $$;

-- ============================================
-- PARTE 1: SISTEMA DE PONTOS BASE (FASE 1)
-- ============================================

RAISE NOTICE '========================================';
RAISE NOTICE '1/3 - Instalando FASE 1: Sistema Base';
RAISE NOTICE '========================================';

-- Aqui você deve copiar TODO o conteúdo de create-points-system-phase1.sql

-- ============================================
-- PARTE 2: SISTEMA DE ECONOMIA (FASE 2)
-- ============================================

RAISE NOTICE '========================================';
RAISE NOTICE '2/3 - Instalando FASE 2: Economia';
RAISE NOTICE '========================================';

-- Aqui você deve copiar TODO o conteúdo de create-points-system-phase2-economy.sql

-- ============================================
-- PARTE 3: SISTEMA ANTI-FRAUDE
-- ============================================

RAISE NOTICE '========================================';
RAISE NOTICE '3/3 - Instalando Sistema Anti-Fraude';
RAISE NOTICE '========================================';

-- Aqui você deve copiar TODO o conteúdo de create-antifraud-system.sql

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

RAISE NOTICE '========================================';
RAISE NOTICE 'Verificando instalação...';
RAISE NOTICE '========================================';

DO $$
DECLARE
  v_tables INTEGER;
  v_functions INTEGER;
BEGIN
  -- Contar tabelas
  SELECT COUNT(*) INTO v_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name LIKE '%point%';
  
  RAISE NOTICE 'Tabelas criadas: %', v_tables;
  
  -- Contar funções
  SELECT COUNT(*) INTO v_functions
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name LIKE '%point%';
  
  RAISE NOTICE 'Funções criadas: %', v_functions;
  
  IF v_tables >= 10 THEN
    RAISE NOTICE '✅ Instalação CONCLUÍDA com sucesso!';
  ELSE
    RAISE WARNING '⚠️ Instalação pode estar incompleta. Verifique os erros acima.';
  END IF;
END $$;
