-- =====================================================
-- LIMPEZA FORÇADA E RECRIAÇÃO DO SISTEMA DE AGENDA
-- =====================================================
-- Este script verifica existência antes de limpar e recria tudo
-- =====================================================

-- 1. VERIFICAR QUAIS TABELAS EXISTEM
-- =====================================================
DO $$ 
DECLARE
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '=== VERIFICANDO TABELAS EXISTENTES ===';
    
    -- Verificar appointments
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'appointments'
    ) INTO table_exists;
    RAISE NOTICE 'appointments existe: %', table_exists;
    
    -- Verificar work_schedules
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'work_schedules'
    ) INTO table_exists;
    RAISE NOTICE 'work_schedules existe: %', table_exists;
    
    -- Verificar weekly_templates
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'weekly_templates'
    ) INTO table_exists;
    RAISE NOTICE 'weekly_templates existe: %', table_exists;
    
    -- Verificar appointment_notifications
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'appointment_notifications'
    ) INTO table_exists;
    RAISE NOTICE 'appointment_notifications existe: %', table_exists;
    
    -- Verificar appointment_history
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'appointment_history'
    ) INTO table_exists;
    RAISE NOTICE 'appointment_history existe: %', table_exists;
END $$;

-- 2. REMOVER POLÍTICAS APENAS SE AS TABELAS EXISTIREM
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '=== REMOVENDO POLÍTICAS EXISTENTES ===';
    
    -- Remover políticas de appointments se existir
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'appointments'
    ) THEN
        BEGIN
            DROP POLICY IF EXISTS "Profissionais podem ver e gerenciar seus próprios agendamentos" ON appointments;
            RAISE NOTICE 'Política de appointments removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política de appointments: %', SQLERRM;
        END;
        
        BEGIN
            DROP POLICY IF EXISTS "Clientes podem ver e criar seus próprios agendamentos" ON appointments;
            RAISE NOTICE 'Política de clientes removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política de clientes: %', SQLERRM;
        END;
        
        BEGIN
            DROP POLICY IF EXISTS "Usuários autenticados podem ver agendamentos públicos" ON appointments;
            RAISE NOTICE 'Política pública removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política pública: %', SQLERRM;
        END;
    END IF;
    
    -- Remover políticas de work_schedules se existir
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'work_schedules'
    ) THEN
        BEGIN
            DROP POLICY IF EXISTS "Profissionais podem gerenciar seus próprios horários" ON work_schedules;
            RAISE NOTICE 'Política de work_schedules removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política de work_schedules: %', SQLERRM;
        END;
        
        BEGIN
            DROP POLICY IF EXISTS "Usuários autenticados podem ver horários disponíveis" ON work_schedules;
            RAISE NOTICE 'Política de horários removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política de horários: %', SQLERRM;
        END;
    END IF;
    
    -- Remover políticas de weekly_templates se existir
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'weekly_templates'
    ) THEN
        BEGIN
            DROP POLICY IF EXISTS "Profissionais podem gerenciar seus próprios templates" ON weekly_templates;
            RAISE NOTICE 'Política de templates removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política de templates: %', SQLERRM;
        END;
        
        BEGIN
            DROP POLICY IF EXISTS "Usuários autenticados podem ver templates disponíveis" ON weekly_templates;
            RAISE NOTICE 'Política de templates públicos removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política de templates públicos: %', SQLERRM;
        END;
    END IF;
    
    -- Remover políticas de appointment_notifications se existir
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'appointment_notifications'
    ) THEN
        BEGIN
            DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON appointment_notifications;
            RAISE NOTICE 'Política de notificações removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política de notificações: %', SQLERRM;
        END;
    END IF;
    
    -- Remover políticas de appointment_history se existir
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'appointment_history'
    ) THEN
        BEGIN
            DROP POLICY IF EXISTS "Usuários podem ver histórico de seus agendamentos" ON appointment_history;
            RAISE NOTICE 'Política de histórico removida';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover política de histórico: %', SQLERRM;
        END;
    END IF;
END $$;

-- 3. REMOVER TRIGGERS SE EXISTIREM
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '=== REMOVENDO TRIGGERS ===';
    
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'appointments'
    ) THEN
        DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
        DROP TRIGGER IF EXISTS trigger_appointment_status_change ON appointments;
        DROP TRIGGER IF EXISTS trigger_appointment_changes ON appointments;
        RAISE NOTICE 'Triggers de appointments removidos';
    END IF;
    
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'work_schedules'
    ) THEN
        DROP TRIGGER IF EXISTS update_work_schedules_updated_at ON work_schedules;
        RAISE NOTICE 'Triggers de work_schedules removidos';
    END IF;
    
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'weekly_templates'
    ) THEN
        DROP TRIGGER IF EXISTS update_weekly_templates_updated_at ON weekly_templates;
        RAISE NOTICE 'Triggers de weekly_templates removidos';
    END IF;
END $$;

-- 4. REMOVER FUNÇÕES SE EXISTIREM
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '=== REMOVENDO FUNÇÕES ===';
    
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    DROP FUNCTION IF EXISTS check_appointment_conflicts(UUID, DATE, TIME, INTEGER, UUID) CASCADE;
    DROP FUNCTION IF EXISTS get_available_slots(UUID, DATE, INTEGER) CASCADE;
    DROP FUNCTION IF EXISTS create_appointment_notification(UUID, VARCHAR, VARCHAR, TEXT, TIMESTAMP WITH TIME ZONE) CASCADE;
    DROP FUNCTION IF EXISTS trigger_appointment_accepted() CASCADE;
    DROP FUNCTION IF EXISTS trigger_appointment_history() CASCADE;
    
    RAISE NOTICE 'Funções removidas';
END $$;

-- 5. REMOVER TABELAS EM ORDEM CORRETA
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '=== REMOVENDO TABELAS ===';
    
    DROP TABLE IF EXISTS appointment_history CASCADE;
    DROP TABLE IF EXISTS appointment_notifications CASCADE;
    DROP TABLE IF EXISTS work_schedules CASCADE;
    DROP TABLE IF EXISTS weekly_templates CASCADE;
    DROP TABLE IF EXISTS appointments CASCADE;
    
    RAISE NOTICE 'Tabelas removidas';
END $$;

-- 6. REMOVER TIPOS ENUM
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '=== REMOVENDO TIPOS ENUM ===';
    
    DROP TYPE IF EXISTS appointment_status CASCADE;
    DROP TYPE IF EXISTS appointment_type CASCADE;
    DROP TYPE IF EXISTS notification_type CASCADE;
    
    RAISE NOTICE 'Tipos ENUM removidos';
END $$;

-- 7. VERIFICAR LIMPEZA COMPLETA
-- =====================================================
DO $$ 
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Verificar se todas as tabelas foram removidas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN (
            'appointments',
            'work_schedules', 
            'weekly_templates',
            'appointment_notifications',
            'appointment_history'
          )
    ) THEN
        RAISE NOTICE '✅ LIMPEZA COMPLETA - Todas as tabelas foram removidas';
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO - Algumas tabelas ainda existem';
    END IF;
    
    -- Verificar se todas as funções foram removidas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
          AND routine_name IN (
            'update_updated_at_column',
            'check_appointment_conflicts',
            'get_available_slots',
            'create_appointment_notification',
            'trigger_appointment_accepted',
            'trigger_appointment_history'
          )
    ) THEN
        RAISE NOTICE '✅ LIMPEZA COMPLETA - Todas as funções foram removidas';
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO - Algumas funções ainda existem';
    END IF;
END $$;

-- =====================================================
-- LIMPEZA FORÇADA CONCLUÍDA!
-- =====================================================
-- Agora execute o supabase-agenda-complete.sql para recriar tudo
-- =====================================================




