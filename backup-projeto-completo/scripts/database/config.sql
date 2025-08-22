-- =====================================================
-- CONFILAR v3 - Configurações do Supabase
-- =====================================================

-- Configurações de timezone para Brasil
SET timezone = 'America/Sao_Paulo';

-- Configurações de locale para português brasileiro
SET lc_messages = 'pt_BR.UTF-8';
SET lc_monetary = 'pt_BR.UTF-8';
SET lc_numeric = 'pt_BR.UTF-8';
SET lc_time = 'pt_BR.UTF-8';

-- =====================================================
-- CONFIGURAÇÕES DE STORAGE
-- =====================================================

-- Criar buckets de storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('portfolio', 'portfolio', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('verification', 'verification', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
    ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS DE STORAGE
-- =====================================================

-- Políticas para avatars (público)
CREATE POLICY "Public avatars are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para documentos (privado)
CREATE POLICY "Users can view own documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own documents" ON storage.objects
    FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own documents" ON storage.objects
    FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para portfolio (público)
CREATE POLICY "Public portfolio images are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Professionals can upload portfolio images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Professionals can update portfolio images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Professionals can delete portfolio images" ON storage.objects
    FOR DELETE USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para verificação (privado)
CREATE POLICY "Users can view own verification documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload verification documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update verification documents" ON storage.objects
    FOR UPDATE USING (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete verification documents" ON storage.objects
    FOR DELETE USING (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para imagens de serviços (público)
CREATE POLICY "Public service images are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Professionals can upload service images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Professionals can update service images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Professionals can delete service images" ON storage.objects
    FOR DELETE USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- FUNÇÕES UTILITÁRIAS
-- =====================================================

-- Função para formatar CPF/CNPJ
CREATE OR REPLACE FUNCTION format_document(document TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF LENGTH(document) = 11 THEN
        -- CPF: 000.000.000-00
        RETURN SUBSTRING(document FROM 1 FOR 3) || '.' ||
               SUBSTRING(document FROM 4 FOR 3) || '.' ||
               SUBSTRING(document FROM 7 FOR 3) || '-' ||
               SUBSTRING(document FROM 10 FOR 2);
    ELSIF LENGTH(document) = 14 THEN
        -- CNPJ: 00.000.000/0000-00
        RETURN SUBSTRING(document FROM 1 FOR 2) || '.' ||
               SUBSTRING(document FROM 3 FOR 3) || '.' ||
               SUBSTRING(document FROM 6 FOR 3) || '/' ||
               SUBSTRING(document FROM 9 FOR 4) || '-' ||
               SUBSTRING(document FROM 13 FOR 2);
    ELSE
        RETURN document;
    END IF;
END;
$$;

-- Função para formatar telefone
CREATE OR REPLACE FUNCTION format_phone(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    IF LENGTH(phone) = 11 THEN
        -- (00) 00000-0000
        RETURN '(' || SUBSTRING(phone FROM 1 FOR 2) || ') ' ||
               SUBSTRING(phone FROM 3 FOR 5) || '-' ||
               SUBSTRING(phone FROM 8 FOR 4);
    ELSIF LENGTH(phone) = 10 THEN
        -- (00) 0000-0000
        RETURN '(' || SUBSTRING(phone FROM 1 FOR 2) || ') ' ||
               SUBSTRING(phone FROM 3 FOR 4) || '-' ||
               SUBSTRING(phone FROM 7 FOR 4);
    ELSE
        RETURN phone;
    END IF;
END;
$$;

-- Função para calcular idade
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$;

-- Função para verificar se usuário é profissional
CREATE OR REPLACE FUNCTION is_professional(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND user_type = 'professional'
    );
END;
$$;

-- Função para verificar se usuário é cliente
CREATE OR REPLACE FUNCTION is_client(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND user_type = 'client'
    );
END;
$$;

-- Função para obter rating médio
CREATE OR REPLACE FUNCTION get_average_rating(user_id UUID)
RETURNS DECIMAL(3,2)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(rating_person), 0.00)
        FROM reviews
        WHERE reviewed_id = user_id
    );
END;
$$;

-- Função para contar avaliações
CREATE OR REPLACE FUNCTION get_reviews_count(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT COALESCE(COUNT(*), 0)
        FROM reviews
        WHERE reviewed_id = user_id
    );
END;
$$;

-- =====================================================
-- TRIGGERS ADICIONAIS
-- =====================================================

-- Trigger para atualizar estatísticas quando perfil é atualizado
CREATE OR REPLACE FUNCTION update_profile_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas se o perfil foi marcado como completo
    IF NEW.profile_completed = true AND OLD.profile_completed = false THEN
        INSERT INTO user_activity_log (user_id, activity_type, description)
        VALUES (NEW.id, 'profile_completed', 'Perfil marcado como completo');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_statistics
    AFTER UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_statistics();

-- =====================================================
-- DADOS INICIAIS ADICIONAIS
-- =====================================================

-- Inserir configurações padrão para usuários existentes
INSERT INTO user_settings (user_id)
SELECT id FROM public.profiles
ON CONFLICT DO NOTHING;

-- Inserir estatísticas iniciais para usuários existentes
INSERT INTO user_statistics (user_id)
SELECT id FROM public.profiles
ON CONFLICT DO NOTHING;

-- =====================================================
-- CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Configurar work_mem para operações complexas
SET work_mem = '256MB';

-- Configurar shared_buffers (ajuste conforme necessário)
-- SET shared_buffers = '256MB';

-- Configurar effective_cache_size (ajuste conforme necessário)
-- SET effective_cache_size = '1GB';

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON FUNCTION format_document(TEXT) IS 'Formata CPF/CNPJ para exibição';
COMMENT ON FUNCTION format_phone(TEXT) IS 'Formata telefone para exibição';
COMMENT ON FUNCTION calculate_age(DATE) IS 'Calcula idade baseada na data de nascimento';
COMMENT ON FUNCTION is_professional(UUID) IS 'Verifica se usuário é profissional';
COMMENT ON FUNCTION is_client(UUID) IS 'Verifica se usuário é cliente';
COMMENT ON FUNCTION get_average_rating(UUID) IS 'Obtém rating médio do usuário';
COMMENT ON FUNCTION get_reviews_count(UUID) IS 'Obtém número total de avaliações do usuário';

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'profiles', 'appointments', 'favorites',
        'portfolio_projects', 'user_files',
        'user_activity_log', 'user_settings', 'user_statistics',
        'support_tickets', 'support_messages',
        'service_listings', 'service_requests', 'service_proposals',
        'service_reviews', 'service_favorites', 'service_history',
        'service_notifications'
    );
    
    RAISE NOTICE 'Total de tabelas criadas: %', table_count;
    
    IF table_count < 16 THEN
        RAISE WARNING 'Algumas tabelas podem não ter sido criadas corretamente';
    END IF;
END $$;

-- Verificar se todas as políticas RLS estão ativas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Total de políticas RLS criadas: %', policy_count;
END $$;
