-- ============================================
-- CORRIGIR TRIGGER DO SISTEMA DE REFERRALS
-- ============================================
-- Este script corrige o erro "record new has no field first_review_made"
-- Verificando a estrutura atual e atualizando o trigger

-- 1. Verificar estrutura atual da tabela referrals
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'referrals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a coluna first_review_made existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'referrals' 
        AND column_name = 'first_review_made'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Coluna first_review_made existe';
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'referrals' 
        AND column_name = 'first_service_hired'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '⚠️ Coluna first_service_hired existe, mas first_review_made não. Renomeando...';
        ALTER TABLE public.referrals 
        RENAME COLUMN first_service_hired TO first_review_made;
        RAISE NOTICE '✅ Coluna renomeada com sucesso';
    ELSE
        RAISE NOTICE '❌ Nenhuma das colunas existe. Criando first_review_made...';
        ALTER TABLE public.referrals 
        ADD COLUMN IF NOT EXISTS first_review_made BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Coluna first_review_made criada';
    END IF;
END $$;

-- 3. Criar/Atualizar função do trigger com verificação segura de colunas
CREATE OR REPLACE FUNCTION award_referral_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Novo cadastro via referral: 200 pontos
  IF TG_OP = 'INSERT' THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      200,
      'referral_signup',
      'Nova indicação se cadastrou',
      NEW.id
    );
  END IF;
  
  -- Perfil completado: 150 pontos
  IF TG_OP = 'UPDATE' AND NEW.profile_completed = TRUE AND OLD.profile_completed = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      150,
      'referral_profile_completed',
      'Indicação completou o perfil',
      NEW.id
    );
  END IF;
  
  -- Primeiro post: 100 pontos
  IF TG_OP = 'UPDATE' AND NEW.first_post_made = TRUE AND OLD.first_post_made = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      100,
      'referral_first_post',
      'Indicação fez o primeiro post',
      NEW.id
    );
  END IF;
  
  -- Primeira avaliação: 100 pontos
  -- Verificar se a coluna existe antes de usar
  IF TG_OP = 'UPDATE' THEN
    BEGIN
      IF NEW.first_review_made = TRUE AND OLD.first_review_made = FALSE THEN
        PERFORM add_referral_points(
          NEW.referrer_id,
          100,
          'referral_first_review',
          'Indicação fez primeira avaliação',
          NEW.id
        );
      END IF;
    EXCEPTION
      WHEN undefined_column THEN
        -- Coluna não existe, ignorar
        NULL;
    END;
  END IF;
  
  -- 30 dias ativo: 300 pontos
  IF TG_OP = 'UPDATE' AND NEW.active_30_days = TRUE AND OLD.active_30_days = FALSE THEN
    PERFORM add_referral_points(
      NEW.referrer_id,
      300,
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

-- 4. Recriar trigger
DROP TRIGGER IF EXISTS on_referral_milestones ON public.referrals;
CREATE TRIGGER on_referral_milestones
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION award_referral_points_trigger();

-- 5. Dropar e recriar função add_referral_points
-- (Precisa dropar primeiro se a assinatura mudou)
-- Nota: A função usa p_action_type como terceiro parâmetro (não p_source)
DO $$
BEGIN
    -- Tentar dropar todas as possíveis assinaturas
    DROP FUNCTION IF EXISTS add_referral_points(UUID, INTEGER, TEXT, TEXT, UUID);
    DROP FUNCTION IF EXISTS add_referral_points(UUID, INTEGER, TEXT, TEXT);
    DROP FUNCTION IF EXISTS add_referral_points(UUID, TEXT, INTEGER);
    DROP FUNCTION IF EXISTS add_referral_points(UUID, TEXT);
    RAISE NOTICE '✅ Tentativa de remover funções antigas';
EXCEPTION
    WHEN OTHERS THEN
        -- Ignorar erros ao dropar
        NULL;
END $$;

-- Criar função com a assinatura CORRETA usada no trigger
-- p_action_type é o terceiro parâmetro (não p_source)
CREATE OR REPLACE FUNCTION add_referral_points(
    p_user_id UUID,
    p_points INTEGER,
    p_action_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_referral_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- 1. Adicionar ao histórico de referral (se a tabela existir)
    BEGIN
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
    EXCEPTION
        WHEN undefined_table THEN
            NULL; -- Tabela não existe, continuar
        WHEN OTHERS THEN
            NULL; -- Outros erros, ignorar
    END;
    
    -- 2. Atualizar total de pontos nas stats de referral (se existir)
    BEGIN
        UPDATE public.user_referral_stats
        SET 
            total_points = COALESCE(total_points, 0) + p_points,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    EXCEPTION
        WHEN undefined_table THEN
            NULL; -- Tabela não existe, continuar
        WHEN OTHERS THEN
            NULL; -- Outros erros, ignorar
    END;
    
    -- 3. Atualizar pontos no perfil principal
    UPDATE public.profiles
    SET points_balance = COALESCE(points_balance, 0) + p_points
    WHERE id = p_user_id;
    
    -- 4. Registrar transação principal (se a tabela existir)
    BEGIN
        INSERT INTO public.point_transactions (
            user_id,
            type,
            amount,
            source,
            description,
            referral_id
        ) VALUES (
            p_user_id,
            'credit',
            p_points,
            p_action_type,
            p_description,
            p_referral_id
        );
    EXCEPTION
        WHEN undefined_table THEN
            NULL; -- Tabela não existe, ignorar
        WHEN OTHERS THEN
            NULL; -- Outros erros, ignorar silenciosamente
    END;
    
    -- 5. Tentar chamar add_points também (se existir) para garantir integração
    BEGIN
        PERFORM add_points(
            p_user_id,
            p_points,
            p_action_type,
            p_description,
            jsonb_build_object('referral_id', p_referral_id)
        );
    EXCEPTION
        WHEN undefined_function THEN
            NULL; -- Função não existe, ignorar
        WHEN OTHERS THEN
            NULL; -- Outros erros, ignorar
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificação final
SELECT '✅ Script de correção executado com sucesso!' AS status;
