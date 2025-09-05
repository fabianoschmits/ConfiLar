-- Script para criar/verificar a tabela classified_ads com Realtime habilitado
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classified_ads') THEN
        RAISE NOTICE 'Criando tabela classified_ads...';
        
        -- Criar tabela classified_ads
        CREATE TABLE public.classified_ads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            user_name TEXT NOT NULL,
            user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional')),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            location_state TEXT NOT NULL,
            location_city TEXT,
            contact_info TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_active BOOLEAN DEFAULT true,
            views_count INTEGER DEFAULT 0,
            likes_count INTEGER DEFAULT 0
        );

        -- Criar índices para melhor performance
        CREATE INDEX idx_classified_ads_user_id ON public.classified_ads(user_id);
        CREATE INDEX idx_classified_ads_category ON public.classified_ads(category);
        CREATE INDEX idx_classified_ads_location_state ON public.classified_ads(location_state);
        CREATE INDEX idx_classified_ads_location_city ON public.classified_ads(location_city);
        CREATE INDEX idx_classified_ads_is_active ON public.classified_ads(is_active);
        CREATE INDEX idx_classified_ads_created_at ON public.classified_ads(created_at);

        -- Habilitar Row Level Security
        ALTER TABLE public.classified_ads ENABLE ROW LEVEL SECURITY;

        -- Políticas RLS
        CREATE POLICY "Anúncios ativos são visíveis para todos" ON public.classified_ads
            FOR SELECT USING (is_active = true);

        CREATE POLICY "Usuários podem criar seus próprios anúncios" ON public.classified_ads
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem atualizar seus próprios anúncios" ON public.classified_ads
            FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem deletar seus próprios anúncios" ON public.classified_ads
            FOR DELETE USING (auth.uid() = user_id);

        -- Trigger para updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_classified_ads_updated_at 
            BEFORE UPDATE ON public.classified_ads 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Tabela classified_ads criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela classified_ads já existe.';
    END IF;
END $$;

-- 2. Verificar se Realtime está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'classified_ads';

-- 3. Habilitar Realtime para a tabela
ALTER PUBLICATION supabase_realtime ADD TABLE public.classified_ads;

-- 4. Verificar se Realtime foi habilitado
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'classified_ads';

-- 5. Inserir dados de teste (opcional)
INSERT INTO public.classified_ads (
    user_id,
    user_name,
    user_type,
    title,
    description,
    category,
    location_state,
    location_city,
    is_active
) VALUES 
(
    auth.uid(), -- Use o ID do usuário logado
    'Usuário Teste',
    'client',
    'Procurando pedreiro para reforma',
    'Preciso de um pedreiro experiente para reformar minha cozinha. Orçamento até R$ 5.000.',
    'construcao',
    'SP',
    'São Paulo',
    true
),
(
    auth.uid(), -- Use o ID do usuário logado
    'Profissional Teste',
    'professional',
    'Ofereço serviços de pedreiro',
    'Pedreiro com 10 anos de experiência. Reformas, construções e reparos.',
    'construcao',
    'SP',
    'São Paulo',
    true
)
ON CONFLICT DO NOTHING;

-- 6. Verificar dados inseridos
SELECT 
    id,
    title,
    user_type,
    category,
    location_state,
    location_city,
    is_active,
    created_at
FROM public.classified_ads 
ORDER BY created_at DESC;
