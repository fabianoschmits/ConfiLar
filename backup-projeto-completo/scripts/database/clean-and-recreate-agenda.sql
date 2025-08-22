-- =====================================================
-- LIMPEZA COMPLETA E RECRIAÇÃO DO SISTEMA DE AGENDA
-- =====================================================
-- Este script remove tudo e recria do zero para evitar conflitos
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "Profissionais podem ver e gerenciar seus próprios agendamentos" ON appointments;
DROP POLICY IF EXISTS "Clientes podem ver e criar seus próprios agendamentos" ON appointments;
DROP POLICY IF EXISTS "Usuários autenticados podem ver agendamentos públicos" ON appointments;

DROP POLICY IF EXISTS "Profissionais podem gerenciar seus próprios horários" ON work_schedules;
DROP POLICY IF EXISTS "Usuários autenticados podem ver horários disponíveis" ON work_schedules;

DROP POLICY IF EXISTS "Profissionais podem gerenciar seus próprios templates" ON weekly_templates;
DROP POLICY IF EXISTS "Usuários autenticados podem ver templates disponíveis" ON weekly_templates;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON appointment_notifications;
DROP POLICY IF EXISTS "Usuários podem ver histórico de seus agendamentos" ON appointment_history;

-- 2. REMOVER TODOS OS TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_work_schedules_updated_at ON work_schedules;
DROP TRIGGER IF EXISTS update_weekly_templates_updated_at ON weekly_templates;
DROP TRIGGER IF EXISTS trigger_appointment_status_change ON appointments;
DROP TRIGGER IF EXISTS trigger_appointment_changes ON appointments;

-- 3. REMOVER TODAS AS FUNÇÕES
-- =====================================================
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_appointment_conflicts(UUID, DATE, TIME, INTEGER, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_available_slots(UUID, DATE, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS create_appointment_notification(UUID, VARCHAR, VARCHAR, TEXT, TIMESTAMP WITH TIME ZONE) CASCADE;
DROP FUNCTION IF EXISTS trigger_appointment_accepted() CASCADE;
DROP FUNCTION IF EXISTS trigger_appointment_history() CASCADE;

-- 4. REMOVER TODAS AS TABELAS (EM ORDEM CORRETA)
-- =====================================================
DROP TABLE IF EXISTS appointment_history CASCADE;
DROP TABLE IF EXISTS appointment_notifications CASCADE;
DROP TABLE IF EXISTS work_schedules CASCADE;
DROP TABLE IF EXISTS weekly_templates CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- 5. REMOVER TIPOS ENUM
-- =====================================================
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS appointment_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- 6. VERIFICAR LIMPEZA
-- =====================================================
-- Verificar se todas as tabelas foram removidas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'appointments',
    'work_schedules', 
    'weekly_templates',
    'appointment_notifications',
    'appointment_history'
  );

-- Verificar se todas as funções foram removidas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'update_updated_at_column',
    'check_appointment_conflicts',
    'get_available_slots',
    'create_appointment_notification',
    'trigger_appointment_accepted',
    'trigger_appointment_history'
  );

-- =====================================================
-- LIMPEZA CONCLUÍDA!
-- =====================================================
-- Agora execute o supabase-agenda-complete.sql para recriar tudo
-- =====================================================




