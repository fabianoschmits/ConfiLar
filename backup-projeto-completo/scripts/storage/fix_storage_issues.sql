-- =====================================================
-- CORREÇÃO DOS PROBLEMAS DE STORAGE
-- =====================================================

-- 1. VERIFICAR SE O STORAGE ESTÁ FUNCIONANDO
DO $$
DECLARE
    bucket_record RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DO STORAGE ===';
    
    -- Verificar se o schema storage existe
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        RAISE NOTICE '✅ Schema storage existe';
        
        -- Verificar se a tabela buckets existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
            RAISE NOTICE '✅ Tabela storage.buckets existe';
            
            -- Verificar se há buckets
            IF EXISTS (SELECT 1 FROM storage.buckets LIMIT 1) THEN
                RAISE NOTICE '✅ Buckets encontrados';
                
                -- Listar buckets
                RAISE NOTICE '📦 Buckets disponíveis:';
                FOR bucket_record IN SELECT id, name, public FROM storage.buckets LOOP
                    RAISE NOTICE '  - %: % (public: %)', 
                        bucket_record.id, 
                        bucket_record.name, 
                        bucket_record.public;
                END LOOP;
                
            ELSE
                RAISE NOTICE '❌ Nenhum bucket encontrado';
            END IF;
            
        ELSE
            RAISE NOTICE '❌ Tabela storage.buckets não existe';
        END IF;
        
        -- Verificar se a tabela policies existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
            RAISE NOTICE '✅ Tabela storage.policies existe';
            
            -- Verificar se há políticas
            IF EXISTS (SELECT 1 FROM storage.policies LIMIT 1) THEN
                RAISE NOTICE '✅ Políticas encontradas';
                
                -- Contar políticas
                RAISE NOTICE '🔒 Total de políticas: %', (
                    SELECT COUNT(*) FROM storage.policies
                );
                
            ELSE
                RAISE NOTICE '❌ Nenhuma política encontrada';
            END IF;
            
        ELSE
            RAISE NOTICE '❌ Tabela storage.policies não existe';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Schema storage não existe';
        RAISE NOTICE '⚠️ Storage não está habilitado no Supabase';
        RAISE NOTICE '📋 Habilite em: Dashboard > Storage > Enable Storage';
        RETURN;
    END IF;
    
    RAISE NOTICE '=== VERIFICAÇÃO CONCLUÍDA ===';
END $$;

-- 2. CRIAR BUCKETS SE NÃO EXISTIREM
DO $$
BEGIN
    -- Verificar bucket avatars
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        RAISE NOTICE 'Criando bucket avatars...';
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);
        RAISE NOTICE '✅ Bucket avatars criado';
    ELSE
        RAISE NOTICE '✅ Bucket avatars já existe';
    END IF;

    -- Verificar bucket service-images
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'service-images') THEN
        RAISE NOTICE 'Criando bucket service-images...';
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);
        RAISE NOTICE '✅ Bucket service-images criado';
    ELSE
        RAISE NOTICE '✅ Bucket service-images já existe';
    END IF;

    -- Verificar bucket feed-images
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'feed-images') THEN
        RAISE NOTICE 'Criando bucket feed-images...';
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('feed-images', 'feed-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);
        RAISE NOTICE '✅ Bucket feed-images criado';
    ELSE
        RAISE NOTICE '✅ Bucket feed-images já existe';
    END IF;
END $$;

-- 3. CRIAR POLÍTICAS DE STORAGE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
        RAISE NOTICE 'Criando políticas de storage...';
        
        -- Remover políticas antigas
        DROP POLICY IF EXISTS "Usuários podem fazer upload de avatares" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem visualizar avatares" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem atualizar seus avatares" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem deletar seus avatares" ON storage.objects;

        -- Criar políticas para avatars
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
        
        RAISE NOTICE '✅ Políticas de storage criadas';
    ELSE
        RAISE NOTICE '❌ Tabela storage.policies não existe';
    END IF;
END $$;

-- 4. VERIFICAÇÃO FINAL
DO $$
BEGIN
    -- Verificar buckets
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        RAISE NOTICE '📦 VERIFICAÇÃO FINAL - Buckets: %', (
            SELECT COUNT(*) FROM storage.buckets
        );
    ELSE
        RAISE NOTICE '❌ Tabela storage.buckets não existe';
    END IF;
    
    -- Verificar políticas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
        RAISE NOTICE '🔒 VERIFICAÇÃO FINAL - Políticas: %', (
            SELECT COUNT(*) FROM storage.policies
        );
    ELSE
        RAISE NOTICE '❌ Tabela storage.policies não existe';
    END IF;
END $$;
