-- =============================================
-- SCRIPT PARA TESTAR INSERÇÃO DE DENÚNCIAS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Limpar denúncias existentes (se necessário)
-- DELETE FROM reports;

-- 2. Inserir denúncia de teste para classificados
INSERT INTO reports (
    report_type,
    reason,
    description,
    priority,
    reporter_id,
    reported_classified_id,
    status,
    created_at
) VALUES (
    'classified',
    'Anúncio falso ou enganoso',
    'Este anúncio contém informações falsas sobre o serviço oferecido',
    'high',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM classified_ads LIMIT 1),
    'pending',
    NOW()
);

-- 3. Inserir denúncia de teste para posts
INSERT INTO reports (
    report_type,
    reason,
    description,
    priority,
    reporter_id,
    reported_post_id,
    status,
    created_at
) VALUES (
    'post',
    'Conteúdo inapropriado',
    'Este post contém conteúdo ofensivo e inadequado',
    'medium',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM feed_posts LIMIT 1),
    'pending',
    NOW() - INTERVAL '1 hour'
);

-- 4. Inserir denúncia de teste para usuário
INSERT INTO reports (
    report_type,
    reason,
    description,
    priority,
    reporter_id,
    reported_user_id,
    status,
    created_at
) VALUES (
    'user',
    'Comportamento inadequado',
    'Usuário está enviando mensagens ofensivas',
    'urgent',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1 OFFSET 1),
    'pending',
    NOW() - INTERVAL '2 hours'
);

-- 5. Verificar se as denúncias foram inseridas
DO $$
DECLARE
    report_count integer;
BEGIN
    SELECT COUNT(*) INTO report_count FROM reports;
    RAISE NOTICE 'Total de denúncias após inserção: %', report_count;
    
    IF report_count > 0 THEN
        RAISE NOTICE '=== DENÚNCIAS INSERIDAS ===';
        FOR i IN 1..report_count LOOP
            RAISE NOTICE 'Denúncia %: Tipo=%, Status=%, Prioridade=%, Descrição=%', 
                i,
                (SELECT report_type FROM reports ORDER BY created_at DESC LIMIT 1 OFFSET i-1),
                (SELECT status FROM reports ORDER BY created_at DESC LIMIT 1 OFFSET i-1),
                (SELECT priority FROM reports ORDER BY created_at DESC LIMIT 1 OFFSET i-1),
                (SELECT LEFT(description, 50) FROM reports ORDER BY created_at DESC LIMIT 1 OFFSET i-1);
        END LOOP;
    ELSE
        RAISE NOTICE 'Nenhuma denúncia foi inserida';
    END IF;
END $$;
