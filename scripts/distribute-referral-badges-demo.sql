-- ============================================
-- DISTRIBUIR BADGES DE INDICAÇÃO ENTRE USUÁRIOS
-- Criando um exemplo visual realista
-- ============================================

-- Estratégia de Distribuição:
-- 1 Diamante (50+ indicações)
-- 2 Platina (25-49 indicações)
-- 3 Ouro (10-24 indicações)
-- 5 Prata (5-9 indicações)
-- 8 Bronze (1-4 indicações)
-- Resto: sem indicações (none)

DO $$
DECLARE
  all_users UUID[];
  available_users UUID[];
  current_referrer UUID;
  current_referred UUID;
  referrer_code TEXT;
  target_count INTEGER;
  actual_count INTEGER;
  user_index INTEGER := 1;
  total_referrals_created INTEGER := 0;
BEGIN
  RAISE NOTICE '🚀 Iniciando distribuição de badges de indicação...';
  RAISE NOTICE '============================================';
  
  -- Buscar todos os usuários que TÊM código de referral
  SELECT ARRAY_AGG(p.id ORDER BY p.created_at DESC) INTO all_users
  FROM profiles p
  INNER JOIN user_referral_stats urs ON urs.user_id = p.id;
  
  RAISE NOTICE '📊 Total de usuários no sistema: %', array_length(all_users, 1);
  
  -- Verificar se temos usuários suficientes
  IF array_length(all_users, 1) < 20 THEN
    RAISE EXCEPTION 'São necessários pelo menos 20 usuários com código de referral. Execute primeiro: populate-existing-users-referral.sql';
  END IF;
  
  RAISE NOTICE '============================================';
  
  -- ========================================
  -- 1. CRIAR 1 DIAMANTE (87 indicações)
  -- ========================================
  RAISE NOTICE '💎 Criando 1 usuário DIAMANTE (87 indicações)...';
  current_referrer := all_users[user_index];
  user_index := user_index + 1;
  
  -- Obter código do indicador
  SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = current_referrer;
  
  IF referrer_code IS NULL THEN
    RAISE EXCEPTION 'Usuário DIAMANTE não tem código de referral!';
  END IF;
  
  -- Criar 87 indicações usando os próximos 87 usuários
  target_count := LEAST(87, array_length(all_users, 1) - user_index);
  actual_count := 0;
  
  FOR i IN 1..target_count LOOP
    current_referred := all_users[user_index];
    user_index := user_index + 1;
    
    BEGIN
      INSERT INTO referrals (
        referrer_id, referred_id, referral_code, status,
        profile_completed, first_post_made, active_30_days,
        created_at, activated_at, completed_at,
        source, metadata
      ) VALUES (
        current_referrer, current_referred, referrer_code,
        CASE WHEN i <= 70 THEN 'completed' WHEN i <= 83 THEN 'active' ELSE 'pending' END,
        true, (RANDOM() < 0.8), (i <= 70),
        NOW() - (FLOOR(RANDOM() * 180) || ' days')::INTERVAL,
        NOW() - (FLOOR(RANDOM() * 170) || ' days')::INTERVAL,
        CASE WHEN i <= 70 THEN NOW() - (FLOOR(RANDOM() * 100) || ' days')::INTERVAL ELSE NULL END,
        (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + FLOOR(RANDOM() * 3)::INTEGER],
        '{"demo": true}'::jsonb
      );
      actual_count := actual_count + 1;
      total_referrals_created := total_referrals_created + 1;
    EXCEPTION WHEN unique_violation THEN
      RAISE NOTICE 'Duplicata ignorada';
    END;
  END LOOP;
  
  PERFORM update_referral_stats(current_referrer);
  RAISE NOTICE '✅ Criadas % indicações para usuário DIAMANTE', actual_count;
  
  -- ========================================
  -- 2. CRIAR 2 PLATINA (32 e 28 indicações)
  -- ========================================
  RAISE NOTICE '💎 Criando 2 usuários PLATINA...';
  
  FOR platinum_user IN 1..2 LOOP
    IF user_index > array_length(all_users, 1) THEN EXIT; END IF;
    
    current_referrer := all_users[user_index];
    user_index := user_index + 1;
    
    SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = current_referrer;
    
    IF referrer_code IS NULL THEN
      RAISE NOTICE 'Usuário PLATINA % não tem código, pulando...', platinum_user;
      CONTINUE;
    END IF;
    
    target_count := CASE WHEN platinum_user = 1 THEN 32 ELSE 28 END;
    target_count := LEAST(target_count, array_length(all_users, 1) - user_index);
    actual_count := 0;
    
    FOR i IN 1..target_count LOOP
      IF user_index > array_length(all_users, 1) THEN EXIT; END IF;
      
      current_referred := all_users[user_index];
      user_index := user_index + 1;
      
      BEGIN
        INSERT INTO referrals (
          referrer_id, referred_id, referral_code, status,
          profile_completed, first_post_made, active_30_days,
          created_at, activated_at, completed_at,
          source, metadata
        ) VALUES (
          current_referrer, current_referred, referrer_code,
          CASE WHEN i <= (target_count * 0.75) THEN 'completed' WHEN i <= (target_count * 0.9) THEN 'active' ELSE 'pending' END,
          true, (RANDOM() < 0.7), (i <= (target_count * 0.75)),
          NOW() - (FLOOR(RANDOM() * 150) || ' days')::INTERVAL,
          NOW() - (FLOOR(RANDOM() * 140) || ' days')::INTERVAL,
          CASE WHEN i <= (target_count * 0.75) THEN NOW() - (FLOOR(RANDOM() * 90) || ' days')::INTERVAL ELSE NULL END,
          (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + FLOOR(RANDOM() * 3)::INTEGER],
          '{"demo": true}'::jsonb
        );
        actual_count := actual_count + 1;
        total_referrals_created := total_referrals_created + 1;
      EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'Duplicata ignorada';
      END;
    END LOOP;
    
    PERFORM update_referral_stats(current_referrer);
    RAISE NOTICE '✅ PLATINA %: % indicações', platinum_user, actual_count;
  END LOOP;
  
  -- Resetar índice para reutilizar usuários restantes
  -- (vamos criar indicações cruzadas para os próximos níveis)
  available_users := all_users[user_index:array_length(all_users, 1)];
  
  -- ========================================
  -- 3. CRIAR 3 OURO (18, 15, 12 indicações)
  -- ========================================
  RAISE NOTICE '🥇 Criando 3 usuários OURO...';
  
  FOR gold_idx IN 1..3 LOOP
    IF array_length(available_users, 1) < gold_idx THEN EXIT; END IF;
    
    current_referrer := available_users[gold_idx];
    SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = current_referrer;
    
    IF referrer_code IS NULL THEN
      RAISE NOTICE 'Usuário OURO % não tem código, pulando...', gold_idx;
      CONTINUE;
    END IF;
    
    target_count := CASE WHEN gold_idx = 1 THEN 18 WHEN gold_idx = 2 THEN 15 ELSE 12 END;
    actual_count := 0;
    
    -- Usar outros usuários do array como indicados
    FOR i IN 1..target_count LOOP
      -- Pegar usuário aleatório do array (que não seja o próprio)
      current_referred := available_users[1 + FLOOR(RANDOM() * array_length(available_users, 1))];
      
      IF current_referred = current_referrer THEN CONTINUE; END IF;
      
      BEGIN
        INSERT INTO referrals (
          referrer_id, referred_id, referral_code, status,
          profile_completed, first_post_made, active_30_days,
          created_at, activated_at, completed_at,
          source, metadata
        ) VALUES (
          current_referrer, current_referred, referrer_code,
          CASE WHEN i <= (target_count * 0.7) THEN 'completed' WHEN i <= (target_count * 0.85) THEN 'active' ELSE 'pending' END,
          (RANDOM() < 0.85), (RANDOM() < 0.6), (i <= (target_count * 0.7)),
          NOW() - (FLOOR(RANDOM() * 120) || ' days')::INTERVAL,
          NOW() - (FLOOR(RANDOM() * 110) || ' days')::INTERVAL,
          CASE WHEN i <= (target_count * 0.7) THEN NOW() - (FLOOR(RANDOM() * 80) || ' days')::INTERVAL ELSE NULL END,
          (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + FLOOR(RANDOM() * 3)::INTEGER],
          '{"demo": true}'::jsonb
        );
        actual_count := actual_count + 1;
        total_referrals_created := total_referrals_created + 1;
      EXCEPTION WHEN unique_violation THEN
        -- Ignorar duplicatas
      END;
    END LOOP;
    
    PERFORM update_referral_stats(current_referrer);
    RAISE NOTICE '✅ OURO %: % indicações', gold_idx, actual_count;
  END LOOP;
  
  -- ========================================
  -- 4. CRIAR 5 PRATA (7, 6, 6, 5, 5 indicações)
  -- ========================================
  RAISE NOTICE '🥈 Criando 5 usuários PRATA...';
  
  FOR silver_idx IN 4..8 LOOP
    IF array_length(available_users, 1) < silver_idx THEN EXIT; END IF;
    
    current_referrer := available_users[silver_idx];
    SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = current_referrer;
    
    IF referrer_code IS NULL THEN
      RAISE NOTICE 'Usuário PRATA % não tem código, pulando...', silver_idx - 3;
      CONTINUE;
    END IF;
    
    target_count := CASE WHEN silver_idx <= 5 THEN 7 WHEN silver_idx <= 7 THEN 6 ELSE 5 END;
    actual_count := 0;
    
    FOR i IN 1..target_count LOOP
      current_referred := available_users[1 + FLOOR(RANDOM() * array_length(available_users, 1))];
      
      IF current_referred = current_referrer THEN CONTINUE; END IF;
      
      BEGIN
        INSERT INTO referrals (
          referrer_id, referred_id, referral_code, status,
          profile_completed, first_post_made, active_30_days,
          created_at, activated_at, completed_at,
          source, metadata
        ) VALUES (
          current_referrer, current_referred, referrer_code,
          CASE WHEN i <= (target_count * 0.6) THEN 'completed' WHEN i <= (target_count * 0.8) THEN 'active' ELSE 'pending' END,
          (RANDOM() < 0.8), (RANDOM() < 0.5), (i <= (target_count * 0.6)),
          NOW() - (FLOOR(RANDOM() * 90) || ' days')::INTERVAL,
          NOW() - (FLOOR(RANDOM() * 80) || ' days')::INTERVAL,
          CASE WHEN i <= (target_count * 0.6) THEN NOW() - (FLOOR(RANDOM() * 60) || ' days')::INTERVAL ELSE NULL END,
          (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + FLOOR(RANDOM() * 3)::INTEGER],
          '{"demo": true}'::jsonb
        );
        actual_count := actual_count + 1;
        total_referrals_created := total_referrals_created + 1;
      EXCEPTION WHEN unique_violation THEN
        -- Ignorar duplicatas
      END;
    END LOOP;
    
    PERFORM update_referral_stats(current_referrer);
    RAISE NOTICE '✅ PRATA %: % indicações', silver_idx - 3, actual_count;
  END LOOP;
  
  -- ========================================
  -- 5. CRIAR 8 BRONZE (3, 3, 2, 2, 2, 1, 1, 1 indicações)
  -- ========================================
  RAISE NOTICE '🥉 Criando 8 usuários BRONZE...';
  
  FOR bronze_idx IN 9..16 LOOP
    IF array_length(available_users, 1) < bronze_idx THEN EXIT; END IF;
    
    current_referrer := available_users[bronze_idx];
    SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = current_referrer;
    
    IF referrer_code IS NULL THEN
      RAISE NOTICE 'Usuário BRONZE % não tem código, pulando...', bronze_idx - 8;
      CONTINUE;
    END IF;
    
    target_count := CASE 
      WHEN bronze_idx <= 10 THEN 3
      WHEN bronze_idx <= 13 THEN 2
      ELSE 1 
    END;
    actual_count := 0;
    
    FOR i IN 1..target_count LOOP
      current_referred := available_users[1 + FLOOR(RANDOM() * array_length(available_users, 1))];
      
      IF current_referred = current_referrer THEN CONTINUE; END IF;
      
      BEGIN
        INSERT INTO referrals (
          referrer_id, referred_id, referral_code, status,
          profile_completed, first_post_made, active_30_days,
          created_at, activated_at, completed_at,
          source, metadata
        ) VALUES (
          current_referrer, current_referred, referrer_code,
          CASE WHEN i = 1 THEN 'completed' WHEN i = 2 THEN 'active' ELSE 'pending' END,
          (RANDOM() < 0.7), (RANDOM() < 0.4), (i = 1),
          NOW() - (FLOOR(RANDOM() * 60) || ' days')::INTERVAL,
          NOW() - (FLOOR(RANDOM() * 50) || ' days')::INTERVAL,
          CASE WHEN i = 1 THEN NOW() - (FLOOR(RANDOM() * 40) || ' days')::INTERVAL ELSE NULL END,
          (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + FLOOR(RANDOM() * 3)::INTEGER],
          '{"demo": true}'::jsonb
        );
        actual_count := actual_count + 1;
        total_referrals_created := total_referrals_created + 1;
      EXCEPTION WHEN unique_violation THEN
        -- Ignorar duplicatas
      END;
    END LOOP;
    
    PERFORM update_referral_stats(current_referrer);
    RAISE NOTICE '✅ BRONZE %: % indicações', bronze_idx - 8, actual_count;
  END LOOP;
  
  -- Atualizar rankings globais
  RAISE NOTICE '============================================';
  RAISE NOTICE '🏆 Atualizando rankings...';
  PERFORM update_referral_rankings();
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '🎉 PROCESSO CONCLUÍDO!';
  RAISE NOTICE 'Total de indicações criadas: %', total_referrals_created;
  RAISE NOTICE '============================================';
END $$;

-- ============================================
-- VERIFICAR RESULTADOS
-- ============================================

-- Mostrar distribuição de tiers
SELECT 
  tier,
  COUNT(*) as quantidade,
  STRING_AGG(p.full_name, ', ' ORDER BY urs.total_referrals DESC) as usuarios
FROM user_referral_stats urs
JOIN profiles p ON p.id = urs.user_id
WHERE tier != 'none'
GROUP BY tier
ORDER BY 
  CASE tier
    WHEN 'diamond' THEN 1
    WHEN 'platinum' THEN 2
    WHEN 'gold' THEN 3
    WHEN 'silver' THEN 4
    WHEN 'bronze' THEN 5
    ELSE 6
  END;

-- Top 10 indicadores
SELECT 
  p.full_name,
  urs.tier,
  urs.total_referrals,
  urs.total_points,
  urs.rank,
  urs.referral_code
FROM user_referral_stats urs
JOIN profiles p ON p.id = urs.user_id
WHERE urs.total_referrals > 0
ORDER BY urs.total_referrals DESC, urs.total_points DESC
LIMIT 10;

-- Estatísticas gerais
SELECT 
  COUNT(*) as total_users_with_referrals,
  SUM(total_referrals) as total_all_referrals,
  AVG(total_referrals) as avg_referrals,
  MAX(total_referrals) as max_referrals,
  SUM(total_points) as total_all_points
FROM user_referral_stats
WHERE total_referrals > 0;

-- Contagem por tier
SELECT 
  tier,
  COUNT(*) as usuarios,
  MIN(total_referrals) as min_refs,
  MAX(total_referrals) as max_refs,
  AVG(total_referrals)::INTEGER as avg_refs
FROM user_referral_stats
GROUP BY tier
ORDER BY 
  CASE tier
    WHEN 'diamond' THEN 1
    WHEN 'platinum' THEN 2
    WHEN 'gold' THEN 3
    WHEN 'silver' THEN 4
    WHEN 'bronze' THEN 5
    ELSE 6
  END;

