-- Migration: Adicionar campos de redes sociais na tabela profiles
-- Data: 2026-02-03
-- Descrição: Adiciona suporte para vincular contas de redes sociais aos perfis

-- Adicionar colunas para redes sociais
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- Adicionar constraints de validação para URLs
ALTER TABLE profiles
ADD CONSTRAINT check_instagram_url CHECK (instagram_url IS NULL OR instagram_url ~* '^https?://(www\.)?(instagram\.com|instagr\.am)/'),
ADD CONSTRAINT check_facebook_url CHECK (facebook_url IS NULL OR facebook_url ~* '^https?://(www\.)?facebook\.com/'),
ADD CONSTRAINT check_linkedin_url CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://(www\.)?linkedin\.com/'),
ADD CONSTRAINT check_twitter_url CHECK (twitter_url IS NULL OR twitter_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/'),
ADD CONSTRAINT check_youtube_url CHECK (youtube_url IS NULL OR youtube_url ~* '^https?://(www\.)?youtube\.com/'),
ADD CONSTRAINT check_tiktok_url CHECK (tiktok_url IS NULL OR tiktok_url ~* '^https?://(www\.)?tiktok\.com/');

-- Comentários nas colunas
COMMENT ON COLUMN profiles.instagram_url IS 'URL do perfil do Instagram do usuário';
COMMENT ON COLUMN profiles.facebook_url IS 'URL do perfil do Facebook do usuário';
COMMENT ON COLUMN profiles.linkedin_url IS 'URL do perfil do LinkedIn do usuário';
COMMENT ON COLUMN profiles.twitter_url IS 'URL do perfil do Twitter/X do usuário';
COMMENT ON COLUMN profiles.youtube_url IS 'URL do canal do YouTube do usuário';
COMMENT ON COLUMN profiles.tiktok_url IS 'URL do perfil do TikTok do usuário';
COMMENT ON COLUMN profiles.whatsapp_number IS 'Número do WhatsApp do usuário (formato internacional)';
