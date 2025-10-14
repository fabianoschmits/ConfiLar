-- Script para adicionar campos de soft delete à tabela conversations
-- Isso permite que cada usuário delete a conversa apenas para si

-- Adicionar campos deleted_by_client e deleted_by_professional
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS deleted_by_client BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_by_professional BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at_client TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_at_professional TIMESTAMP WITH TIME ZONE;

-- Criar índices para melhorar performance nas queries de filtro
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_by_client 
ON conversations(deleted_by_client);

CREATE INDEX IF NOT EXISTS idx_conversations_deleted_by_professional 
ON conversations(deleted_by_professional);

-- Comentários descritivos
COMMENT ON COLUMN conversations.deleted_by_client IS 'Indica se o cliente deletou (ocultou) esta conversa da sua lista';
COMMENT ON COLUMN conversations.deleted_by_professional IS 'Indica se o profissional deletou (ocultou) esta conversa da sua lista';
COMMENT ON COLUMN conversations.deleted_at_client IS 'Data/hora em que o cliente deletou a conversa (para filtrar mensagens antigas)';
COMMENT ON COLUMN conversations.deleted_at_professional IS 'Data/hora em que o profissional deletou a conversa (para filtrar mensagens antigas)';

