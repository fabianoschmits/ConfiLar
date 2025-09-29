-- =============================================
-- SISTEMA DE BANIMENTOS COMPLETO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Criar tabela de banimentos
CREATE TABLE IF NOT EXISTS user_bans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    ban_type VARCHAR(20) NOT NULL CHECK (ban_type IN ('temporary', 'permanent', 'pending')),
    duration_days INTEGER, -- NULL para banimentos permanentes
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL para banimentos permanentes
    is_active BOOLEAN NOT NULL DEFAULT true,
    admin_notes TEXT,
    related_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_banned_by ON user_bans(banned_by);
CREATE INDEX IF NOT EXISTS idx_user_bans_is_active ON user_bans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_bans_expires_at ON user_bans(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_bans_ban_type ON user_bans(ban_type);
CREATE INDEX IF NOT EXISTS idx_user_bans_created_at ON user_bans(created_at);

-- 3. Habilitar RLS
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
-- Admins podem ver todos os banimentos
CREATE POLICY "Admins can view all bans" ON user_bans
    FOR ALL USING (true);

-- Usuários podem ver apenas seus próprios banimentos
CREATE POLICY "Users can view their own bans" ON user_bans
    FOR SELECT USING (auth.uid() = user_id);

-- 5. Criar função para verificar se usuário está banido
CREATE OR REPLACE FUNCTION is_user_banned(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_bans 
        WHERE user_id = user_uuid 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar função para obter informações do banimento
CREATE OR REPLACE FUNCTION get_user_ban_info(user_uuid UUID)
RETURNS TABLE (
    ban_id UUID,
    reason TEXT,
    ban_type VARCHAR(20),
    expires_at TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER,
    admin_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ub.id,
        ub.reason,
        ub.ban_type,
        ub.expires_at,
        CASE 
            WHEN ub.expires_at IS NULL THEN NULL
            ELSE EXTRACT(DAYS FROM (ub.expires_at - NOW()))::INTEGER
        END as days_remaining,
        ub.admin_notes
    FROM user_bans ub
    WHERE ub.user_id = user_uuid 
    AND ub.is_active = true 
    AND (ub.expires_at IS NULL OR ub.expires_at > NOW())
    ORDER BY ub.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar função para banir usuário
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

-- 7.1. Criar função para criar banimento pendente quando denúncia for revisada
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

-- 8. Criar função para desbanir usuário
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

-- 8.1. Criar função para aprovar banimento pendente
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

-- 8.2. Criar função para rejeitar banimento pendente
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

-- 9. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_ban_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ban_updated_at
    BEFORE UPDATE ON user_bans
    FOR EACH ROW
    EXECUTE FUNCTION update_ban_updated_at();

-- 10. Criar view para banimentos ativos com informações do usuário
CREATE OR REPLACE VIEW active_bans_view AS
SELECT 
    ub.id,
    ub.user_id,
    ub.banned_by,
    ub.reason,
    ub.ban_type,
    ub.duration_days,
    ub.expires_at,
    ub.admin_notes,
    ub.related_report_id,
    ub.created_at,
    ub.updated_at,
    -- Informações do usuário banido
    p_banned.full_name as banned_user_name,
    p_banned.email as banned_user_email,
    p_banned.user_type as banned_user_type,
    -- Informações do admin que baniu
    p_admin.full_name as banned_by_name,
    p_admin.email as banned_by_email,
    -- Informações da denúncia relacionada
    r.report_type,
    r.description as report_description,
    -- Status do banimento
    CASE 
        WHEN ub.ban_type = 'pending' THEN 'Pendente'
        WHEN ub.expires_at IS NULL THEN 'Permanente'
        WHEN ub.expires_at > NOW() THEN 'Ativo'
        ELSE 'Expirado'
    END as ban_status,
    -- Dias restantes
    CASE 
        WHEN ub.expires_at IS NULL THEN NULL
        ELSE EXTRACT(DAYS FROM (ub.expires_at - NOW()))::INTEGER
    END as days_remaining
FROM user_bans ub
LEFT JOIN profiles p_banned ON ub.user_id = p_banned.id
LEFT JOIN profiles p_admin ON ub.banned_by = p_admin.id
LEFT JOIN reports r ON ub.related_report_id = r.id
WHERE ub.is_active = true;

-- 11. Verificar se as tabelas foram criadas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_bans') THEN
        RAISE NOTICE 'Tabela user_bans criada com sucesso!';
    ELSE
        RAISE NOTICE 'Erro ao criar tabela user_bans';
    END IF;
END $$;
