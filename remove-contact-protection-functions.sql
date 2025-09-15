-- =====================================================
-- REMOVER FUNÇÕES DE PROTEÇÃO DE CONTATOS
-- =====================================================
-- Este script remove as funções relacionadas à liberação de contatos
-- que não são mais necessárias após a simplificação do sistema
-- Data: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- =====================================================
-- 1. REMOVER FUNÇÃO are_contacts_revealed
-- =====================================================
DROP FUNCTION IF EXISTS public.are_contacts_revealed(UUID, UUID);

-- =====================================================
-- 2. REMOVER FUNÇÃO reveal_contacts
-- =====================================================
DROP FUNCTION IF EXISTS public.reveal_contacts(UUID);

-- =====================================================
-- 3. MANTER FUNÇÃO create_contact_agreement (ainda necessária)
-- =====================================================
-- A função create_contact_agreement é mantida pois ainda é usada
-- para criar propostas de acordo para avaliações

-- =====================================================
-- 4. VERIFICAÇÃO FINAL
-- =====================================================
DO $$
BEGIN
    -- Verificar se as funções foram removidas
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'are_contacts_revealed' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE '✅ Função are_contacts_revealed removida com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Função are_contacts_revealed ainda existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'reveal_contacts' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE '✅ Função reveal_contacts removida com sucesso!';
    ELSE
        RAISE NOTICE '⚠️ Função reveal_contacts ainda existe';
    END IF;

    -- Verificar se a função create_contact_agreement ainda existe
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'create_contact_agreement' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        RAISE NOTICE '✅ Função create_contact_agreement mantida (ainda necessária)';
    ELSE
        RAISE NOTICE '❌ Função create_contact_agreement não encontrada!';
    END IF;

    RAISE NOTICE '🎯 Limpeza das funções de proteção de contatos concluída!';
    RAISE NOTICE '📋 Sistema agora usa apenas acordos para avaliações';
END $$;

-- =====================================================
-- 5. COMENTÁRIOS FINAIS
-- =====================================================
-- Este script remove apenas as funções relacionadas à proteção de contatos
-- Mantém todas as outras funcionalidades do sistema de acordos
-- O sistema agora funciona de forma mais simples:
-- - Dados de contato sempre visíveis
-- - Acordos apenas para permitir avaliações
-- - Regra de 24h após acordo aceito para avaliar
