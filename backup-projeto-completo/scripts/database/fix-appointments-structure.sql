-- =====================================================
-- CORREÇÃO DA ESTRUTURA DA TABELA APPOINTMENTS
-- =====================================================
-- Este script verifica e corrige a estrutura da tabela
-- caso ela tenha sido criada incorretamente
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
-- =====================================================
-- Verificar se a tabela existe e sua estrutura
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- 2. RECRIAR TABELA SE NECESSÁRIO
-- =====================================================

-- Remover tabela existente se houver problemas
DROP TABLE IF EXISTS appointment_history CASCADE;
DROP TABLE IF EXISTS appointment_notifications CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

-- Recriar tabela appointments com estrutura correta
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_type VARCHAR(50) NOT NULL DEFAULT 'service_request',
  service_description TEXT NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  postal_code VARCHAR(10),
  special_requirements TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  professional_notes TEXT,
  client_notes TEXT,
  price DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  CONSTRAINT valid_date CHECK (requested_date >= CURRENT_DATE),
  CONSTRAINT valid_price CHECK (price IS NULL OR price >= 0)
);

-- 3. RECRIAR TABELAS DEPENDENTES
-- =====================================================

-- Tabela de notificações de agendamento
CREATE TABLE appointment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de agendamentos
CREATE TABLE appointment_history (
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

-- 4. CRIAR ÍNDICES
-- =====================================================
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_date ON appointments(requested_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_professional_date ON appointments(professional_id, requested_date);
CREATE INDEX idx_appointments_client_date ON appointments(client_id, requested_date);

CREATE INDEX idx_appointment_notifications_appointment_id ON appointment_notifications(appointment_id);
CREATE INDEX idx_appointment_notifications_user_id ON appointment_notifications(user_id);
CREATE INDEX idx_appointment_notifications_scheduled_for ON appointment_notifications(scheduled_for);

CREATE INDEX idx_appointment_history_appointment_id ON appointment_history(appointment_id);
CREATE INDEX idx_appointment_history_user_id ON appointment_history(user_id);

-- 5. HABILITAR RLS
-- =====================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS
-- =====================================================

-- Políticas para appointments
CREATE POLICY "Profissionais podem ver e gerenciar seus próprios agendamentos" ON appointments
  FOR ALL USING (professional_id = auth.uid());

CREATE POLICY "Clientes podem ver e criar seus próprios agendamentos" ON appointments
  FOR ALL USING (client_id = auth.uid());

CREATE POLICY "Usuários autenticados podem ver agendamentos públicos" ON appointments
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

-- 7. VERIFICAR ESTRUTURA FINAL
-- =====================================================
-- Confirmar que a estrutura está correta
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- =====================================================
-- FIM DO SCRIPT DE CORREÇÃO
-- =====================================================




