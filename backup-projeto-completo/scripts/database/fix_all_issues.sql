-- =====================================================
-- CORREÇÃO COMPLETA DE TODOS OS PROBLEMAS
-- =====================================================

-- 1. CORRIGIR TABELA PROFILES E TRIGGER
-- =====================================================

-- Desabilitar trigger problemático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verificar e corrigir estrutura da tabela profiles
DO $$
BEGIN
    -- Verificar se a tabela profiles existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE 'Tabela profiles não existe - criando...';
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            user_type TEXT DEFAULT 'client',
            phone TEXT,
            cpf_cnpj TEXT,
            birth_date TEXT,
            location_state TEXT,
            location_city TEXT,
            neighborhood TEXT,
            bio TEXT,
            address TEXT,
            is_verified BOOLEAN DEFAULT false,
            badge TEXT DEFAULT 'bronze',
            rating DECIMAL(3,2) DEFAULT 0.00,
            total_reviews INTEGER DEFAULT 0,
            is_available BOOLEAN DEFAULT true,
            profile_completed BOOLEAN DEFAULT false,
            profile_completion_score INTEGER DEFAULT 25,
            professional_services TEXT[] DEFAULT '{}',
            client_verification_document TEXT,
            professional_experience_years INTEGER DEFAULT 0,
            professional_certifications TEXT[] DEFAULT '{}',
            professional_portfolio_url TEXT,
            profile_photo_url TEXT,
            selfie_document_url TEXT,
            residence_proof_url TEXT,
            emergency_service BOOLEAN DEFAULT false,
            insurance_coverage TEXT,
            whatsapp TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        RAISE NOTICE 'Tabela profiles já existe - adicionando colunas faltantes...';
        
        -- Adicionar colunas que podem estar faltando
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'client';
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_state TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_city TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'bronze';
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 25;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_services TEXT[] DEFAULT '{}';
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS client_verification_document TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_experience_years INTEGER DEFAULT 0;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_certifications TEXT[] DEFAULT '{}';
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_portfolio_url TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selfie_document_url TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS residence_proof_url TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_service BOOLEAN DEFAULT false;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS insurance_coverage TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
    END IF;
    
    RAISE NOTICE 'Estrutura da tabela profiles verificada e corrigida!';
END $$;

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar/atualizar políticas RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar timestamp
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Criar função simplificada para criar perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir apenas os campos essenciais para evitar erros
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        user_type,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'client'),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Perfil criado com sucesso para usuário: %', NEW.email;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao criar perfil: %', SQLERRM;
        -- Retornar NEW mesmo com erro para não interromper o registro
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger com tratamento de erro
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CORRIGIR STORAGE E POLÍTICAS
-- =====================================================

-- Verificar se o storage está habilitado
DO $$
BEGIN
    -- Verificar se o schema storage existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        RAISE NOTICE '❌ Schema storage não existe - Storage não está habilitado';
        RAISE NOTICE '⚠️ Você precisa habilitar o Storage no Supabase Dashboard';
        RAISE NOTICE '📋 Vá em: Storage > Enable Storage';
        RETURN;
    END IF;
    
    -- Verificar se a tabela buckets existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        RAISE NOTICE '❌ Tabela storage.buckets não existe';
        RAISE NOTICE '⚠️ Storage não foi configurado corretamente';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Storage está habilitado e funcionando';
END $$;

-- Verificar se os buckets existem
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
        VALUES ('feed-images', 'feed-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);
    ELSE
        RAISE NOTICE 'Bucket feed-images já existe';
    END IF;

    -- Verificar bucket verification-docs
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'verification-docs') THEN
        RAISE NOTICE 'Criando bucket verification-docs...';
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('verification-docs', 'verification-docs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']);
    ELSE
        RAISE NOTICE 'Bucket verification-docs já existe';
    END IF;
END $$;

-- Verificar se a tabela storage.policies existe antes de criar políticas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
        RAISE NOTICE '✅ Tabela storage.policies existe - criando políticas...';
        
        -- Remover políticas antigas se existirem
        DROP POLICY IF EXISTS "Usuários podem fazer upload de avatares" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem gerenciar seus avatares" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem fazer upload de imagens de serviço" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem gerenciar imagens de serviço" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem fazer upload de imagens do feed" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem gerenciar imagens do feed" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem fazer upload de documentos" ON storage.objects;
        DROP POLICY IF EXISTS "Usuários podem gerenciar seus documentos" ON storage.objects;

        -- Criar novas políticas para avatars
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

        -- Criar políticas para imagens de serviço
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

        -- Criar políticas para imagens do feed
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

        -- Criar políticas para documentos de verificação
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
        
        RAISE NOTICE '✅ Políticas de storage criadas com sucesso!';
    ELSE
        RAISE NOTICE '❌ Tabela storage.policies não existe';
        RAISE NOTICE '⚠️ Storage não foi configurado corretamente';
        RAISE NOTICE '📋 Habilite o Storage no Supabase Dashboard primeiro';
    END IF;
END $$;

-- 3. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Verificar se o trigger foi criado
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created criado com sucesso';
    ELSE
        RAISE NOTICE '❌ ERRO: Trigger não foi criado';
    END IF;
    
    -- Verificar se a função foi criada
    IF EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user'
    ) THEN
        RAISE NOTICE '✅ Função handle_new_user criada com sucesso';
    ELSE
        RAISE NOTICE '❌ ERRO: Função não foi criada';
    END IF;
    
    -- Verificar estrutura da tabela
    RAISE NOTICE '📋 Estrutura da tabela profiles:';
    RAISE NOTICE 'Colunas encontradas: %', (
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'profiles'
    );
    
    -- Verificar buckets de storage
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        RAISE NOTICE '📦 Buckets de storage criados:';
        RAISE NOTICE 'Buckets encontrados: %', (
            SELECT COUNT(*) 
            FROM storage.buckets
        );
        
        -- Verificar políticas de storage
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
            RAISE NOTICE '🔒 Políticas de storage criadas:';
            RAISE NOTICE 'Políticas encontradas: %', (
                SELECT COUNT(*) 
                FROM storage.policies
            );
        ELSE
            RAISE NOTICE '⚠️ Políticas de storage não foram criadas (storage.policies não existe)';
        END IF;
    ELSE
        RAISE NOTICE '❌ Storage não está habilitado';
    END IF;
    
    RAISE NOTICE '=== VERIFICAÇÃO CONCLUÍDA ===';
END $$;

-- 4. MOSTRAR ESTRUTURA FINAL
-- =====================================================

-- Estrutura da tabela profiles
SELECT 
    'ESTRUTURA FINAL DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Buckets de storage (se existir)
DO $$
DECLARE
    bucket_record RECORD;
    policy_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        RAISE NOTICE '📦 Mostrando buckets de storage:';
        
        -- Mostrar buckets
        RAISE NOTICE 'Buckets encontrados:';
        FOR bucket_record IN SELECT id, name, public, file_size_limit FROM storage.buckets LOOP
            RAISE NOTICE '  - %: % (public: %, max: % bytes)', 
                bucket_record.id, 
                bucket_record.name, 
                bucket_record.public, 
                bucket_record.file_size_limit;
        END LOOP;
        
        -- Mostrar políticas se existirem
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
            RAISE NOTICE 'Políticas encontradas:';
            FOR policy_record IN SELECT bucket_id, name FROM storage.policies ORDER BY bucket_id, name LOOP
                RAISE NOTICE '  - %: %', policy_record.bucket_id, policy_record.name;
            END LOOP;
        END IF;
    ELSE
        RAISE NOTICE '❌ Storage não está habilitado';
    END IF;
END $$;
