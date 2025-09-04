-- =====================================================
-- CORRIGIR PROBLEMAS DOS CLASSIFICADOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Corrigir a tabela professional_services para referenciar profiles
-- Primeiro, vamos dropar a tabela e recriar com a referência correta
DROP TABLE IF EXISTS public.professional_services CASCADE;

CREATE TABLE public.professional_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    service_type TEXT DEFAULT 'fixed' CHECK (service_type IN ('hourly', 'fixed', 'negotiable')),
    experience_level TEXT DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    insurance_coverage BOOLEAN DEFAULT false,
    emergency_service BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criar índices
CREATE INDEX idx_professional_services_professional_id ON public.professional_services(professional_id);
CREATE INDEX idx_professional_services_category_id ON public.professional_services(category_id);
CREATE INDEX idx_professional_services_is_active ON public.professional_services(is_active);
CREATE INDEX idx_professional_services_created_at ON public.professional_services(created_at);

-- 3. Habilitar RLS
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
CREATE POLICY "Serviços ativos são visíveis para todos" ON public.professional_services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Profissionais podem criar seus próprios serviços" ON public.professional_services
    FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Profissionais podem atualizar seus próprios serviços" ON public.professional_services
    FOR UPDATE USING (auth.uid() = professional_id);

CREATE POLICY "Profissionais podem excluir seus próprios serviços" ON public.professional_services
    FOR DELETE USING (auth.uid() = professional_id);

-- 5. Inserir serviços profissionais usando profiles
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    category1_id UUID;
    category2_id UUID;
    category3_id UUID;
BEGIN
    -- Pegar IDs de usuários existentes da tabela profiles
    SELECT id INTO user1_id FROM profiles LIMIT 1;
    SELECT id INTO user2_id FROM profiles OFFSET 1 LIMIT 1;
    
    -- Pegar IDs de categorias existentes
    SELECT id INTO category1_id FROM service_categories WHERE name = 'Limpeza' LIMIT 1;
    SELECT id INTO category2_id FROM service_categories WHERE name = 'Manutenção' LIMIT 1;
    SELECT id INTO category3_id FROM service_categories WHERE name = 'Tecnologia' LIMIT 1;
    
    RAISE NOTICE 'User1 ID: %, User2 ID: %', user1_id, user2_id;
    RAISE NOTICE 'Category1 ID: %, Category2 ID: %, Category3 ID: %', category1_id, category2_id, category3_id;
    
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

-- 6. Verificar resultado final
SELECT 'classified_ads' as tabela, COUNT(*) as total FROM public.classified_ads WHERE is_active = true
UNION ALL
SELECT 'professional_services' as tabela, COUNT(*) as total FROM public.professional_services WHERE is_active = true
UNION ALL
SELECT 'service_categories' as tabela, COUNT(*) as total FROM public.service_categories;

-- 7. Mostrar dados de exemplo
SELECT 'Anúncios:' as tipo, title, user_name, category FROM public.classified_ads WHERE is_active = true LIMIT 3;
SELECT 'Serviços:' as tipo, title, professional_id, category_id FROM public.professional_services WHERE is_active = true LIMIT 3;
