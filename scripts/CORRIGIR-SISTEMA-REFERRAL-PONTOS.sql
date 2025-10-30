-- =============================================
-- CORREÇÃO: Sistema de Referral não estava dando pontos no saldo principal
-- =============================================
-- 
-- PROBLEMA:
-- - Os pontos de referral eram registrados apenas em referral_points_history
-- - NÃO eram adicionados ao saldo principal (user_points_balance)
-- - NÃO apareciam no histórico do dashboard (point_transactions)
-- 
-- SOLUÇÃO:
-- - Modificar a função add_referral_points para TAMBÉM chamar add_points
-- - Isso garante que os pontos sejam:
--   1. Registrados no histórico de referral (referral_points_history)
--   2. Adicionados ao saldo principal (user_points_balance via add_points)
--   3. Registrados no histórico principal (point_transactions via add_points)
-- 
-- =============================================

-- =============================================
-- 1. ATUALIZAR FUNÇÃO add_referral_points
-- =============================================

CREATE OR REPLACE FUNCTION add_referral_points(
  p_user_id UUID,
  p_points INTEGER,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_referral_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- 1. Adicionar ao histórico de referral (para stats específicos)
  INSERT INTO public.referral_points_history (
    user_id,
    referral_id,
    points,
    action_type,
    description
  ) VALUES (
    p_user_id,
    p_referral_id,
    p_points,
    p_action_type,
    p_description
  );
  
  -- 2. Atualizar total de pontos nas stats de referral
  UPDATE public.user_referral_stats
  SET 
    total_points = total_points + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- 3. ✅ NOVO: Adicionar pontos ao saldo principal usando add_points
  -- Isso garante que os pontos apareçam no dashboard e no saldo
  PERFORM add_points(
    p_user_id,
    p_points,
    p_action_type, -- source
    p_description,
    jsonb_build_object(
      'referral_id', p_referral_id,
      'referral_action', p_action_type
    ) -- metadata
  );
  
  RAISE NOTICE '✅ [add_referral_points] % pontos adicionados para usuário % (ação: %)', 
    p_points, p_user_id, p_action_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. ATUALIZAR VALORES DOS PONTOS DE REFERRAL NO TRIGGER
-- =============================================
-- Os valores antigos eram muito baixos (50, 30, 100, 150)
-- Vamos atualizar para valores mais generosos e alinhados com o sistema

CREATE OR REPLACE FUNCTION award_referral_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Novo cadastro via referral: 200 pontos (era 50)
  IF TG_OP = 'INSERT' THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      200, -- Atualizado de 50 para 200
      'referral_signup',
      'Nova indicação se cadastrou',
      NEW.id
    );
  END IF;
  
  -- Perfil completado: 150 pontos (era 50)
  IF TG_OP = 'UPDATE' AND NEW.profile_completed = TRUE AND OLD.profile_completed = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      150, -- Atualizado de 50 para 150
      'referral_profile_completed',
      'Indicação completou o perfil',
      NEW.id
    );
  END IF;
  
  -- Primeiro post: 100 pontos (era 30)
  IF TG_OP = 'UPDATE' AND NEW.first_post_made = TRUE AND OLD.first_post_made = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      100, -- Atualizado de 30 para 100
      'referral_first_post',
      'Indicação fez o primeiro post',
      NEW.id
    );
  END IF;
  
  -- Primeira avaliação: 100 pontos (NOVO)
  IF TG_OP = 'UPDATE' AND NEW.first_review_made = TRUE AND OLD.first_review_made = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      100,
      'referral_first_review',
      'Indicação fez primeira avaliação',
      NEW.id
    );
  END IF;
  
  -- 30 dias ativo: 300 pontos (era 150)
  IF TG_OP = 'UPDATE' AND NEW.active_30_days = TRUE AND OLD.active_30_days = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      300, -- Atualizado de 150 para 300
      'referral_active_30_days',
      'Indicação ativa por 30 dias',
      NEW.id
    );
    
    -- Marcar como completed
    UPDATE public.referrals
    SET 
      status = 'completed',
      completed_at = NOW()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 3. RECRIAR TRIGGER
-- =============================================

DROP TRIGGER IF EXISTS on_referral_milestones ON public.referrals;
CREATE TRIGGER on_referral_milestones
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION award_referral_points_trigger();

-- =============================================
-- 4. MIGRAR PONTOS ANTIGOS (OPCIONAL)
-- =============================================
-- Este bloco adiciona os pontos de referral antigos ao saldo dos usuários
-- Apenas execute se quiser compensar os usuários pelos pontos que não receberam

-- DESCOMENTE AS LINHAS ABAIXO SE QUISER MIGRAR OS PONTOS ANTIGOS:

-- DO $$
-- DECLARE
--   r RECORD;
--   total_migrated INTEGER := 0;
-- BEGIN
--   RAISE NOTICE '🔄 Iniciando migração de pontos de referral antigos...';
--   
--   -- Para cada usuário com pontos de referral no histórico
--   FOR r IN 
--     SELECT 
--       user_id,
--       SUM(points) as total_referral_points
--     FROM public.referral_points_history
--     GROUP BY user_id
--     HAVING SUM(points) > 0
--   LOOP
--     -- Verificar se já tem transações de referral no histórico principal
--     IF NOT EXISTS (
--       SELECT 1 FROM public.point_transactions
--       WHERE user_id = r.user_id
--       AND source LIKE 'referral_%'
--     ) THEN
--       -- Adicionar pontos de migração
--       PERFORM add_points(
--         r.user_id,
--         r.total_referral_points,
--         'referral_migration',
--         format('Migração de %s pontos de referral antigos', r.total_referral_points),
--         jsonb_build_object('migration_date', NOW())
--       );
--       
--       total_migrated := total_migrated + r.total_referral_points;
--       RAISE NOTICE '✅ Migrado: % pontos para usuário %', r.total_referral_points, r.user_id;
--     END IF;
--   END LOOP;
--   
--   RAISE NOTICE '✅ Migração concluída! Total de pontos migrados: %', total_migrated;
-- END $$;

-- =============================================
-- RESUMO DOS VALORES ATUALIZADOS
-- =============================================

/*
┌─────────────────────────────┬──────────┬───────────┐
│ AÇÃO                        │ ANTIGO   │ NOVO      │
├─────────────────────────────┼──────────┼───────────┤
│ Cadastro (signup)           │ 50 pts   │ 200 pts   │
│ Perfil completado           │ 50 pts   │ 150 pts   │
│ Primeiro post               │ 30 pts   │ 100 pts   │
│ Primeira avaliação          │ 100 pts  │ 100 pts   │
│ 30 dias ativo               │ 150 pts  │ 300 pts   │
├─────────────────────────────┼──────────┼───────────┤
│ TOTAL POR INDICAÇÃO COMPLETA│ 330 pts  │ 850 pts   │
└─────────────────────────────┴──────────┴───────────┘

✅ AGORA os pontos de referral:
   1. Aparecem no histórico do dashboard
   2. São adicionados ao saldo principal
   3. Funcionam como qualquer outro tipo de ponto
   4. Valores mais generosos para incentivar indicações
*/

