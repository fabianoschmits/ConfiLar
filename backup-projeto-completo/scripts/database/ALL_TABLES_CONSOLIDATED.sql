-- =====================================================
-- CONFILAR v3 - TODAS AS TABELAS CONSOLIDADAS
-- Arquivo de referência para consultas futuras
-- Data: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- =====================================================

-- =====================================================
-- 1. TABELA PROFILES (Usuários/Perfis)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    cpf_cnpj TEXT,
    user_type TEXT DEFAULT 'client' CHECK (user_type IN ('client', 'professional', 'admin')),
    professional_verified BOOLEAN DEFAULT false,
    address_state TEXT,
    address_city TEXT,
    address_neighborhood TEXT,
    address_street TEXT,
    address_number TEXT,
    address_complement TEXT,
    address_zipcode TEXT,
    bio TEXT,
    skills TEXT[],
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA SERVICE_CATEGORIES (Categorias de Serviços)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA SERVICE_LISTINGS (Anúncios de Serviços)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    price_type TEXT DEFAULT 'fixed',
    currency TEXT DEFAULT 'BRL',
    location_state TEXT,
    location_city TEXT,
    neighborhood TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    service_photos TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA FEED_POSTS (Posts do Feed Social)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feed_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    post_type TEXT DEFAULT 'general' CHECK (post_type IN ('general', 'service', 'review', 'announcement', 'promotion')),
    location_state TEXT,
    location_city TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA FEED_LIKES (Curtidas dos Posts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feed_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- =====================================================
-- 6. TABELA FEED_COMMENTS (Comentários dos Posts)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feed_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA SERVICE_BOOKINGS (Agendamentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_listing_id UUID REFERENCES public.service_listings(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    total_price DECIMAL(10,2),
    notes TEXT,
    client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
    client_review TEXT,
    professional_rating INTEGER CHECK (professional_rating >= 1 AND professional_rating <= 5),
    professional_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABELA CONVERSATIONS (Conversas entre Usuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    participant2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant1_id, participant2_id)
);

-- =====================================================
-- 9. TABELA MESSAGES (Mensagens das Conversas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. TABELA NOTIFICATIONS (Notificações dos Usuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. TABELA SEARCH_HISTORY (Histórico de Busca)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    search_term TEXT NOT NULL,
    search_type TEXT DEFAULT 'professional' CHECK (search_type IN ('professional', 'service', 'location')),
    location_state TEXT,
    location_city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABELA PROFESSIONAL_REVIEWS (Avaliações de Profissionais)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.professional_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. TABELA CLIENT_REVIEWS (Avaliações de Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.client_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. TABELA FAVORITES (Favoritos dos Usuários)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    favorite_type TEXT NOT NULL CHECK (favorite_type IN ('professional', 'service', 'post')),
    favorite_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, favorite_type, favorite_id)
);

-- =====================================================
-- 15. TABELA PAYMENTS (Pagamentos)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.service_bookings(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    payment_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(address_state, address_city);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating);

-- Service Categories
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON public.service_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_service_categories_sort ON public.service_categories(sort_order);

-- Service Listings
CREATE INDEX IF NOT EXISTS idx_service_listings_professional ON public.service_listings(professional_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_location ON public.service_listings(location_state, location_city);
CREATE INDEX IF NOT EXISTS idx_service_listings_active ON public.service_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_service_listings_rating ON public.service_listings(rating);

-- Feed Posts
CREATE INDEX IF NOT EXISTS idx_feed_posts_user ON public.feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_type ON public.feed_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_feed_posts_location ON public.feed_posts(location_state, location_city);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON public.feed_posts(created_at);

-- Feed Likes
CREATE INDEX IF NOT EXISTS idx_feed_likes_post ON public.feed_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_user ON public.feed_likes(user_id);

-- Feed Comments
CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON public.feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_user ON public.feed_comments(user_id);

-- Service Bookings
CREATE INDEX IF NOT EXISTS idx_service_bookings_service ON public.service_bookings(service_listing_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_client ON public.service_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_professional ON public.service_bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON public.service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_date ON public.service_bookings(booking_date);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON public.conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON public.conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at);

-- Search History
CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON public.search_history(created_at);

-- Professional Reviews
CREATE INDEX IF NOT EXISTS idx_professional_reviews_professional ON public.professional_reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_reviews_client ON public.professional_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_professional_reviews_rating ON public.professional_reviews(rating);

-- Client Reviews
CREATE INDEX IF NOT EXISTS idx_client_reviews_client ON public.client_reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_client_reviews_professional ON public.client_reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_client_reviews_rating ON public.client_reviews(rating);

-- Favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_type ON public.favorites(favorite_type);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Categorias de Serviços
INSERT INTO public.service_categories (name, description, icon, color, sort_order) VALUES
('Construção e Reforma', 'Serviços de construção, reforma e manutenção predial', '🔨', '#FF6B35', 1),
('Limpeza', 'Serviços de limpeza residencial e comercial', '🧹', '#4ECDC4', 2),
('Tecnologia', 'Serviços de TI, desenvolvimento e suporte técnico', '💻', '#45B7D1', 3),
('Beleza', 'Serviços de beleza e estética', '💄', '#FFA07A', 4),
('Transporte', 'Serviços de transporte e logística', '🚗', '#98D8C8', 5),
('Educação', 'Serviços educacionais e tutoria', '📚', '#F7DC6F', 6),
('Saúde', 'Serviços de saúde e bem-estar', '🏥', '#BB8FCE', 7),
('Eventos', 'Organização e planejamento de eventos', '🎉', '#F1948A', 8),
('Jardinagem', 'Serviços de paisagismo e jardinagem', '🌱', '#82E0AA', 9),
('Pet Care', 'Cuidados com animais de estimação', '🐕', '#F8C471', 10)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_listings_updated_at BEFORE UPDATE ON public.service_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_posts_updated_at BEFORE UPDATE ON public.feed_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feed_comments_updated_at BEFORE UPDATE ON public.feed_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON public.service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_reviews_updated_at BEFORE UPDATE ON public.professional_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_reviews_updated_at BEFORE UPDATE ON public.client_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RESUMO DAS TABELAS
-- =====================================================
/*
TABELAS CRIADAS:

1. profiles - Perfis de usuários (clientes e profissionais)
2. service_categories - Categorias de serviços
3. service_listings - Anúncios de serviços
4. feed_posts - Posts do feed social
5. feed_likes - Curtidas dos posts
6. feed_comments - Comentários dos posts
7. service_bookings - Agendamentos de serviços
8. conversations - Conversas entre usuários
9. messages - Mensagens das conversas
10. notifications - Notificações dos usuários
11. search_history - Histórico de busca
12. professional_reviews - Avaliações de profissionais
13. client_reviews - Avaliações de clientes
14. favorites - Favoritos dos usuários
15. payments - Pagamentos

FUNCIONALIDADES:
- Sistema de usuários e perfis
- Sistema de serviços e categorias
- Feed social com posts, curtidas e comentários
- Sistema de mensagens entre usuários
- Sistema de agendamentos
- Sistema de avaliações
- Sistema de notificações
- Sistema de busca e favoritos
- Sistema de pagamentos
- Row Level Security (RLS) habilitado
- Índices para performance
- Triggers para atualização automática de timestamps
*/

-- =====================================================
-- STORAGE BUCKETS E POLÍTICAS
-- =====================================================

-- 1. CRIAR BUCKETS DE STORAGE
-- Bucket para avatares de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens de serviços
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens do feed social
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('feed-images', 'feed-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos de verificação
INSERT INTO storage.buckets (id, name, public, false, file_size_limit, allowed_mime_types)
VALUES ('verification-docs', 'verification-docs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE STORAGE PARA AVATARS
-- Usuários podem fazer upload de seus próprios avatares
CREATE POLICY "Usuários podem fazer upload de seus próprios avatares" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem visualizar todos os avatares (bucket público)
CREATE POLICY "Avatares são públicos para visualização" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Usuários podem atualizar seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus próprios avatares" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem deletar seus próprios avatares
CREATE POLICY "Usuários podem deletar seus próprios avatares" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. POLÍTICAS DE STORAGE PARA IMAGENS DE SERVIÇOS
-- Profissionais podem fazer upload de imagens para seus serviços
CREATE POLICY "Profissionais podem fazer upload de imagens de serviços" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'service-images' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND user_type = 'professional'
    )
);

-- Imagens de serviços são públicas para visualização
CREATE POLICY "Imagens de serviços são públicas" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

-- Profissionais podem atualizar imagens de seus serviços
CREATE POLICY "Profissionais podem atualizar imagens de serviços" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'service-images' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND user_type = 'professional'
    )
);

-- Profissionais podem deletar imagens de seus serviços
CREATE POLICY "Profissionais podem deletar imagens de serviços" ON storage.objects
FOR DELETE USING (
    bucket_id = 'service-images' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND user_type = 'professional'
    )
);

-- 4. POLÍTICAS DE STORAGE PARA IMAGENS DO FEED
-- Usuários autenticados podem fazer upload de imagens para o feed
CREATE POLICY "Usuários podem fazer upload de imagens para o feed" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'feed-images' 
    AND auth.uid() IS NOT NULL
);

-- Imagens do feed são públicas para visualização
CREATE POLICY "Imagens do feed são públicas" ON storage.objects
FOR SELECT USING (bucket_id = 'feed-images');

-- Usuários podem atualizar suas próprias imagens do feed
CREATE POLICY "Usuários podem atualizar suas imagens do feed" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'feed-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem deletar suas próprias imagens do feed
CREATE POLICY "Usuários podem deletar suas imagens do feed" ON storage.objects
FOR DELETE USING (
    bucket_id = 'feed-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. POLÍTICAS DE STORAGE PARA DOCUMENTOS DE VERIFICAÇÃO
-- Usuários podem fazer upload de seus próprios documentos
CREATE POLICY "Usuários podem fazer upload de seus documentos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem visualizar apenas seus próprios documentos
CREATE POLICY "Usuários podem visualizar seus documentos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem atualizar seus próprios documentos
CREATE POLICY "Usuários podem atualizar seus documentos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuários podem deletar seus próprios documentos
CREATE POLICY "Usuários podem deletar seus documentos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. FUNÇÕES ÚTEIS PARA STORAGE
-- Função para obter URL pública de uma imagem
CREATE OR REPLACE FUNCTION get_public_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário pode acessar arquivo
CREATE OR REPLACE FUNCTION can_access_file(bucket_name TEXT, file_path TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Buckets públicos sempre permitem acesso
    IF bucket_name IN ('avatars', 'service-images', 'feed-images') THEN
        RETURN TRUE;
    END IF;
    
    -- Buckets privados só permitem acesso ao proprietário
    IF bucket_name = 'verification-docs' THEN
        RETURN auth.uid()::text = (storage.foldername(file_path))[1];
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. TRIGGERS PARA ATUALIZAR CONTADORES DE IMAGENS
-- Trigger para atualizar contador de imagens em service_listings
CREATE OR REPLACE FUNCTION update_service_images_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrementar contador quando nova imagem é adicionada
        UPDATE public.service_listings 
        SET service_photos = array_append(service_photos, NEW.name)
        WHERE id::text = (storage.foldername(NEW.name))[2];
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrementar contador quando imagem é removida
        UPDATE public.service_listings 
        SET service_photos = array_remove(service_photos, OLD.name)
        WHERE id::text = (storage.foldername(OLD.name))[2];
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger ao bucket service-images
CREATE TRIGGER service_images_count_trigger
AFTER INSERT OR DELETE ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'service-images' OR OLD.bucket_id = 'service-images')
EXECUTE FUNCTION update_service_images_count();

-- 8. RESUMO COMPLETO DO SISTEMA
/*
SISTEMA COMPLETO CONFILAR v3:

BANCO DE DADOS (15 tabelas):
- Sistema de usuários e perfis
- Sistema de serviços e categorias
- Feed social com posts, curtidas e comentários
- Sistema de mensagens entre usuários
- Sistema de agendamentos
- Sistema de avaliações
- Sistema de notificações
- Sistema de busca e favoritos
- Sistema de pagamentos

STORAGE (4 buckets):
1. avatars - Avatares de usuários (público)
2. service-images - Imagens de serviços (público)
3. feed-images - Imagens do feed social (público)
4. verification-docs - Documentos de verificação (privado)

SEGURANÇA:
- Row Level Security (RLS) em todas as tabelas
- Políticas de Storage configuradas
- Índices para performance
- Triggers para atualização automática
- Funções de segurança para Storage

FUNCIONALIDADES:
- Upload e gerenciamento de imagens
- Sistema de arquivos organizado por usuário
- URLs públicas para imagens
- Controle de acesso baseado em permissões
- Integração completa entre banco e storage
*/
