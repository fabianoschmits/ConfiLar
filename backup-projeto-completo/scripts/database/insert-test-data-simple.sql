-- =====================================================
-- INSERIR DADOS DE TESTE SIMPLES
-- =====================================================
-- Execute este script no SQL Editor do Supabase após executar fix-classified-tables.sql

-- 1. Pegar alguns usuários existentes e categorias
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    category1_id UUID;
    category2_id UUID;
BEGIN
    -- Pegar IDs de usuários existentes
    SELECT id INTO user1_id FROM auth.users LIMIT 1;
    SELECT id INTO user2_id FROM auth.users OFFSET 1 LIMIT 1;
    
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
     'Limpeza', 'RJ', 'Rio de Janeiro', true, 8)
    ON CONFLICT DO NOTHING;
    
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
     100.00, 300.00, 'hourly', 'expert', true, true, true)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Dados de teste inseridos com sucesso!';
END $$;

-- 2. Verificar os dados inseridos
SELECT 'classified_ads' as tabela, COUNT(*) as total FROM public.classified_ads WHERE is_active = true
UNION ALL
SELECT 'professional_services' as tabela, COUNT(*) as total FROM public.professional_services WHERE is_active = true;

-- 3. Mostrar alguns dados de exemplo
SELECT 'Anúncios:' as tipo, title, user_name, category FROM public.classified_ads WHERE is_active = true LIMIT 5;
SELECT 'Serviços:' as tipo, title, professional_id, category_id FROM public.professional_services WHERE is_active = true LIMIT 5;
