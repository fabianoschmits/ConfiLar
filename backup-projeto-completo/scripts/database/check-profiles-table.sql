-- Script para verificar e corrigir a tabela profiles
-- Execute no SQL Editor do Supabase como usuário postgres

-- ========================================
-- 1. VERIFICAR ESTRUTURA ATUAL
-- ========================================

-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- Verificar estrutura atual
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ========================================
-- 2. CRIAR TABELA SE NÃO EXISTIR
-- ========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('client', 'professional')),
  phone TEXT,
  cpf_cnpj TEXT,
  birth_date TEXT,
  location_state TEXT,
  location_city TEXT,
  neighborhood TEXT,
  bio TEXT,
  professional_services TEXT[],
  professional_experience_years TEXT,
  emergency_service BOOLEAN DEFAULT false,
  insurance_coverage BOOLEAN DEFAULT false,
  profile_completion_score INTEGER DEFAULT 0,
  profile_photo_url TEXT,
  selfie_document_url TEXT,
  residence_proof_url TEXT,
  client_verification_document TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. ADICIONAR COLUNAS FALTANTES
-- ========================================

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
  -- professional_services
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'professional_services') THEN
    ALTER TABLE profiles ADD COLUMN professional_services TEXT[];
  END IF;
  
  -- professional_experience_years
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'professional_experience_years') THEN
    ALTER TABLE profiles ADD COLUMN professional_experience_years TEXT;
  END IF;
  
  -- emergency_service
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'emergency_service') THEN
    ALTER TABLE profiles ADD COLUMN emergency_service BOOLEAN DEFAULT false;
  END IF;
  
  -- insurance_coverage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'insurance_coverage') THEN
    ALTER TABLE profiles ADD COLUMN insurance_coverage BOOLEAN DEFAULT false;
  END IF;
  
  -- profile_completion_score
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_completion_score') THEN
    ALTER TABLE profiles ADD COLUMN profile_completion_score INTEGER DEFAULT 0;
  END IF;
  
  -- profile_photo_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_photo_url') THEN
    ALTER TABLE profiles ADD COLUMN profile_photo_url TEXT;
  END IF;
  
  -- selfie_document_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'selfie_document_url') THEN
    ALTER TABLE profiles ADD COLUMN selfie_document_url TEXT;
  END IF;
  
  -- residence_proof_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'residence_proof_url') THEN
    ALTER TABLE profiles ADD COLUMN residence_proof_url TEXT;
  END IF;
  
  -- client_verification_document
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'client_verification_document') THEN
    ALTER TABLE profiles ADD COLUMN client_verification_document TEXT;
  END IF;
  
  -- created_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- updated_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- ========================================
-- 4. HABILITAR RLS E CRIAR POLÍTICAS
-- ========================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios perfis
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política: Usuários podem inserir seus próprios perfis
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política: Usuários podem atualizar seus próprios perfis
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política: Usuários podem deletar seus próprios perfis
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ========================================
-- 5. CRIAR FUNÇÃO DE TRIGGER PARA UPDATED_AT
-- ========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ========================================
-- 6. VERIFICAR ESTRUTURA FINAL
-- ========================================

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';
