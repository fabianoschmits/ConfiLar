-- Migration: Adicionar campos country e locale na tabela profiles
-- Data: 2024-01-XX
-- Descrição: Adiciona suporte a múltiplos países e idiomas

-- Adicionar coluna country (país)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'BR' CHECK (country IN ('BR', 'US'));

-- Adicionar coluna locale (idioma)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'pt-BR' CHECK (locale IN ('pt-BR', 'en'));

-- Criar índice para melhorar performance em buscas por país
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- Criar índice para melhorar performance em buscas por locale
CREATE INDEX IF NOT EXISTS idx_profiles_locale ON profiles(locale);

-- Comentários nas colunas
COMMENT ON COLUMN profiles.country IS 'Código do país do usuário (BR, US, etc.)';
COMMENT ON COLUMN profiles.locale IS 'Idioma preferido do usuário (pt-BR, en, etc.)';

