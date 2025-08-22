-- =====================================================
-- CORREÇÃO COMPLETA DA TABELA PROFILES E TRIGGER
-- =====================================================

-- 1. DESABILITAR TEMPORARIAMENTE O TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. VERIFICAR E CORRIGIR A ESTRUTURA DA TABELA PROFILES
-- Primeiro, vamos garantir que a tabela profiles existe com a estrutura correta
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

-- 3. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR/ATUALIZAR POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Política para visualizar perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para atualizar perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para inserir perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CRIAR TRIGGER PARA ATUALIZAR TIMESTAMP
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. CRIAR FUNÇÃO SIMPLIFICADA PARA CRIAR PERFIL
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

-- 8. CRIAR TRIGGER COM TRATAMENTO DE ERRO
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
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
    
    RAISE NOTICE '=== VERIFICAÇÃO CONCLUÍDA ===';
END $$;

-- 10. TESTAR A FUNÇÃO (OPCIONAL - REMOVER EM PRODUÇÃO)
-- SELECT public.handle_new_user();

-- 11. MOSTRAR ESTRUTURA FINAL
SELECT 
    'ESTRUTURA FINAL DA TABELA PROFILES' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;






