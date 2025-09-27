-- Inserir dados de exemplo reais na tabela classified_ads
-- Primeiro, vamos verificar se temos usuários na tabela profiles
SELECT id, full_name, user_type FROM profiles LIMIT 5;

-- Inserir alguns anúncios de exemplo (substitua os user_id pelos IDs reais dos usuários)
INSERT INTO classified_ads (
    user_id,
    user_name,
    user_type,
    title,
    description,
    category,
    location_state,
    location_city,
    ad_type,
    is_active,
    views
) VALUES 
-- Anúncios de profissionais oferecendo serviços
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
    'João Silva',
    'professional',
    'Pedreiro Experiente - Construção e Reforma',
    'Ofereço serviços de pedreiro com mais de 10 anos de experiência. Trabalho com construção, reforma, alvenaria e acabamentos. Orçamento gratuito.',
    'Construção e Reforma',
    'SP',
    'São Paulo',
    'oferecer',
    true,
    45
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1 OFFSET 1),
    'Carlos Oliveira',
    'professional',
    'Encanador - Serviços Residenciais',
    'Encanador especializado em serviços residenciais. Desentupimento, reparos, instalações. Atendo emergências 24h.',
    'Hidráulica',
    'MG',
    'Belo Horizonte',
    'oferecer',
    true,
    67
),
(
    (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1 OFFSET 2),
    'Roberto Lima',
    'professional',
    'Jardineiro e Paisagista',
    'Serviços de jardinagem, poda, plantio e paisagismo. Crio jardins lindos e mantenho áreas verdes. Orçamento personalizado.',
    'Jardinagem',
    'PR',
    'Curitiba',
    'oferecer',
    true,
    28
),
-- Anúncios de clientes procurando serviços
(
    (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1),
    'Maria Santos',
    'client',
    'Preciso de Eletricista Urgente',
    'Preciso de um eletricista para resolver um problema na fiação da minha casa. O problema é urgente e preciso de alguém confiável.',
    'Elétrica',
    'RJ',
    'Rio de Janeiro',
    'procurar',
    true,
    23
),
(
    (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1 OFFSET 1),
    'Ana Costa',
    'client',
    'Busco Pintor para Casa Nova',
    'Acabei de comprar uma casa e preciso de um pintor experiente para pintar todos os cômodos. Orçamento flexível.',
    'Pintura',
    'RS',
    'Porto Alegre',
    'procurar',
    true,
    34
),
(
    (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1 OFFSET 2),
    'Fernanda Alves',
    'client',
    'Preciso de Limpeza Pós-Obra',
    'Terminei uma reforma e preciso de uma equipe de limpeza para deixar a casa impecável. Preferência por empresa com referências.',
    'Limpeza',
    'BA',
    'Salvador',
    'procurar',
    true,
    19
);

-- Verificar os dados inseridos
SELECT 
    id,
    user_name,
    user_type,
    title,
    category,
    location_city,
    location_state,
    ad_type,
    is_active,
    views,
    created_at
FROM classified_ads 
ORDER BY created_at DESC;
