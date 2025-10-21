-- ============================================
-- ADICIONAR 96 INDICAÇÕES FAKE PARA TESTE
-- ============================================

-- Usuário que receberá as indicações: f7444305-a3bd-4d71-874a-bb95fd27f96a

DO $$
DECLARE
  referrer_uuid UUID := 'f7444305-a3bd-4d71-874a-bb95fd27f96a';
  fake_user_id UUID;
  fake_name TEXT;
  referral_code TEXT;
  i INTEGER;
  total_created INTEGER := 0;
  status_choice TEXT;
  days_ago INTEGER;
BEGIN
  RAISE NOTICE '🚀 Iniciando criação de 96 indicações fake...';
  RAISE NOTICE 'Usuário indicador: %', referrer_uuid;
  
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = referrer_uuid) THEN
    RAISE EXCEPTION 'Usuário % não encontrado!', referrer_uuid;
  END IF;
  
  -- Obter código de referral do usuário
  SELECT urs.referral_code INTO referral_code
  FROM user_referral_stats urs
  WHERE urs.user_id = referrer_uuid;
  
  IF referral_code IS NULL THEN
    RAISE EXCEPTION 'Usuário % não tem código de referral!', referrer_uuid;
  END IF;
  
  RAISE NOTICE 'Código de referral: %', referral_code;
  
  -- Array de nomes fake para variedade
  FOR i IN 1..96 LOOP
    -- Gerar UUID fake único
    fake_user_id := gen_random_uuid();
    
    -- Gerar nome fake
    fake_name := 'Indicado ' || i || ' Test';
    
    -- Variar status (80% completed, 15% active, 5% pending)
    IF i <= 77 THEN
      status_choice := 'completed';
    ELSIF i <= 91 THEN
      status_choice := 'active';
    ELSE
      status_choice := 'pending';
    END IF;
    
    -- Calcular dias atrás (distribuído ao longo de 180 dias)
    days_ago := FLOOR(RANDOM() * 180);
    
    -- Inserir na tabela referrals
    INSERT INTO public.referrals (
      id,
      referrer_id,
      referred_id,
      referral_code,
      status,
      profile_completed,
      first_post_made,
      first_service_hired,
      active_30_days,
      created_at,
      activated_at,
      completed_at,
      last_activity_at,
      source,
      metadata
    ) VALUES (
      gen_random_uuid(),
      referrer_uuid,
      fake_user_id,
      referral_code,
      status_choice,
      -- Profile completed (90% sim)
      (RANDOM() < 0.9),
      -- First post (70% sim)
      (RANDOM() < 0.7),
      -- Service hired (40% sim)
      (RANDOM() < 0.4),
      -- Active 30 days (apenas se status completed)
      (status_choice = 'completed'),
      -- Created at (data retroativa)
      NOW() - (days_ago || ' days')::INTERVAL,
      -- Activated at (1-3 dias após created)
      CASE WHEN status_choice != 'pending' 
        THEN NOW() - (days_ago - FLOOR(RANDOM() * 3 + 1) || ' days')::INTERVAL 
        ELSE NULL 
      END,
      -- Completed at (apenas se completed)
      CASE WHEN status_choice = 'completed' 
        THEN NOW() - (GREATEST(days_ago - 35, 0) || ' days')::INTERVAL 
        ELSE NULL 
      END,
      -- Last activity
      NOW() - (FLOOR(RANDOM() * days_ago) || ' days')::INTERVAL,
      -- Source (variar)
      CASE 
        WHEN i % 3 = 0 THEN 'whatsapp'
        WHEN i % 3 = 1 THEN 'telegram'
        ELSE 'link_direto'
      END,
      -- Metadata
      jsonb_build_object(
        'test_data', true,
        'created_by', 'script',
        'fake_user', true
      )
    );
    
    total_created := total_created + 1;
    
    -- Log a cada 10 indicações
    IF i % 10 = 0 THEN
      RAISE NOTICE 'Progresso: % indicações criadas', i;
    END IF;
  END LOOP;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Total de indicações criadas: %', total_created;
  RAISE NOTICE '============================================';
  
  -- Atualizar estatísticas do usuário
  RAISE NOTICE '📊 Atualizando estatísticas...';
  PERFORM update_referral_stats(referrer_uuid);
  
  -- Mostrar resultado final
  RAISE NOTICE '============================================';
  RAISE NOTICE '🎉 PROCESSO CONCLUÍDO!';
  RAISE NOTICE '============================================';
END $$;

-- Verificar resultado
SELECT 
  urs.referral_code,
  p.full_name,
  urs.tier,
  urs.total_referrals,
  urs.active_referrals,
  urs.completed_referrals,
  urs.total_points,
  urs.rank
FROM user_referral_stats urs
JOIN profiles p ON p.id = urs.user_id
WHERE urs.user_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a';

-- Ver distribuição de status das indicações
SELECT 
  status,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / 96, 1) as percentual
FROM referrals
WHERE referrer_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
GROUP BY status
ORDER BY quantidade DESC;

-- Ver indicações recentes
SELECT 
  status,
  profile_completed,
  first_post_made,
  created_at,
  source
FROM referrals
WHERE referrer_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
ORDER BY created_at DESC
LIMIT 10;

-- Ver total geral
SELECT COUNT(*) as total_indicacoes
FROM referrals
WHERE referrer_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a';

