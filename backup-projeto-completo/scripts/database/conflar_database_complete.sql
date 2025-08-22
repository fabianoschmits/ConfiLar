-- =====================================================
-- CONFI LAR - BANCO DE DADOS COMPLETO
-- =====================================================
-- Sistema de conexão entre profissionais e clientes
-- Versão: 1.0
-- Data: Dezembro 2024

-- =====================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =====================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensão para criptografia
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. TIPOS ENUMERADOS
-- =====================================================

-- Tipo de usuário
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('client', 'professional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de anúncio
DO $$ BEGIN
    CREATE TYPE ad_status AS ENUM ('active', 'inactive', 'pending', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de mensagem
DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipo de notificação
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'message', 'review', 'booking', 'verification',
        'achievement', 'system', 'info', 'success', 'warning', 'error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de verificação
DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. TABELAS PRINCIPAIS
-- =====================================================

-- 3.1 Perfis de usuário (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    cpf_cnpj TEXT,
    birth_date DATE,
    user_type user_type NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    location_state TEXT,
    location_city TEXT,
    neighborhood TEXT,
    address TEXT,
    bio TEXT,
    professional_services TEXT[],
    professional_experience_years INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    badge TEXT DEFAULT 'bronze',
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    profile_completion_score INTEGER DEFAULT 0,
    last_profile_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    whatsapp TEXT,
    emergency_service BOOLEAN DEFAULT false,
    insurance_coverage BOOLEAN DEFAULT false,
    weekly_availability JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 Categorias de serviços
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id UUID REFERENCES public.service_categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 Anúncios/classificados
CREATE TABLE IF NOT EXISTS public.classified_ads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.service_categories(id),
    category TEXT, -- Campo legado para compatibilidade
    location_state TEXT NOT NULL,
    location_city TEXT NOT NULL,
    neighborhood TEXT,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    price_type TEXT DEFAULT 'fixed', -- 'fixed', 'hourly', 'daily', 'negotiable'
    contact_preference TEXT DEFAULT 'both', -- 'phone', 'whatsapp', 'both'
    images TEXT[], -- Array de URLs das imagens
    status ad_status DEFAULT 'active',
    is_featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 Conversas/Mensagens
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ad_id UUID REFERENCES public.classified_ads(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_unread_count INTEGER DEFAULT 0,
    professional_unread_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Garantir que não há conversa duplicada entre mesmo cliente e profissional para o mesmo anúncio
    UNIQUE(ad_id, client_id, professional_id)
);

-- 3.5 Mensagens individuais
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file'
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    status message_status DEFAULT 'sent',
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 Avaliações e Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ad_id UUID REFERENCES public.classified_ads(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT,
    comment TEXT,
    pros TEXT[],
    cons TEXT[],
    is_recommended BOOLEAN,
    service_date DATE,
    response_text TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    is_helpful INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Um usuário pode avaliar outro apenas uma vez por anúncio
    UNIQUE(ad_id, reviewer_id, reviewed_id)
);

-- 3.7 Favoritos/Salvos
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    ad_id UUID REFERENCES public.classified_ads(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, ad_id)
);

-- 3.8 Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    category TEXT DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    action_label TEXT,
    metadata JSONB,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.9 Configurações de notificação
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    push BOOLEAN DEFAULT true,
    email BOOLEAN DEFAULT true,
    in_app BOOLEAN DEFAULT true,
    messages BOOLEAN DEFAULT true,
    reviews BOOLEAN DEFAULT true,
    updates BOOLEAN DEFAULT true,
    marketing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.10 Verificações de documento
CREATE TABLE IF NOT EXISTS public.verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL, -- 'cpf', 'cnpj', 'rg', 'cnh', 'address', 'professional'
    document_number TEXT,
    document_url TEXT NOT NULL,
    selfie_url TEXT,
    status verification_status DEFAULT 'pending',
    rejection_reason TEXT,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.11 Histórico de buscas
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    category TEXT,
    location_state TEXT,
    location_city TEXT,
    price_min DECIMAL(10,2),
    price_max DECIMAL(10,2),
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.12 Relatórios e Denúncias
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_ad_id UUID REFERENCES public.classified_ads(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL, -- 'spam', 'inappropriate', 'fake', 'scam', 'other'
    description TEXT NOT NULL,
    evidence_urls TEXT[],
    status TEXT DEFAULT 'pending', -- 'pending', 'investigating', 'resolved', 'dismissed'
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Perfis
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location_state, location_city);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(is_verified);

-- Anúncios
CREATE INDEX IF NOT EXISTS idx_classified_ads_user_id ON public.classified_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_classified_ads_category ON public.classified_ads(category);
CREATE INDEX IF NOT EXISTS idx_classified_ads_location ON public.classified_ads(location_state, location_city);
CREATE INDEX IF NOT EXISTS idx_classified_ads_status ON public.classified_ads(status);
CREATE INDEX IF NOT EXISTS idx_classified_ads_featured ON public.classified_ads(is_featured);
CREATE INDEX IF NOT EXISTS idx_classified_ads_created_at ON public.classified_ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_classified_ads_views ON public.classified_ads(views_count DESC);

-- Conversas e Mensagens
CREATE INDEX IF NOT EXISTS idx_conversations_client ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_professional ON public.conversations(professional_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Notificações
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Buscas
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON public.search_history USING GIN (to_tsvector('portuguese', search_query));

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classified_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. POLÍTICAS RLS
-- =====================================================

-- Perfis: Usuários podem ver e editar seus próprios perfis
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Anúncios: Todos podem ver anúncios ativos, só dono pode editar
CREATE POLICY "Anyone can view active ads" ON public.classified_ads
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own ads" ON public.classified_ads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ads" ON public.classified_ads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ads" ON public.classified_ads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ads" ON public.classified_ads
    FOR DELETE USING (auth.uid() = user_id);

-- Conversas: Só participantes podem ver
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = professional_id);

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = professional_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = professional_id);

-- Mensagens: Só participantes podem ver
CREATE POLICY "Users can view messages in own conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews: Todos podem ver, só autor pode editar
CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Favoritos: Privado para cada usuário
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Notificações: Privado para cada usuário
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Preferências de notificação: Privado
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create notification preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Verificações: Privado + admins podem ver tudo
CREATE POLICY "Users can view own verifications" ON public.verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create verifications" ON public.verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending verifications" ON public.verifications
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Histórico de buscas: Privado
CREATE POLICY "Users can view own search history" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categorias: Todos podem ver
CREATE POLICY "Anyone can view categories" ON public.service_categories
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 7. FUNCTIONS E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classified_ads_updated_at BEFORE UPDATE ON public.classified_ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON public.verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'client')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar estatísticas do perfil após review
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas do usuário avaliado
    UPDATE public.profiles
    SET
        rating = (
            SELECT AVG(rating)
            FROM public.reviews
            WHERE reviewed_id = NEW.reviewed_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE reviewed_id = NEW.reviewed_id
        ),
        updated_at = NOW()
    WHERE id = NEW.reviewed_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas após review
CREATE TRIGGER on_review_created
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_profile_stats();

-- =====================================================
-- 8. DADOS INICIAIS
-- =====================================================

-- Inserir categorias de serviço
INSERT INTO public.service_categories (name, slug, description, icon, color, sort_order) VALUES
('Construção e Reforma', 'construcao-reforma', 'Pedreiros, pintores, eletricistas, encanadores', '🔨', '#3B82F6', 1),
('Limpeza e Organização', 'limpeza-organizacao', 'Faxineiras, diaristas, organizadores', '🧹', '#10B981', 2),
('Serviços Domésticos', 'servicos-domesticos', 'Cozinheiras, babás, cuidadoras', '🏠', '#F59E0B', 3),
('Manutenção Residencial', 'manutencao-residencial', 'Jardineiros, eletricistas, marceneiros', '🔧', '#8B5CF6', 4),
('Serviços Automotivos', 'servicos-automotivos', 'Mecânicos, lavadores, funileiros', '🚗', '#EF4444', 5),
('Tecnologia e Informática', 'tecnologia-informatica', 'Técnicos em TI, reparo de celulares', '💻', '#6366F1', 6),
('Beleza e Estética', 'beleza-estetica', 'Cabeleireiros, manicures, maquiadores', '💄', '#EC4899', 7),
('Saúde e Bem-estar', 'saude-bem-estar', 'Massagistas, personal trainers', '❤️', '#10B981', 8),
('Educação e Aulas', 'educacao-aulas', 'Professores particulares, tutores', '📚', '#F59E0B', 9),
('Eventos e Entretenimento', 'eventos-entretenimento', 'Fotógrafos, DJs, decoradores', '🎉', '#8B5CF6', 10)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 9. STORAGE BUCKETS
-- =====================================================

-- Bucket para avatares de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de anúncios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ad-images',
    'ad-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos de verificação
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-docs',
    'verification-docs',
    false, -- Privado
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para anexos de mensagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'message-attachments',
    'message-attachments',
    false, -- Privado
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 10. POLÍTICAS DE STORAGE
-- =====================================================

-- Políticas para avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Políticas para imagens de anúncios
CREATE POLICY "Ad images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'ad-images');

CREATE POLICY "Users can upload ad images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'ad-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their ad images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'ad-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their ad images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'ad-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Políticas para documentos de verificação (privado)
CREATE POLICY "Users can view their own verification docs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'verification-docs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload verification docs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'verification-docs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Políticas para anexos de mensagens (privado)
CREATE POLICY "Users can view message attachments in their conversations" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'message-attachments'
        AND EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE (storage.foldername(storage.objects.name))[2] = m.id::text
            AND (c.client_id = auth.uid() OR c.professional_id = auth.uid())
        )
    );

CREATE POLICY "Users can upload message attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'message-attachments'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 11. VIEWS E MATERIALIZED VIEWS
-- =====================================================

-- View para anúncios com informações do usuário
CREATE OR REPLACE VIEW public.ads_with_profiles AS
SELECT
    a.*,
    p.full_name as user_name,
    p.avatar_url as user_avatar_url,
    p.rating as user_rating,
    p.total_reviews as user_total_reviews,
    p.is_verified as user_is_verified,
    p.professional_experience_years,
    c.name as category_name,
    c.color as category_color
FROM public.classified_ads a
LEFT JOIN public.profiles p ON a.user_id = p.id
LEFT JOIN public.service_categories c ON a.category_id = c.id;

-- View para estatísticas do usuário
CREATE OR REPLACE VIEW public.user_stats AS
SELECT
    p.id,
    p.full_name,
    p.user_type,
    COUNT(DISTINCT a.id) as total_ads,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active') as active_ads,
    COALESCE(SUM(a.views_count), 0) as total_views,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as total_reviews_received,
    COUNT(DISTINCT f.id) as total_favorites,
    COUNT(DISTINCT c.id) as total_conversations
FROM public.profiles p
LEFT JOIN public.classified_ads a ON p.id = a.user_id
LEFT JOIN public.reviews r ON p.id = r.reviewed_id
LEFT JOIN public.favorites f ON p.id = f.user_id
LEFT JOIN public.conversations c ON (p.id = c.client_id OR p.id = c.professional_id)
GROUP BY p.id, p.full_name, p.user_type;

-- =====================================================
-- 12. FUNÇÕES HELPER
-- =====================================================

-- Função para calcular distância entre coordenadas (se adicionar geolocalização)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lng1 float, lat2 float, lng2 float)
RETURNS float AS $$
DECLARE
    dlat float;
    dlng float;
    a float;
    c float;
    earth_radius float := 6371; -- km
BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlng := RADIANS(lng2 - lng1);

    a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlng/2) * SIN(dlng/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));

    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar anúncios próximos (exemplo)
CREATE OR REPLACE FUNCTION find_nearby_ads(user_lat float, user_lng float, radius_km float DEFAULT 50)
RETURNS TABLE (
    ad_id uuid,
    title text,
    distance float,
    user_name text,
    rating float
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.title,
        calculate_distance(user_lat, user_lng, 0, 0) as distance, -- Substituir por lat/lng reais
        p.full_name,
        p.rating
    FROM public.classified_ads a
    JOIN public.profiles p ON a.user_id = p.id
    WHERE a.status = 'active'
    AND calculate_distance(user_lat, user_lng, 0, 0) <= radius_km -- Substituir por lat/lng reais
    ORDER BY calculate_distance(user_lat, user_lng, 0, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 13. CONFIGURAÇÕES FINAIS
-- =====================================================

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Otimizar configurações de performance
ALTER TABLE public.classified_ads SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.messages SET (autovacuum_vacuum_scale_factor = 0.05);

-- =====================================================
-- 14. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuários - informações básicas e profissionais';
COMMENT ON TABLE public.classified_ads IS 'Anúncios/classificados criados pelos profissionais';
COMMENT ON TABLE public.conversations IS 'Conversas entre clientes e profissionais';
COMMENT ON TABLE public.messages IS 'Mensagens individuais das conversas';
COMMENT ON TABLE public.reviews IS 'Avaliações e reviews dos serviços';
COMMENT ON TABLE public.notifications IS 'Notificações push e in-app';
COMMENT ON TABLE public.favorites IS 'Anúncios salvos/favoritados pelos usuários';
COMMENT ON TABLE public.verifications IS 'Documentos de verificação de identidade';
COMMENT ON TABLE public.service_categories IS 'Categorias de serviços disponíveis';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Para aplicar este script:
-- 1. Conectar no Supabase SQL Editor
-- 2. Copiar e colar todo o conteúdo
-- 3. Executar
-- 4. Verificar se todas as tabelas foram criadas
-- 5. Testar as funcionalidades

-- IMPORTANTE:
-- - Este script cria TODAS as tabelas necessárias
-- - Configura RLS (segurança)
-- - Adiciona índices de performance
-- - Cria políticas de acesso
-- - Configura storage buckets
-- - Adiciona dados iniciais (categorias)

-- O sistema está pronto para uso após execução!
