-- =============================================
-- CRIAR POSTS DE TESTE COM LOCALIZAÇÃO COMPLETA
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar usuários existentes
SELECT id, full_name, user_type 
FROM profiles 
LIMIT 5;

-- 2. Criar posts de teste com localização completa
-- São Paulo, SP
INSERT INTO feed_posts (
    professional_id,
    user_id,
    title,
    description,
    location_state,
    location_city,
    likes_count,
    comments_count,
    is_active,
    is_public,
    is_featured,
    tags,
    created_at
) VALUES 
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Serviço de Design Gráfico em São Paulo',
    'Ofereço serviços de design gráfico, criação de logos, identidade visual e materiais gráficos. Atendo em São Paulo e região metropolitana.',
    'SP',
    'São Paulo',
    0,
    0,
    true,
    true,
    false,
    ARRAY['design', 'gráfico', 'logo'],
    NOW() - INTERVAL '2 days'
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Consultoria em Marketing Digital - SP',
    'Especialista em marketing digital, SEO, Google Ads e redes sociais. Atendo empresas em São Paulo.',
    'SP',
    'São Paulo',
    0,
    0,
    true,
    true,
    false,
    ARRAY['marketing', 'digital', 'seo'],
    NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Aulas de Inglês em São Paulo',
    'Professor de inglês com experiência internacional. Aulas presenciais e online em São Paulo.',
    'SP',
    'São Paulo',
    0,
    0,
    true,
    true,
    false,
    ARRAY['inglês', 'idiomas', 'aulas'],
    NOW() - INTERVAL '3 hours'
);

-- Rio de Janeiro, RJ
INSERT INTO feed_posts (
    professional_id,
    user_id,
    title,
    description,
    location_state,
    location_city,
    likes_count,
    comments_count,
    is_active,
    is_public,
    is_featured,
    tags,
    created_at
) VALUES 
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Fotografia de Eventos no Rio',
    'Fotógrafo especializado em eventos, casamentos e ensaios. Atendo no Rio de Janeiro e região.',
    'RJ',
    'Rio de Janeiro',
    0,
    0,
    true,
    true,
    false,
    ARRAY['fotografia', 'eventos', 'casamento'],
    NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Personal Trainer - Rio de Janeiro',
    'Personal trainer certificado, especializado em musculação e funcional. Atendo em academias do Rio.',
    'RJ',
    'Rio de Janeiro',
    0,
    0,
    true,
    true,
    false,
    ARRAY['personal', 'treino', 'academia'],
    NOW() - INTERVAL '6 hours'
);

-- Belo Horizonte, MG
INSERT INTO feed_posts (
    professional_id,
    user_id,
    title,
    description,
    location_state,
    location_city,
    likes_count,
    comments_count,
    is_active,
    is_public,
    is_featured,
    tags,
    created_at
) VALUES 
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Desenvolvimento de Sites em BH',
    'Desenvolvedor web especializado em React, Node.js e WordPress. Atendo em Belo Horizonte.',
    'MG',
    'Belo Horizonte',
    0,
    0,
    true,
    true,
    false,
    ARRAY['desenvolvimento', 'web', 'react'],
    NOW() - INTERVAL '4 hours'
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Consultoria Contábil - Belo Horizonte',
    'Contador especializado em abertura de empresas, declaração de IR e consultoria fiscal.',
    'MG',
    'Belo Horizonte',
    0,
    0,
    true,
    true,
    false,
    ARRAY['contabilidade', 'fiscal', 'empresas'],
    NOW() - INTERVAL '2 hours'
);

-- Brasília, DF
INSERT INTO feed_posts (
    professional_id,
    user_id,
    title,
    description,
    location_state,
    location_city,
    likes_count,
    comments_count,
    is_active,
    is_public,
    is_featured,
    tags,
    created_at
) VALUES 
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Advocacia Trabalhista em Brasília',
    'Advogado especializado em direito trabalhista. Atendo em Brasília e região.',
    'DF',
    'Brasília',
    0,
    0,
    true,
    true,
    false,
    ARRAY['advocacia', 'trabalhista', 'direito'],
    NOW() - INTERVAL '1 hour'
);

-- 3. Verificar os posts criados
SELECT 
    id,
    title,
    location_city,
    location_state,
    created_at
FROM feed_posts 
WHERE location_city IS NOT NULL 
   AND location_state IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. Contar posts por localização
SELECT 
    location_state,
    location_city,
    COUNT(*) as total_posts
FROM feed_posts 
WHERE location_city IS NOT NULL 
   OR location_state IS NOT NULL
GROUP BY location_state, location_city
ORDER BY total_posts DESC;
