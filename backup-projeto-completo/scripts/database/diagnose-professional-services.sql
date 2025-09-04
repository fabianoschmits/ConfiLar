-- =====================================================
-- DIAGNOSTICAR E CORRIGIR PROFESSIONAL_SERVICES
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há usuários profissionais
SELECT 'Usuários profissionais:' as info, COUNT(*) as total 
FROM auth.users 
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM profiles 
    WHERE user_type = 'professional'
);

-- 2. Verificar se há categorias disponíveis
SELECT 'Categorias disponíveis:' as info, name, id 
FROM service_categories 
ORDER BY name;

-- 3. Tentar inserir serviços profissionais manualmente
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    category1_id UUID;
    category2_id UUID;
    insert_result TEXT;
BEGIN
    -- Pegar IDs de usuários existentes (qualquer usuário)
    SELECT id INTO user1_id FROM auth.users LIMIT 1;
    SELECT id INTO user2_id FROM auth.users OFFSET 1 LIMIT 1;
    
    -- Pegar IDs de categorias existentes
    SELECT id INTO category1_id FROM service_categories WHERE name = 'Limpeza' LIMIT 1;
    SELECT id INTO category2_id FROM service_categories WHERE name = 'Manutenção' LIMIT 1;
    
    RAISE NOTICE 'User1 ID: %, User2 ID: %', user1_id, user2_id;
    RAISE NOTICE 'Category1 ID: %, Category2 ID: %', category1_id, category2_id;
    
    -- Tentar inserir serviços profissionais
    BEGIN
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
         100.00, 300.00, 'hourly', 'expert', true, true, true);
        
        insert_result := 'SUCCESS';
        RAISE NOTICE 'Serviços inseridos com sucesso!';
    EXCEPTION WHEN OTHERS THEN
        insert_result := 'ERROR: ' || SQLERRM;
        RAISE NOTICE 'Erro ao inserir serviços: %', SQLERRM;
    END;
    
    RAISE NOTICE 'Resultado da inserção: %', insert_result;
END $$;

-- 4. Verificar se os serviços foram inseridos
SELECT 'Serviços após inserção:' as info, COUNT(*) as total 
FROM public.professional_services 
WHERE is_active = true;

-- 5. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'professional_services';

-- 6. Mostrar alguns dados de exemplo
SELECT 'Anúncios:' as tipo, title, user_name, category FROM public.classified_ads WHERE is_active = true LIMIT 3;
SELECT 'Serviços:' as tipo, title, professional_id, category_id FROM public.professional_services WHERE is_active = true LIMIT 3;
