-- =====================================================
-- INSERIR DADOS DE TESTE PARA CLASSIFICADOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase após executar o script anterior

-- 1. Inserir dados de teste na tabela classified_ads
-- (Substitua os UUIDs pelos IDs reais dos usuários do seu banco)

-- Primeiro, vamos pegar alguns usuários existentes
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    category1_id UUID;
    category2_id UUID;
BEGIN
    -- Pegar IDs de usuários existentes
    SELECT id INTO user1_id FROM auth.users LIMIT 1;
    SELECT id INTO user2_id FROM auth.users OFFSET 1 LIMIT 1;
    SELECT id INTO user3_id FROM auth.users OFFSET 2 LIMIT 1;
    
    -- Pegar IDs de categorias existentes
    SELECT id INTO category1_id FROM service_categories WHERE name = 'Limpeza' LIMIT 1;
    SELECT id INTO category2_id FROM service_categories WHERE name = 'Manutenção' LIMIT 1;
    
    -- Inserir anúncios de teste
    INSERT INTO public.classified_ads (
        user_id, user_name, user_type, title, description, category, 
        location_state, location_city, is_active, views
    ) VALUES
    (user1_id, 'João Silva', 'professional', 'Limpeza Residencial', 
     'Ofereço serviços de limpeza residencial com qualidade e pontualidade', 
     'Limpeza', 'SP', 'São Paulo', true, 15),
    
    (user2_id, 'Maria Santos', 'client', 'Preciso de Faxineira', 
     'Procuro faxineira para limpeza semanal da minha casa', 
     'Limpeza', 'RJ', 'Rio de Janeiro', true, 8),
    
    (user3_id, 'Pedro Costa', 'professional', 'Manutenção Elétrica', 
     'Eletricista profissional com 10 anos de experiência', 
     'Manutenção', 'MG', 'Belo Horizonte', true, 23)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Dados de teste inseridos na tabela classified_ads';
END $$;

-- 2. Inserir dados de teste na tabela professional_services
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    category1_id UUID;
    category2_id UUID;
    category3_id UUID;
BEGIN
    -- Pegar IDs de usuários existentes
    SELECT id INTO user1_id FROM auth.users LIMIT 1;
    SELECT id INTO user2_id FROM auth.users OFFSET 1 LIMIT 1;
    
    -- Pegar IDs de categorias existentes
    SELECT id INTO category1_id FROM service_categories WHERE name = 'Limpeza' LIMIT 1;
    SELECT id INTO category2_id FROM service_categories WHERE name = 'Manutenção' LIMIT 1;
    SELECT id INTO category3_id FROM service_categories WHERE name = 'Tecnologia' LIMIT 1;
    
    -- Inserir serviços profissionais de teste
    INSERT INTO public.professional_services (
        professional_id, category_id, title, description, 
        price_min, price_max, service_type, experience_level,
        insurance_coverage, emergency_service, is_active
    ) VALUES
    (user1_id, category1_id, 'Limpeza Completa Residencial', 
     'Serviço completo de limpeza residencial incluindo cozinha, banheiros e áreas comuns', 
     80.00, 150.00, 'fixed', 'advanced', true, false, true),
    
    (user2_id, category2_id, 'Manutenção Elétrica Residencial', 
     'Instalação, manutenção e reparos em sistemas elétricos residenciais', 
     100.00, 300.00, 'hourly', 'expert', true, true, true),
    
    (user1_id, category3_id, 'Suporte Técnico em TI', 
     'Suporte técnico para computadores, notebooks e redes domésticas', 
     50.00, 120.00, 'hourly', 'intermediate', false, false, true)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Dados de teste inseridos na tabela professional_services';
END $$;

-- 3. Verificar os dados inseridos
SELECT 'classified_ads' as tabela, COUNT(*) as total FROM public.classified_ads WHERE is_active = true
UNION ALL
SELECT 'professional_services' as tabela, COUNT(*) as total FROM public.professional_services WHERE is_active = true;

-- 4. Mostrar alguns dados de exemplo
SELECT 'Anúncios:' as tipo, title, user_name, category FROM public.classified_ads WHERE is_active = true LIMIT 5;
SELECT 'Serviços:' as tipo, title, professional_id, category_id FROM public.professional_services WHERE is_active = true LIMIT 5;
