-- ============================================
-- FUNÇÃO PÚBLICA PARA ESTATÍSTICAS DO PROGRAMA DE INDICAÇÕES
-- ============================================
-- 
-- OBJETIVO:
-- Criar uma função RPC pública que retorna estatísticas agregadas
-- do programa de indicações para exibir na página inicial
--
-- PERMISSÕES:
-- SECURITY DEFINER permite que a função execute com permissões
-- do criador (admin), permitindo acesso a dados agregados
-- mesmo para usuários anônimos
-- ============================================

-- Função para obter estatísticas públicas do programa de indicações
CREATE OR REPLACE FUNCTION public.get_public_referral_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Permite acesso mesmo para usuários anônimos
SET search_path = public
AS $$
DECLARE
  v_total_referrals INTEGER;
  v_total_users_participating INTEGER;
  v_result JSON;
BEGIN
  -- Contar total de indicações registradas
  SELECT COUNT(*) INTO v_total_referrals
  FROM public.referrals;
  
  -- Contar usuários que participam do programa (têm indicações)
  SELECT COUNT(DISTINCT user_id) INTO v_total_users_participating
  FROM public.user_referral_stats
  WHERE total_referrals > 0;
  
  -- Se não houver dados em user_referral_stats, usar profiles como fallback
  IF v_total_users_participating = 0 THEN
    SELECT COUNT(*) INTO v_total_users_participating
    FROM public.profiles
    WHERE referral_code IS NOT NULL;
  END IF;
  
  -- Retornar resultado em formato JSON
  v_result := json_build_object(
    'total_referrals', COALESCE(v_total_referrals, 0),
    'total_users_participating', COALESCE(v_total_users_participating, 0)
  );
  
  RETURN v_result;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.get_public_referral_stats() IS 
'Função pública para obter estatísticas agregadas do programa de indicações.
Retorna contagens totais de indicações e usuários participando.
Pode ser chamada por usuários anônimos (não logados) para exibir na página inicial.';

-- Garantir que a função pode ser chamada por anônimos
GRANT EXECUTE ON FUNCTION public.get_public_referral_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_referral_stats() TO authenticated;

-- Verificação
DO $$
BEGIN
  RAISE NOTICE '✅ Função get_public_referral_stats() criada com sucesso!';
  RAISE NOTICE '✅ Permissões concedidas para anon e authenticated';
END $$;

