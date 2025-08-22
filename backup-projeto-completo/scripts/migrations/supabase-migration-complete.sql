-- =====================================================
-- CONFILAR v4 - MIGRAÇÃO COMPLETA DO BANCO DE DADOS
-- =====================================================
-- Execute este arquivo no SQL Editor do Supabase
-- Projeto: https://nyqhzbfjgmaeyoyawkrq.supabase.co

-- =====================================================
-- 1. ESQUEMA INICIAL
-- =====================================================

-- Criação da tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar automaticamente o updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Política RLS (Row Level Security) para perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. SISTEMA COMPLETO
-- =====================================================

-- Criar tipo enum para user_type
CREATE TYPE user_type AS ENUM ('client', 'professional');

-- Adicionar colunas na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type user_type DEFAULT 'client';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Criar tabela de categorias de serviços
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de serviços profissionais
CREATE TABLE IF NOT EXISTS public.professional_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    price_type TEXT CHECK (price_type IN ('hourly', 'fixed', 'negotiable')),
    availability_schedule JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de histórico de busca
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    filters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de conversas
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de participantes das conversas
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, profile_id)
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_type user_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de posts do feed
CREATE TABLE IF NOT EXISTS public.feed_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de curtidas dos posts
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- Criar tabela de comentários dos posts
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. FUNCIONALIDADES ADICIONAIS
-- =====================================================

-- Criar tabela de listagens de serviços
CREATE TABLE IF NOT EXISTS public.service_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    price DECIMAL(10,2),
    price_type TEXT CHECK (price_type IN ('hourly', 'fixed', 'negotiable')),
    location_state TEXT,
    location_city TEXT,
    availability_schedule JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de favoritos
CREATE TABLE IF NOT EXISTS public.service_favorites (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.service_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, service_id)
);

-- =====================================================
-- 4. SISTEMA DE CLASSIFICADOS
-- =====================================================

-- Criar tabela de classificados
CREATE TABLE IF NOT EXISTS public.job_classifieds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    job_type TEXT CHECK (job_type IN ('full_time', 'part_time', 'freelance', 'temporary')),
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    location_state TEXT,
    location_city TEXT,
    requirements TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SISTEMA DE FEED SOCIAL
-- =====================================================

-- Criar tabela de hashtags
CREATE TABLE IF NOT EXISTS public.hashtags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de relacionamento posts-hashtags
CREATE TABLE IF NOT EXISTS public.post_hashtags (
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    hashtag_id UUID REFERENCES public.hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);

-- =====================================================
-- 6. SISTEMA DE IMAGENS E ARQUIVOS
-- =====================================================

-- Criar tabela de arquivos do usuário
CREATE TABLE IF NOT EXISTS public.user_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    bucket_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. SISTEMA DE COMPLETUDE DO PERFIL
-- =====================================================

-- Adicionar campos adicionais na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_experience_years INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_service BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS insurance_coverage BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selfie_document_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS residence_proof_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_verification_document TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar a função handle_new_user para salvar dados adicionais
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        user_type,
        phone,
        cpf_cnpj,
        birth_date,
        location_state,
        location_city,
        neighborhood,
        profile_completion_score,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'client')::user_type,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'cpf_cnpj',
        NEW.raw_user_meta_data->>'birth_date',
        NEW.raw_user_meta_data->>'location_state',
        NEW.raw_user_meta_data->>'location_city',
        NEW.raw_user_meta_data->>'neighborhood',
        25, -- Score inicial baseado nos dados básicos
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. POLÍTICAS RLS E ÍNDICES
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_classifieds ENABLE ROW LEVEL SECURITY;

-- Políticas básicas para visualização pública
CREATE POLICY "Public read access" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.service_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.job_classifieds FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON public.feed_posts FOR SELECT USING (true);

-- Políticas para usuários autenticados
CREATE POLICY "Users can manage own data" ON public.search_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own posts" ON public.feed_posts FOR ALL USING (auth.uid() = author_id);
CREATE POLICY "Users can manage own services" ON public.service_listings FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage own jobs" ON public.job_classifieds FOR ALL USING (auth.uid() = author_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location_state, location_city);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_author ON public.feed_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_category ON public.service_listings(category_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_location ON public.service_listings(location_state, location_city);

-- =====================================================
-- 9. DADOS INICIAIS
-- =====================================================

-- Inserir categorias de serviços básicas
INSERT INTO public.service_categories (name, description, icon) VALUES
('Limpeza', 'Serviços de limpeza residencial e comercial', '🧹'),
('Manutenção', 'Reparos e manutenção geral', '🔧'),
('Transporte', 'Serviços de transporte e entrega', '🚗'),
('Tecnologia', 'Suporte técnico e desenvolvimento', '💻'),
('Saúde', 'Serviços de saúde e bem-estar', '🏥'),
('Educação', 'Aulas particulares e tutoria', '📚'),
('Beleza', 'Serviços de beleza e estética', '💄'),
('Eventos', 'Organização e decoração de eventos', '🎉')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- MIGRAÇÃO CONCLUÍDA!
-- =====================================================

-- Verificar tabelas criadas
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('profiles', 'service_categories', 'professional_services', 'search_history', 'conversations', 'messages', 'notifications', 'reviews', 'feed_posts', 'service_listings', 'job_classifieds') 
        THEN '✅ Criada' 
        ELSE '❌ Não criada' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'service_categories', 'professional_services', 'search_history', 'conversations', 'messages', 'notifications', 'reviews', 'feed_posts', 'service_listings', 'job_classifieds')
ORDER BY table_name;









