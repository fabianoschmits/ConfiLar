-- ============================================
-- ATUALIZAR MILESTONES DO SISTEMA DE REFERRALS
-- ============================================

-- 1. Renomear coluna: first_service_hired -> first_review_made
ALTER TABLE public.referrals 
  RENAME COLUMN first_service_hired TO first_review_made;

-- 2. Atualizar trigger para usar novo nome e descrição
CREATE OR REPLACE FUNCTION award_referral_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Novo cadastro via referral
  IF TG_OP = 'INSERT' THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      50,
      'referral_signup',
      'Nova indicação se cadastrou',
      NEW.id
    );
  END IF;
  
  -- Perfil completado
  IF TG_OP = 'UPDATE' AND NEW.profile_completed = TRUE AND OLD.profile_completed = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      50,
      'profile_completed',
      'Indicação completou o perfil',
      NEW.id
    );
  END IF;
  
  -- Primeiro post
  IF TG_OP = 'UPDATE' AND NEW.first_post_made = TRUE AND OLD.first_post_made = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      30,
      'first_post',
      'Indicação fez o primeiro post',
      NEW.id
    );
  END IF;
  
  -- Primeira avaliação (MUDANÇA AQUI)
  IF TG_OP = 'UPDATE' AND NEW.first_review_made = TRUE AND OLD.first_review_made = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      100,
      'first_review',
      'Indicação fez a primeira avaliação',
      NEW.id
    );
  END IF;
  
  -- 30 dias ativo
  IF TG_OP = 'UPDATE' AND NEW.active_30_days = TRUE AND OLD.active_30_days = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      150,
      'active_30_days',
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

-- 3. Recriar trigger
DROP TRIGGER IF EXISTS on_referral_milestones ON public.referrals;
CREATE TRIGGER on_referral_milestones
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION award_referral_points_trigger();

-- ✅ Concluído!
SELECT 'Milestones atualizados com sucesso!' as status;

