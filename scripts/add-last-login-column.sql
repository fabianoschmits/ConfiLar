-- ============================================
-- ADICIONAR COLUNA LAST_LOGIN_AT NA TABELA PROFILES
-- Para controlar inativação automática de disponibilidade
-- ============================================

-- 1. Adicionar coluna last_login_at
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 2. Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at 
  ON public.profiles(last_login_at) 
  WHERE is_available = true;

-- 3. Criar índice composto para consultas de inativação
CREATE INDEX IF NOT EXISTS idx_profiles_availability_login 
  ON public.profiles(is_available, last_login_at);

-- 4. Inicializar last_login_at com a data de criação do perfil para usuários existentes
UPDATE public.profiles
SET last_login_at = created_at
WHERE last_login_at IS NULL;

-- 5. Adicionar comentário na coluna
COMMENT ON COLUMN public.profiles.last_login_at IS 
  'Data e hora do último login do usuário. Usado para inativação automática após 7 dias sem acesso.';

-- ✅ Concluído!
SELECT 
  'Coluna last_login_at adicionada com sucesso!' as status,
  COUNT(*) as total_usuarios,
  COUNT(last_login_at) as usuarios_com_data
FROM public.profiles;


