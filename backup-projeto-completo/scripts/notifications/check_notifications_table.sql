-- =====================================================
-- VERIFICAÇÃO DA TABELA NOTIFICATIONS
-- =====================================================

-- Verificar se a tabela existe
SELECT 
    'VERIFICAÇÃO' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'notifications';

-- Verificar estrutura se existir
DO $$
DECLARE
    col RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        RAISE NOTICE '✅ Tabela notifications existe';
        
        -- Mostrar colunas
        RAISE NOTICE '📋 Estrutura da tabela:';
        FOR col IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'notifications'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: % (nullable: %, default: %)', 
                col.column_name, 
                col.data_type, 
                col.is_nullable, 
                col.column_default;
        END LOOP;
        
        -- Contar registros
        RAISE NOTICE '📊 Total de notificações: %', (
            SELECT COUNT(*) FROM public.notifications
        );
        
        -- Contar não lidas
        RAISE NOTICE '🔔 Notificações não lidas: %', (
            SELECT COUNT(*) FROM public.notifications WHERE is_read = false
        );
        
    ELSE
        RAISE NOTICE '❌ Tabela notifications NÃO existe';
        RAISE NOTICE '📋 Execute o script fix_notifications_system.sql para criar';
    END IF;
END $$;
