-- =============================================
-- CORRIGIR VIEW ACTIVE_BANS_VIEW
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Remover view existente
DROP VIEW IF EXISTS active_bans_view;

-- 2. Criar nova view com estrutura correta
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

-- 3. Verificar se a view foi criada
SELECT 'View active_bans_view criada com sucesso!' as status;
