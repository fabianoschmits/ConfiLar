-- Adicionar coluna gender na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- Comentário para documentar a coluna
COMMENT ON COLUMN profiles.gender IS 'Gênero do usuário: male, female, other';
