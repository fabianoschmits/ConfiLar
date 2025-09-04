-- Script para criar a tabela classified_ads se não existir
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classified_ads') THEN
        RAISE NOTICE 'Criando tabela classified_ads...';
        
        -- Criar tabela classified_ads
        CREATE TABLE public.classified_ads (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            user_name TEXT NOT NULL,
            user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional')),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            location_state TEXT NOT NULL,
            location_city TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            views_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

        -- Criar políticas de segurança
        CREATE POLICY "Anúncios ativos são visíveis para todos" ON public.classified_ads
            FOR SELECT USING (is_active = true);

        CREATE POLICY "Usuários autenticados podem criar anúncios" ON public.classified_ads
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Usuários podem atualizar seus próprios anúncios" ON public.classified_ads
            FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Usuários podem excluir seus próprios anúncios" ON public.classified_ads
            FOR DELETE USING (auth.uid() = user_id);

        -- Criar trigger para atualizar updated_at
        CREATE OR REPLACE FUNCTION update_classified_ads_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_classified_ads_updated_at
            BEFORE UPDATE ON public.classified_ads
            FOR EACH ROW
            EXECUTE FUNCTION update_classified_ads_updated_at();

        RAISE NOTICE 'Tabela classified_ads criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela classified_ads já existe.';
    END IF;
END $$;

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'classified_ads' 
ORDER BY ordinal_position;

-- Mostrar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'classified_ads';
