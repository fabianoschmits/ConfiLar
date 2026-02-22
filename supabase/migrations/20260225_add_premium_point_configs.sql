-- Migração: Adicionar Configurações de Pontos Premium
-- Esta migração garante que as fontes usadas pelas APIs Premium estejam cadastradas na tabela points_config.
-- O valor 0 indica que o valor é dinâmico (enviado pela API).

INSERT INTO public.points_config (action_key, points_value, daily_limit, description, is_active)
VALUES 
    -- Curtidas Premium
    ('premium_like', 0, NULL, 'Gasto com curtida premium em post', true),
    ('receive_premium_like', 0, NULL, 'Recebeu curtida premium em post', true),
    ('premium_like_story', 0, NULL, 'Gasto com curtida premium em story', true),
    ('receive_premium_like_story', 0, NULL, 'Recebeu curtida premium em story', true),
    
    -- Comentários Premium
    ('premium_comment', 0, NULL, 'Gasto com comentário premium em post', true),
    ('receive_premium_comment', 0, NULL, 'Recebeu comentário premium em post', true),
    
    -- Posts Premium
    ('premium_post', 0, NULL, 'Criação de post premium em destaque', true),
    ('premium_post_renewal', 0, NULL, 'Renovação de post premium em destaque', true),
    
    -- Classificados Premium
    ('classified_premium', 0, NULL, 'Criação de classificado premium', true),
    ('classified_premium_renewal', 0, NULL, 'Renovação de classificado premium', true)
ON CONFLICT (action_key) DO UPDATE SET 
    is_active = true,
    description = EXCLUDED.description;

-- Garantir que as restrições de add_points permitam esses novos tipos
-- (A logic de add_points já permite p_source dinâmico se points_value for 0)
