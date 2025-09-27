-- CORREÇÃO FINAL - ADICIONAR CAMPOS FALTANTES
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar campo likes_count na tabela post_comments
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Verificação final
SELECT 'Correção final executada com sucesso!' as status;
