-- =============================================
-- CORRIGIR SISTEMA DE BANIMENTOS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela user_bans existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_bans') THEN
        -- Criar tabela user_bans
        CREATE TABLE user_bans (
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
        
        -- Criar índices
        CREATE INDEX idx_user_bans_user_id ON user_bans(user_id);
        CREATE INDEX idx_user_bans_banned_by ON user_bans(banned_by);
        CREATE INDEX idx_user_bans_is_active ON user_bans(is_active);
        CREATE INDEX idx_user_bans_ban_type ON user_bans(ban_type);
        
        -- Habilitar RLS
        ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas RLS
        CREATE POLICY "Admins can view all bans" ON user_bans
            FOR ALL USING (true);
            
        CREATE POLICY "Users can view their own bans" ON user_bans
            FOR SELECT USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Tabela user_bans criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela user_bans já existe!';
    END IF;
END $$;

-- 2. Criar função create_pending_ban_from_report
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
        RAISE NOTICE 'Denúncia não encontrada ou sem usuário reportado: %', report_id;
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

    RAISE NOTICE 'Banimento pendente criado com ID: %', ban_id;
    RETURN ban_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função approve_pending_ban
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

-- 4. Criar função reject_pending_ban
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

-- 5. Criar função ban_user
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

-- 6. Criar função unban_user
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

-- 7. Remover view existente e criar nova
DROP VIEW IF EXISTS active_bans_view;

CREATE VIEW active_bans_view AS
SELECT 
    ub.id,
    ub.user_id,
    ub.banned_by,
    ub.reason,
    ub.ban_type,
    ub.duration_days,
    ub.expires_at,
    ub.is_active,
    ub.admin_notes,
    ub.related_report_id,
    ub.created_at,
    ub.updated_at,
    
    -- Dados do usuário banido
    p.full_name as banned_user_name,
    p.email as banned_user_email,
    p.user_type as banned_user_type,
    
    -- Dados do admin que baniu
    admin_p.full_name as banned_by_name,
    admin_p.email as banned_by_email,
    
    -- Dados da denúncia relacionada
    r.report_type,
    r.description as report_description,
    
    -- Status do banimento
    CASE 
        WHEN ub.ban_type = 'pending' THEN 'Pendente'
        WHEN ub.expires_at IS NULL THEN 'Permanente'
        WHEN ub.expires_at > NOW() THEN 'Ativo'
        ELSE 'Expirado'
    END as ban_status,
    
    -- Dias restantes (apenas para banimentos temporários)
    CASE 
        WHEN ub.ban_type = 'temporary' AND ub.expires_at > NOW() 
        THEN EXTRACT(DAYS FROM (ub.expires_at - NOW()))::INTEGER
        ELSE NULL
    END as days_remaining

FROM user_bans ub
LEFT JOIN profiles p ON p.id = ub.user_id
LEFT JOIN profiles admin_p ON admin_p.id = ub.banned_by
LEFT JOIN reports r ON r.id = ub.related_report_id
WHERE ub.is_active = true;

-- 8. Verificar se tudo foi criado
SELECT 
    'Sistema de banimentos configurado com sucesso!' as status,
    COUNT(*) as total_functions
FROM information_schema.routines 
WHERE routine_name IN (
    'create_pending_ban_from_report',
    'approve_pending_ban', 
    'reject_pending_ban',
    'ban_user',
    'unban_user'
);
