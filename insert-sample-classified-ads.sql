-- Script para inserir dados de exemplo na tabela classified_ads
-- Execute este script no Supabase SQL Editor após criar a tabela

-- Primeiro, vamos verificar se existem usuários profissionais no sistema
SELECT 
    id,
    full_name,
    user_type,
    location_state,
    location_city
FROM profiles 
WHERE user_type = 'professional' 
LIMIT 5;

-- Inserir anúncios de exemplo (substitua os user_id pelos IDs reais dos usuários)
-- Você pode executar este script várias vezes para criar mais anúncios

INSERT INTO classified_ads (
    user_id,
    user_name,
    user_type,
    title,
    description,
    category,
    location_state,
    location_city,
    is_active,
    views_count
) VALUES 
-- Anúncios de profissionais oferecendo serviços
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'João Silva',
    'professional',
    'Pedreiro Experiente - Construção e Reformas',
    'Pedreiro com 15 anos de experiência em construção civil. Especializado em alvenaria, acabamentos e pequenas reformas.',
    'Construção Civil',
    'SP',
    'São Paulo',
    true,
    0
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Maria Santos',
    'professional',
    'Diarista Confiável - Limpeza Residencial',
    'Diarista experiente oferecendo serviços de limpeza residencial. Trabalho com qualidade e pontualidade garantidas.',
    'Limpeza',
    'RJ',
    'Rio de Janeiro',
    true,
    0
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Carlos Oliveira',
    'professional',
    'Eletricista Técnico - Instalações Elétricas',
    'Eletricista técnico especializado em instalações elétricas residenciais e comerciais. Trabalho com segurança e qualidade.',
    'Elétrica',
    'MG',
    'Belo Horizonte',
    true,
    0
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Ana Costa',
    'professional',
    'Encanador Profissional - Hidráulica',
    'Encanador com experiência em reparos hidráulicos, instalação de tubulações e manutenção de sistemas de água.',
    'Hidráulica',
    'RS',
    'Porto Alegre',
    true,
    0
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'Pedro Lima',
    'professional',
    'Pintor Especializado - Pinturas Residenciais',
    'Pintor especializado em pinturas residenciais e comerciais. Trabalho com diferentes tipos de tinta e acabamentos.',
    'Pintura',
    'PR',
    'Curitiba',
    true,
    0
),
-- Anúncios de clientes procurando serviços
(
    (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1),
    'Roberto Almeida',
    'client',
    'Preciso de Pedreiro para Reforma',
    'Preciso de um pedreiro experiente para reformar meu banheiro. Trabalho pequeno, mas preciso de qualidade.',
    'Construção Civil',
    'SP',
    'São Paulo',
    true,
    0
),
(
    (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1),
    'Fernanda Rocha',
    'client',
    'Busco Diarista para Casa',
    'Preciso de uma diarista confiável para limpeza semanal da minha casa. Preferência para região centro.',
    'Limpeza',
    'RJ',
    'Rio de Janeiro',
    true,
    0
),
(
    (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1),
    'Lucas Mendes',
    'client',
    'Eletricista para Instalação',
    'Preciso de eletricista para instalar novos pontos elétricos na minha casa. Trabalho simples e rápido.',
    'Elétrica',
    'MG',
    'Belo Horizonte',
    true,
    0
),
(
    (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1),
    'Juliana Ferreira',
    'client',
    'Encanador para Vazamento',
    'Tenho um vazamento no banheiro e preciso de um encanador urgente. Problema simples de resolver.',
    'Hidráulica',
    'RS',
    'Porto Alegre',
    true,
    0
),
(
    (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1),
    'Ricardo Silva',
    'client',
    'Pintor para Apartamento',
    'Preciso de um pintor para pintar meu apartamento de 2 quartos. Preço justo e trabalho bem feito.',
    'Pintura',
    'PR',
    'Curitiba',
    true,
    0
)
ON CONFLICT DO NOTHING;

-- Verificar os anúncios inseridos
SELECT 
    ca.id,
    ca.title,
    ca.user_name,
    ca.user_type,
    ca.category,
    ca.location_city,
    ca.location_state,
    ca.created_at,
    ca.views_count
FROM classified_ads ca
WHERE ca.is_active = true
ORDER BY ca.created_at DESC;

-- Contar total de anúncios
SELECT 
    COUNT(*) as total_anuncios,
    COUNT(CASE WHEN user_type = 'professional' THEN 1 END) as anuncios_profissionais,
    COUNT(CASE WHEN user_type = 'client' THEN 1 END) as anuncios_clientes
FROM classified_ads 
WHERE is_active = true;
