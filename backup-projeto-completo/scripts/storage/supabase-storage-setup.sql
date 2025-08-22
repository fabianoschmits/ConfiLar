-- =====================================================
-- CONFILAR v4 - CONFIGURAÇÃO DO STORAGE
-- =====================================================
-- Execute este arquivo no SQL Editor do Supabase APÓS executar a migração principal
-- Projeto: https://nyqhzbfjgmaeyoyawkrq.supabase.co

-- =====================================================
-- 1. CRIAR BUCKETS DE STORAGE
-- =====================================================

-- Bucket para avatares e fotos de perfil (PÚBLICO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos de verificação (PRIVADO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    10485760, -- 10MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para portfolio de profissionais (PÚBLICO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolio',
    'portfolio',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para imagens do feed social (PÚBLICO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'feed-images',
    'feed-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Bucket para arquivos temporários (PRIVADO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'temp',
    'temp',
    false,
    52428800, -- 50MB
    ARRAY['*/*']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. POLÍTICAS DE STORAGE PARA AVATARS (PÚBLICO)
-- =====================================================

-- Qualquer pessoa pode visualizar avatares
CREATE POLICY "Public avatars are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Usuários autenticados podem fazer upload de seus próprios avatares
CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem atualizar seus próprios avatares
CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem deletar seus próprios avatares
CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 3. POLÍTICAS DE STORAGE PARA DOCUMENTOS (PRIVADO)
-- =====================================================

-- Usuários podem visualizar apenas seus próprios documentos
CREATE POLICY "Users can view own documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem fazer upload de seus próprios documentos
CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem atualizar seus próprios documentos
CREATE POLICY "Users can update own documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem deletar seus próprios documentos
CREATE POLICY "Users can delete own documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 4. POLÍTICAS DE STORAGE PARA PORTFOLIO (PÚBLICO)
-- =====================================================

-- Qualquer pessoa pode visualizar imagens do portfolio
CREATE POLICY "Public portfolio images are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio');

-- Usuários autenticados podem fazer upload de imagens para seu portfolio
CREATE POLICY "Users can upload to their portfolio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'portfolio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem atualizar imagens de seu portfolio
CREATE POLICY "Users can update their portfolio" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'portfolio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem deletar imagens de seu portfolio
CREATE POLICY "Users can delete from their portfolio" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'portfolio' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 5. POLÍTICAS DE STORAGE PARA IMAGENS DO FEED (PÚBLICO)
-- =====================================================

-- Qualquer pessoa pode visualizar imagens do feed
CREATE POLICY "Public feed images are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'feed-images');

-- Usuários autenticados podem fazer upload de imagens para o feed
CREATE POLICY "Users can upload feed images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'feed-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem atualizar suas imagens do feed
CREATE POLICY "Users can update feed images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'feed-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem deletar suas imagens do feed
CREATE POLICY "Users can delete feed images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'feed-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 6. POLÍTICAS DE STORAGE PARA ARQUIVOS TEMPORÁRIOS (PRIVADO)
-- =====================================================

-- Usuários podem visualizar apenas seus arquivos temporários
CREATE POLICY "Users can view own temp files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'temp' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem fazer upload de arquivos temporários
CREATE POLICY "Users can upload temp files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'temp' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem atualizar seus arquivos temporários
CREATE POLICY "Users can update temp files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'temp' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Usuários podem deletar seus arquivos temporários
CREATE POLICY "Users can delete temp files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'temp' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- 7. FUNÇÕES AUXILIARES PARA STORAGE
-- =====================================================

-- Função para obter URL pública de um arquivo
CREATE OR REPLACE FUNCTION get_public_url(bucket_name text, file_path text)
RETURNS text AS $$
BEGIN
    RETURN 'https://nyqhzbfjgmaeyoyawkrq.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar arquivos temporários antigos (mais de 24 horas)
CREATE OR REPLACE FUNCTION cleanup_temp_files()
RETURNS void AS $$
BEGIN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'temp' 
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. VERIFICAÇÃO DOS BUCKETS CRIADOS
-- =====================================================

-- Verificar buckets criados
SELECT 
    id as bucket_id,
    name as bucket_name,
    public,
    file_size_limit,
    CASE 
        WHEN public THEN '✅ Público' 
        ELSE '🔒 Privado' 
    END as status
FROM storage.buckets 
WHERE id IN ('avatars', 'documents', 'portfolio', 'feed-images', 'temp')
ORDER BY name;

-- Verificar políticas criadas
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- =====================================================
-- STORAGE CONFIGURADO COM SUCESSO!
-- =====================================================

-- Resumo dos buckets criados:
-- 🧑 avatars: Fotos de perfil (Público, 5MB, JPG/PNG/WEBP)
-- 📄 documents: Documentos de verificação (Privado, 10MB, PDF/JPG/PNG)
-- 🖼️ portfolio: Imagens do portfolio (Público, 10MB, JPG/PNG/WEBP)
-- 📱 feed-images: Imagens do feed social (Público, 10MB, JPG/PNG/WEBP)
-- ⏰ temp: Arquivos temporários (Privado, 50MB, Todos os tipos)









