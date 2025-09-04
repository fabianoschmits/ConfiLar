-- =====================================================
-- INSERIR SERVIÇOS PROFISSIONAIS SIMPLES
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar temporariamente RLS para inserção
ALTER TABLE public.professional_services DISABLE ROW LEVEL SECURITY;

-- 2. Inserir serviços profissionais
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
    
    -- Inserir serviços profissionais
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
     50.00, 120.00, 'hourly', 'intermediate', false, false, true),
    
    (user2_id, category1_id, 'Limpeza Comercial', 
     'Serviços de limpeza para escritórios e estabelecimentos comerciais', 
     120.00, 250.00, 'fixed', 'advanced', true, false, true);
    
    RAISE NOTICE 'Serviços profissionais inseridos com sucesso!';
END $$;

-- 3. Reabilitar RLS
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- 4. Verificar resultado
SELECT 'classified_ads' as tabela, COUNT(*) as total FROM public.classified_ads WHERE is_active = true
UNION ALL
SELECT 'professional_services' as tabela, COUNT(*) as total FROM public.professional_services WHERE is_active = true
UNION ALL
SELECT 'service_categories' as tabela, COUNT(*) as total FROM public.service_categories;

-- 5. Mostrar dados de exemplo
SELECT 'Serviços inseridos:' as tipo, title, professional_id, category_id 
FROM public.professional_services 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 5;
