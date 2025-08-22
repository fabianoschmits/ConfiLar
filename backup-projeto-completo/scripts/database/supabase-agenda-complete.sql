-- =====================================================
-- SISTEMA DE AGENDA COMPLETO - CONFILAR V4
-- =====================================================
-- Este arquivo contém todas as tabelas, funções e políticas
-- necessárias para o sistema de agenda profissional
-- 
-- IMPORTANTE: Este script pode ser executado múltiplas vezes
-- sem causar erros de duplicação
-- =====================================================

-- 1. EXTENSÕES NECESSÁRIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS ENUM (CRIADOS APENAS SE NÃO EXISTIREM)
-- =====================================================
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'pending',
    'accepted', 
    'rejected',
    'cancelled',
    'completed',
    'no_show'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_type AS ENUM (
    'service_request',
    'consultation',
    'maintenance',
    'installation',
    'repair',
    'inspection',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'reminder',
    'confirmation',
    'cancellation',
    'reschedule',
    'completion',
    'system'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_type appointment_type NOT NULL DEFAULT 'service_request',
  service_description TEXT NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  postal_code VARCHAR(10),
  special_requirements TEXT,
  status appointment_status NOT NULL DEFAULT 'pending',
  professional_notes TEXT,
  client_notes TEXT,
  price DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 1440), -- Máximo 24h
  CONSTRAINT valid_date CHECK (requested_date >= CURRENT_DATE),
  CONSTRAINT valid_price CHECK (price IS NULL OR price >= 0)
);

-- Tabela de horários de trabalho
CREATE TABLE IF NOT EXISTS work_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  break_start_time TIME,
  break_end_time TIME,
  max_appointments INTEGER DEFAULT 10,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT valid_break_time CHECK (
    (break_start_time IS NULL AND break_end_time IS NULL) OR
    (break_start_time IS NOT NULL AND break_end_time IS NOT NULL AND break_start_time < break_end_time)
  ),
  CONSTRAINT unique_professional_date UNIQUE(professional_id, date)
);

-- Tabela de templates semanais
CREATE TABLE IF NOT EXISTS weekly_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Dom, 1=Seg, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  break_start_time TIME,
  break_end_time TIME,
  max_appointments INTEGER DEFAULT 10,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT valid_break_time CHECK (
    (break_start_time IS NULL AND break_end_time IS NULL) OR
    (break_start_time IS NOT NULL AND break_end_time IS NOT NULL AND break_start_time < break_end_time)
  ),
  CONSTRAINT unique_professional_day UNIQUE(professional_id, day_of_week)
);

-- Tabela de notificações de agendamento
CREATE TABLE IF NOT EXISTS appointment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de agendamentos
CREATE TABLE IF NOT EXISTS appointment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(requested_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_date ON appointments(professional_id, requested_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_date ON appointments(client_id, requested_date);

CREATE INDEX IF NOT EXISTS idx_work_schedules_professional_id ON work_schedules(professional_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_date ON work_schedules(date);
CREATE INDEX IF NOT EXISTS idx_work_schedules_professional_date ON work_schedules(professional_id, date);

CREATE INDEX IF NOT EXISTS idx_weekly_templates_professional_id ON weekly_templates(professional_id);
CREATE INDEX IF NOT EXISTS idx_weekly_templates_day ON weekly_templates(day_of_week);

CREATE INDEX IF NOT EXISTS idx_appointment_notifications_appointment_id ON appointment_notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_user_id ON appointment_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_scheduled_for ON appointment_notifications(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_appointment_history_appointment_id ON appointment_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_history_user_id ON appointment_history(user_id);

-- 5. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para verificar conflitos de agendamento
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
  p_professional_id UUID,
  p_requested_date DATE,
  p_requested_time TIME,
  p_duration_minutes INTEGER,
  p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_exists BOOLEAN := FALSE;
  appointment_start TIMESTAMP;
  appointment_end TIMESTAMP;
  existing_start TIMESTAMP;
  existing_end TIMESTAMP;
BEGIN
  -- Calcular horário de início e fim do novo agendamento
  appointment_start := (p_requested_date + p_requested_time);
  appointment_end := appointment_start + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Verificar se há conflito com agendamentos existentes
  SELECT EXISTS(
    SELECT 1 FROM appointments 
    WHERE professional_id = p_professional_id
      AND requested_date = p_requested_date
      AND status NOT IN ('cancelled', 'rejected')
      AND id != COALESCE(p_appointment_id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND (
        -- Verificar sobreposição de horários
        (requested_time < appointment_end::TIME AND 
         (requested_time + (duration_minutes || ' minutes')::INTERVAL) > appointment_start::TIME)
      )
  ) INTO conflict_exists;
  
  -- Verificar se o horário está dentro do horário de trabalho
  IF NOT conflict_exists THEN
    SELECT EXISTS(
      SELECT 1 FROM work_schedules 
      WHERE professional_id = p_professional_id
        AND date = p_requested_date
        AND is_available = true
        AND start_time <= p_requested_time
        AND end_time >= (p_requested_time + (p_duration_minutes || ' minutes')::INTERVAL)
    ) INTO conflict_exists;
    
    -- Se não há horário específico, verificar template semanal
    IF NOT conflict_exists THEN
      SELECT EXISTS(
        SELECT 1 FROM weekly_templates 
        WHERE professional_id = p_professional_id
          AND day_of_week = EXTRACT(DOW FROM p_requested_date)
          AND is_available = true
          AND start_time <= p_requested_time
          AND end_time >= (p_requested_time + (p_duration_minutes || ' minutes')::INTERVAL)
      ) INTO conflict_exists;
    END IF;
  END IF;
  
  RETURN conflict_exists;
END;
$$ LANGUAGE plpgsql;

-- Função para obter horários disponíveis de um profissional
CREATE OR REPLACE FUNCTION get_available_slots(
  p_professional_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  work_start TIME;
  work_end TIME;
  slot_start TIME;
  slot_end TIME;
  slot_interval INTERVAL := '30 minutes';
BEGIN
  -- Obter horário de trabalho para a data específica
  SELECT start_time, end_time INTO work_start, work_end
  FROM work_schedules 
  WHERE professional_id = p_professional_id AND date = p_date AND is_available = true;
  
  -- Se não há horário específico, usar template semanal
  IF work_start IS NULL THEN
    SELECT start_time, end_time INTO work_start, work_end
    FROM weekly_templates 
    WHERE professional_id = p_professional_id 
      AND day_of_week = EXTRACT(DOW FROM p_date)
      AND is_available = true;
  END IF;
  
  -- Se ainda não há horário, retornar vazio
  IF work_start IS NULL OR work_end IS NULL THEN
    RETURN;
  END IF;
  
  -- Gerar slots de 30 minutos
  slot_start := work_start;
  WHILE slot_start + (p_duration_minutes || ' minutes')::INTERVAL <= work_end LOOP
    slot_end := slot_start + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Verificar se o slot está disponível (sem conflitos)
    IF NOT check_appointment_conflicts(p_professional_id, p_date, slot_start, p_duration_minutes) THEN
      RETURN QUERY SELECT slot_start, slot_end, true;
    END IF;
    
    slot_start := slot_start + slot_interval;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação automática
CREATE OR REPLACE FUNCTION create_appointment_notification(
  p_appointment_id UUID,
  p_notification_type notification_type,
  p_title VARCHAR(255),
  p_message TEXT,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  professional_id UUID;
  client_id UUID;
BEGIN
  -- Obter IDs do agendamento
  SELECT professional_id, client_id INTO professional_id, client_id
  FROM appointments WHERE id = p_appointment_id;
  
  -- Criar notificação para o profissional
  INSERT INTO appointment_notifications (
    appointment_id, user_id, notification_type, title, message, scheduled_for
  ) VALUES (
    p_appointment_id, professional_id, p_notification_type, p_title, p_message, p_scheduled_for
  ) RETURNING id INTO notification_id;
  
  -- Criar notificação para o cliente
  INSERT INTO appointment_notifications (
    appointment_id, user_id, notification_type, title, message, scheduled_for
  ) VALUES (
    p_appointment_id, client_id, p_notification_type, p_title, p_message, p_scheduled_for
  );
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_schedules_updated_at
  BEFORE UPDATE ON work_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_templates_updated_at
  BEFORE UPDATE ON weekly_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar notificação automática ao aceitar agendamento
CREATE OR REPLACE FUNCTION trigger_appointment_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    PERFORM create_appointment_notification(
      NEW.id,
      'confirmation',
      'Agendamento Confirmado',
      'Seu agendamento foi confirmado pelo profissional para ' || 
      NEW.requested_date::TEXT || ' às ' || NEW.requested_time::TEXT,
      NOW() + INTERVAL '1 hour'
    );
  END IF;
  
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    PERFORM create_appointment_notification(
      NEW.id,
      'cancellation',
      'Agendamento Rejeitado',
      'Seu agendamento foi rejeitado pelo profissional. Entre em contato para mais detalhes.',
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_appointment_status_change
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW EXECUTE FUNCTION trigger_appointment_accepted();

-- Trigger para registrar histórico de mudanças
CREATE OR REPLACE FUNCTION trigger_appointment_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudanças no status
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO appointment_history (
      appointment_id, user_id, action, field_name, old_value, new_value, change_reason
    ) VALUES (
      NEW.id, 
      COALESCE(NEW.professional_id, NEW.client_id),
      'status_change',
      'status',
      OLD.status::TEXT,
      NEW.status::TEXT,
      'Mudança de status do agendamento'
    );
  END IF;
  
  -- Registrar mudanças na data
  IF OLD.requested_date IS DISTINCT FROM NEW.requested_date THEN
    INSERT INTO appointment_history (
      appointment_id, user_id, action, field_name, old_value, new_value, change_reason
    ) VALUES (
      NEW.id,
      COALESCE(NEW.professional_id, NEW.client_id),
      'date_change',
      'requested_date',
      OLD.requested_date::TEXT,
      NEW.requested_date::TEXT,
      'Data do agendamento alterada'
    );
  END IF;
  
  -- Registrar mudanças no horário
  IF OLD.requested_time IS DISTINCT FROM NEW.requested_time THEN
    INSERT INTO appointment_history (
      appointment_id, user_id, action, field_name, old_value, new_value, change_reason
    ) VALUES (
      NEW.id,
      COALESCE(NEW.professional_id, NEW.client_id),
      'time_change',
      'requested_time',
      OLD.requested_time::TEXT,
      NEW.requested_time::TEXT,
      'Horário do agendamento alterado'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_appointment_changes
  AFTER UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION trigger_appointment_history();

-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;

-- 8. POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Políticas para appointments
CREATE POLICY "Profissionais podem ver e gerenciar seus próprios agendamentos" ON appointments
  FOR ALL USING (professional_id = auth.uid());

CREATE POLICY "Clientes podem ver e criar seus próprios agendamentos" ON appointments
  FOR ALL USING (client_id = auth.uid());

CREATE POLICY "Usuários autenticados podem ver agendamentos públicos" ON appointments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para work_schedules
CREATE POLICY "Profissionais podem gerenciar seus próprios horários" ON work_schedules
  FOR ALL USING (professional_id = auth.uid());

CREATE POLICY "Usuários autenticados podem ver horários disponíveis" ON work_schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para weekly_templates
CREATE POLICY "Profissionais podem gerenciar seus próprios templates" ON weekly_templates
  FOR ALL USING (professional_id = auth.uid());

CREATE POLICY "Usuários autenticados podem ver templates disponíveis" ON weekly_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para appointment_notifications
CREATE POLICY "Usuários podem ver suas próprias notificações" ON appointment_notifications
  FOR ALL USING (user_id = auth.uid());

-- Políticas para appointment_history
CREATE POLICY "Usuários podem ver histórico de seus agendamentos" ON appointment_history
  FOR SELECT USING (
    user_id = auth.uid() OR
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE professional_id = auth.uid() OR client_id = auth.uid()
    )
  );

-- 9. DADOS INICIAIS
-- =====================================================

-- Inserir templates semanais padrão para profissionais existentes (apenas se não existirem)
INSERT INTO weekly_templates (professional_id, day_of_week, start_time, end_time, is_available, is_default)
SELECT 
  p.id,
  generate_series(1, 5) as day_of_week, -- Segunda a Sexta
  '08:00:00'::TIME as start_time,
  '18:00:00'::TIME as end_time,
  true as is_available,
  true as is_default
FROM profiles p
WHERE p.user_type = 'professional'
  AND NOT EXISTS (
    SELECT 1 FROM weekly_templates wt WHERE wt.professional_id = p.id
  )
ON CONFLICT (professional_id, day_of_week) DO NOTHING;

-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE appointments IS 'Tabela principal de agendamentos entre profissionais e clientes';
COMMENT ON TABLE work_schedules IS 'Horários de trabalho específicos por data para profissionais';
COMMENT ON TABLE weekly_templates IS 'Templates semanais reutilizáveis para horários de trabalho';
COMMENT ON TABLE appointment_notifications IS 'Notificações relacionadas a agendamentos';
COMMENT ON TABLE appointment_history IS 'Histórico de mudanças em agendamentos para auditoria';

COMMENT ON FUNCTION check_appointment_conflicts IS 'Verifica se há conflitos de horário para um novo agendamento';
COMMENT ON FUNCTION get_available_slots IS 'Retorna horários disponíveis para agendamento em uma data específica';
COMMENT ON FUNCTION create_appointment_notification IS 'Cria notificações automáticas para mudanças de status';

-- =====================================================
-- FIM DO SCRIPT DE AGENDA
-- =====================================================
-- Execute este script no seu projeto Supabase confilar-v4
-- Todas as funcionalidades de agenda estarão disponíveis
-- =====================================================
