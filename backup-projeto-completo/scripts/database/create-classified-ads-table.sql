-- =====================================================
-- EXECUTAR NO PAINEL DO SUPABASE
-- =====================================================
-- Vá em: Dashboard Supabase > SQL Editor > Execute este código

-- Criar tabela classified_ads
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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_classified_ads_user_id ON public.classified_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_classified_ads_category ON public.classified_ads(category);
CREATE INDEX IF NOT EXISTS idx_classified_ads_location_state ON public.classified_ads(location_state);
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_active ON public.classified_ads(is_active);
CREATE INDEX IF NOT EXISTS idx_classified_ads_created_at ON public.classified_ads(created_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_classified_ads_updated_at 
    BEFORE UPDATE ON public.classified_ads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.classified_ads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anúncios ativos são visíveis para todos" ON public.classified_ads
    FOR SELECT USING (is_active = true);

CREATE POLICY "Usuários autenticados podem criar anúncios" ON public.classified_ads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios anúncios" ON public.classified_ads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios anúncios" ON public.classified_ads
    FOR DELETE USING (auth.uid() = user_id);