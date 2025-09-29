-- =============================================
-- CONFIGURAÇÃO RÁPIDA DO SISTEMA DE BANIMENTOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Criar tabela de banimentos
CREATE TABLE IF NOT EXISTS user_bans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    ban_type VARCHAR(20) NOT NULL CHECK (ban_type IN ('temporary', 'permanent', 'pending')),
    duration_days INTEGER,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    admin_notes TEXT,
    related_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_banned_by ON user_bans(banned_by);
CREATE INDEX IF NOT EXISTS idx_user_bans_is_active ON user_bans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_bans_ban_type ON user_bans(ban_type);

-- 3. Habilitar RLS
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
DROP POLICY IF EXISTS "Admins can view all bans" ON user_bans;
DROP POLICY IF EXISTS "Users can view their own bans" ON user_bans;

CREATE POLICY "Admins can view all bans" ON user_bans
    FOR ALL USING (true);

CREATE POLICY "Users can view their own bans" ON user_bans
    FOR SELECT USING (auth.uid() = user_id);

-- 5. Função para criar banimento pendente
CREATE OR REPLACE FUNCTION create_pending_ban_from_report(report_id UUID)
RETURNS UUID AS $$
DECLARE
    ban_id UUID;
    report_data RECORD;
BEGIN
    -- Buscar dados da denúncia
    SELECT 
        r.reported_user_id,
        r.reason,
        r.description,
        r.id as report_id
    INTO report_data
    FROM reports r
    WHERE r.id = report_id 
    AND r.reported_user_id IS NOT NULL
    AND r.status = 'reviewing';

    -- Se não encontrou denúncia ou não tem usuário reportado, retornar NULL
    IF NOT FOUND OR report_data.reported_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Criar banimento pendente
    INSERT INTO user_bans (
        user_id,
        banned_by,
        reason,
        ban_type,
        admin_notes,
        related_report_id,
        is_active
    ) VALUES (
        report_data.reported_user_id,
        auth.uid(),
        'Pendente de revisão - ' || report_data.reason,
        'pending',
        'Banimento criado automaticamente após revisão da denúncia: ' || report_data.description,
        report_data.report_id,
        false -- Não ativo até ser aprovado
    ) RETURNING id INTO ban_id;

    RETURN ban_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para aprovar banimento pendente
CREATE OR REPLACE FUNCTION approve_pending_ban(
    ban_id UUID,
    final_ban_type VARCHAR(20),
    duration_days INTEGER DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    expires_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calcular data de expiração se for banimento temporário
    IF final_ban_type = 'temporary' AND duration_days IS NOT NULL THEN
        expires_date := NOW() + (duration_days || ' days')::INTERVAL;
    ELSE
        expires_date := NULL;
    END IF;

    -- Atualizar banimento pendente para ativo
    UPDATE user_bans 
    SET 
        ban_type = final_ban_type,
        duration_days = duration_days,
        expires_at = expires_date,
        is_active = true,
        admin_notes = COALESCE(admin_notes, admin_notes) || ' | Aprovado em: ' || NOW(),
        updated_at = NOW()
    WHERE id = ban_id 
    AND ban_type = 'pending'
    AND is_active = false;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para rejeitar banimento pendente
CREATE OR REPLACE FUNCTION reject_pending_ban(
    ban_id UUID,
    admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Marcar banimento como rejeitado (não ativo)
    UPDATE user_bans 
    SET 
        is_active = false,
        admin_notes = COALESCE(admin_notes, admin_notes) || ' | Rejeitado em: ' || NOW(),
        updated_at = NOW()
    WHERE id = ban_id 
    AND ban_type = 'pending';

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para banir usuário
CREATE OR REPLACE FUNCTION ban_user(
    target_user_id UUID,
    ban_reason TEXT,
    ban_type VARCHAR(20),
    duration_days INTEGER DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL,
    related_report_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    ban_id UUID;
    expires_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calcular data de expiração se for banimento temporário
    IF ban_type = 'temporary' AND duration_days IS NOT NULL THEN
        expires_date := NOW() + (duration_days || ' days')::INTERVAL;
    ELSE
        expires_date := NULL;
    END IF;

    -- Inserir banimento
    INSERT INTO user_bans (
        user_id,
        banned_by,
        reason,
        ban_type,
        duration_days,
        expires_at,
        admin_notes,
        related_report_id
    ) VALUES (
        target_user_id,
        auth.uid(),
        ban_reason,
        ban_type,
        duration_days,
        expires_date,
        admin_notes,
        related_report_id
    ) RETURNING id INTO ban_id;

    RETURN ban_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para desbanir usuário
CREATE OR REPLACE FUNCTION unban_user(target_user_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_bans 
    SET 
        is_active = false,
        admin_notes = COALESCE(admin_notes, admin_notes),
        updated_at = NOW()
    WHERE user_id = target_user_id 
    AND is_active = true;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Verificar se tudo foi criado
SELECT 'Sistema de banimentos configurado com sucesso!' as status;
