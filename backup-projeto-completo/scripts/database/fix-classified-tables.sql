-- =====================================================
-- SCRIPT CORRIGIDO PARA CLASSIFICADOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela classified_ads se não existir
CREATE TABLE IF NOT EXISTS public.classified_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location_state TEXT NOT NULL,
    location_city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL
);

-- 2. Criar tabela service_categories se não existir
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '🔧',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar tabela professional_services se não existir
CREATE TABLE IF NOT EXISTS public.professional_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_classified_ads_user_id ON public.classified_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_classified_ads_category ON public.classified_ads(category);
CREATE INDEX IF NOT EXISTS idx_classified_ads_location_state ON public.classified_ads(location_state);
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_active ON public.classified_ads(is_active);
CREATE INDEX IF NOT EXISTS idx_classified_ads_created_at ON public.classified_ads(created_at);

CREATE INDEX IF NOT EXISTS idx_professional_services_professional_id ON public.professional_services(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_services_category_id ON public.professional_services(category_id);
CREATE INDEX IF NOT EXISTS idx_professional_services_is_active ON public.professional_services(is_active);
CREATE INDEX IF NOT EXISTS idx_professional_services_created_at ON public.professional_services(created_at);

-- 5. Habilitar RLS
ALTER TABLE public.classified_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para classified_ads
DROP POLICY IF EXISTS "Anúncios ativos são visíveis para todos" ON public.classified_ads;
CREATE POLICY "Anúncios ativos são visíveis para todos" ON public.classified_ads
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Usuários autenticados podem criar anúncios" ON public.classified_ads;
CREATE POLICY "Usuários autenticados podem criar anúncios" ON public.classified_ads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios anúncios" ON public.classified_ads;
CREATE POLICY "Usuários podem atualizar seus próprios anúncios" ON public.classified_ads
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus próprios anúncios" ON public.classified_ads;
CREATE POLICY "Usuários podem excluir seus próprios anúncios" ON public.classified_ads
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Criar políticas RLS para professional_services
DROP POLICY IF EXISTS "Serviços ativos são visíveis para todos" ON public.professional_services;
CREATE POLICY "Serviços ativos são visíveis para todos" ON public.professional_services
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Profissionais podem criar seus próprios serviços" ON public.professional_services;
CREATE POLICY "Profissionais podem criar seus próprios serviços" ON public.professional_services
    FOR INSERT WITH CHECK (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Profissionais podem atualizar seus próprios serviços" ON public.professional_services;
CREATE POLICY "Profissionais podem atualizar seus próprios serviços" ON public.professional_services
    FOR UPDATE USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Profissionais podem excluir seus próprios serviços" ON public.professional_services;
CREATE POLICY "Profissionais podem excluir seus próprios serviços" ON public.professional_services
    FOR DELETE USING (auth.uid() = professional_id);

-- 8. Inserir categorias padrão (apenas se não existirem)
INSERT INTO public.service_categories (name, icon, description) VALUES
('Limpeza', '🧹', 'Serviços de limpeza residencial e comercial'),
('Manutenção', '🔧', 'Manutenção e reparos em geral'),
('Tecnologia', '💻', 'Serviços de TI e tecnologia'),
('Beleza', '💄', 'Serviços de beleza e estética'),
('Saúde', '🏥', 'Serviços de saúde e bem-estar'),
('Educação', '📚', 'Aulas particulares e cursos'),
('Transporte', '🚗', 'Serviços de transporte e delivery'),
('Eventos', '🎉', 'Organização de eventos e festas'),
('Jardinagem', '🌱', 'Serviços de jardinagem e paisagismo'),
('Outros', '📋', 'Outros tipos de serviços')
ON CONFLICT (name) DO NOTHING;

-- 9. Verificar dados existentes
SELECT 'classified_ads' as tabela, COUNT(*) as total FROM public.classified_ads WHERE is_active = true
UNION ALL
SELECT 'professional_services' as tabela, COUNT(*) as total FROM public.professional_services WHERE is_active = true
UNION ALL
SELECT 'service_categories' as tabela, COUNT(*) as total FROM public.service_categories;
