-- Adicionar coluna location_country à tabela feed_posts
ALTER TABLE feed_posts
ADD COLUMN IF NOT EXISTS location_country TEXT;

-- Criar índice para melhorar performance de buscas por país
CREATE INDEX IF NOT EXISTS idx_feed_posts_location_country 
ON feed_posts(location_country);

-- Atualizar posts existentes com o país baseado no perfil do usuário
-- Assumindo que posts do Brasil devem ter 'BR' e posts dos EUA devem ter 'US'
UPDATE feed_posts
SET location_country = 'BR'
WHERE location_country IS NULL;

-- Comentário: A coluna location_country será preenchida automaticamente
-- quando novos posts forem criados, usando o país do perfil do usuário

