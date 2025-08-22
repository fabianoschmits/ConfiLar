-- =====================================================
-- CORREÇÃO DAS POLÍTICAS DE STORAGE
-- =====================================================

-- 1. VERIFICAR SE OS BUCKETS EXISTEM
DO $$
BEGIN
    -- Verificar bucket avatars
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        RAISE NOTICE 'Criando bucket avatars...';
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);
    ELSE
        RAISE NOTICE 'Bucket avatars já existe';
    END IF;

    -- Verificar bucket service-images
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'service-images') THEN
        RAISE NOTICE 'Criando bucket service-images...';
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);
    ELSE
        RAISE NOTICE 'Bucket service-images já existe';
    END IF;

    -- Verificar bucket feed-images
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'feed-images') THEN
        RAISE NOTICE 'Criando bucket feed-images...';
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('feed-images', 'feed-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webg']);
    ELSE
        RAISE NOTICE 'Bucket feed-images já existe';
    END IF;

    -- Verificar bucket verification-docs
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'verification-docs') THEN
        RAISE NOTICE 'Criando bucket verification-docs...';
        INSERT INTO storage.buckets (id, name, public, false, file_size_limit, allowed_mime_types)
        VALUES ('verification-docs', 'verification-docs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']);
    ELSE
        RAISE NOTICE 'Bucket verification-docs já existe';
    END IF;
END $$;

-- 2. REMOVER POLÍTICAS ANTIGAS SE EXISTIREM
DROP POLICY IF EXISTS "Usuários podem fazer upload de avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de imagens de serviço" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem gerenciar imagens de serviço" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de imagens do feed" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem gerenciar imagens do feed" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus documentos" ON storage.objects;

-- 3. CRIAR NOVAS POLÍTICAS PARA AVATARS
CREATE POLICY "Usuários podem fazer upload de avatares" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem visualizar avatares" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem atualizar seus avatares" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar seus avatares" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. CRIAR POLÍTICAS PARA IMAGENS DE SERVIÇO
CREATE POLICY "Usuários podem fazer upload de imagens de serviço" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'service-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem visualizar imagens de serviço" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "Usuários podem atualizar suas imagens de serviço" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'service-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar suas imagens de serviço" ON storage.objects
FOR DELETE USING (
    bucket_id = 'service-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. CRIAR POLÍTICAS PARA IMAGENS DO FEED
CREATE POLICY "Usuários podem fazer upload de imagens do feed" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'feed-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem visualizar imagens do feed" ON storage.objects
FOR SELECT USING (bucket_id = 'feed-images');

CREATE POLICY "Usuários podem atualizar suas imagens do feed" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'feed-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar suas imagens do feed" ON storage.objects
FOR DELETE USING (
    bucket_id = 'feed-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. CRIAR POLÍTICAS PARA DOCUMENTOS DE VERIFICAÇÃO
CREATE POLICY "Usuários podem fazer upload de documentos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem visualizar seus documentos" ON storage.objects
FOR SELECT USING (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar seus documentos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar seus documentos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'verification-docs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DAS POLÍTICAS DE STORAGE ===';
    
    -- Contar políticas por bucket
    RAISE NOTICE 'Políticas para avatars: %', (
        SELECT COUNT(*) FROM storage.policies 
        WHERE bucket_id = 'avatars'
    );
    
    RAISE NOTICE 'Políticas para service-images: %', (
        SELECT COUNT(*) FROM storage.policies 
        WHERE bucket_id = 'service-images'
    );
    
    RAISE NOTICE 'Políticas para feed-images: %', (
        SELECT COUNT(*) FROM storage.policies 
        WHERE bucket_id = 'feed-images'
    );
    
    RAISE NOTICE 'Políticas para verification-docs: %', (
        SELECT COUNT(*) FROM storage.policies 
        WHERE bucket_id = 'verification-docs'
    );
    
    RAISE NOTICE '=== VERIFICAÇÃO CONCLUÍDA ===';
END $$;

-- 8. MOSTRAR TODAS AS POLÍTICAS CRIADAS
SELECT 
    bucket_id,
    name as policy_name,
    definition
FROM storage.policies 
ORDER BY bucket_id, name;






