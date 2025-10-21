-- ============================================
-- DISTRIBUIR BADGES - VERSÃO OTIMIZADA
-- Para usar com poucos usuários (44 total)
-- ============================================

DO $$
DECLARE
  all_users_list UUID[];
  user_1 UUID; user_2 UUID; user_3 UUID; user_4 UUID; user_5 UUID;
  user_6 UUID; user_7 UUID; user_8 UUID; user_9 UUID; user_10 UUID;
  user_11 UUID; user_12 UUID; user_13 UUID; user_14 UUID; user_15 UUID;
  user_16 UUID; user_17 UUID; user_18 UUID; user_19 UUID;
  referrer_code TEXT;
  pool_users UUID[];
  selected_user UUID;
  created_count INTEGER;
BEGIN
  RAISE NOTICE '🚀 Distribuindo badges entre usuários...';
  
  -- Buscar todos os usuários com código de referral
  SELECT ARRAY_AGG(p.id ORDER BY p.created_at DESC) INTO all_users_list
  FROM profiles p
  INNER JOIN user_referral_stats urs ON urs.user_id = p.id;
  
  RAISE NOTICE '📊 Total de usuários: %', array_length(all_users_list, 1);
  
  IF array_length(all_users_list, 1) < 19 THEN
    RAISE EXCEPTION 'Necessário pelo menos 19 usuários';
  END IF;
  
  -- Atribuir usuários específicos
  user_1 := all_users_list[1];   -- DIAMANTE
  user_2 := all_users_list[2];   -- PLATINA 1
  user_3 := all_users_list[3];   -- PLATINA 2
  user_4 := all_users_list[4];   -- OURO 1
  user_5 := all_users_list[5];   -- OURO 2
  user_6 := all_users_list[6];   -- OURO 3
  user_7 := all_users_list[7];   -- PRATA 1
  user_8 := all_users_list[8];   -- PRATA 2
  user_9 := all_users_list[9];   -- PRATA 3
  user_10 := all_users_list[10]; -- PRATA 4
  user_11 := all_users_list[11]; -- PRATA 5
  user_12 := all_users_list[12]; -- BRONZE 1
  user_13 := all_users_list[13]; -- BRONZE 2
  user_14 := all_users_list[14]; -- BRONZE 3
  user_15 := all_users_list[15]; -- BRONZE 4
  user_16 := all_users_list[16]; -- BRONZE 5
  user_17 := all_users_list[17]; -- BRONZE 6
  user_18 := all_users_list[18]; -- BRONZE 7
  user_19 := all_users_list[19]; -- BRONZE 8
  
  -- Pool de usuários para serem "indicados" (reutilizáveis)
  pool_users := all_users_list[2:array_length(all_users_list, 1)];
  
  RAISE NOTICE '============================================';
  
  -- ========================================
  -- 1. DIAMANTE: 87 indicações
  -- ========================================
  RAISE NOTICE '💠 Criando DIAMANTE (87 indicações)...';
  SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = user_1;
  created_count := 0;
  
  FOR i IN 1..87 LOOP
    selected_user := pool_users[1 + (i % array_length(pool_users, 1))];
    
    -- Evitar auto-referral
    IF selected_user = user_1 THEN CONTINUE; END IF;
    
    BEGIN
      INSERT INTO referrals (referrer_id, referred_id, referral_code, status, profile_completed, first_post_made, active_30_days, created_at, activated_at, completed_at, source)
      VALUES (user_1, selected_user, referrer_code, 
        CASE WHEN i <= 70 THEN 'completed' WHEN i <= 83 THEN 'active' ELSE 'pending' END,
        true, (i <= 65), (i <= 70),
        NOW() - (FLOOR(RANDOM() * 180) || ' days')::INTERVAL,
        NOW() - (FLOOR(RANDOM() * 170) || ' days')::INTERVAL,
        CASE WHEN i <= 70 THEN NOW() - (FLOOR(RANDOM() * 100) || ' days')::INTERVAL ELSE NULL END,
        (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + (i % 3)]);
      created_count := created_count + 1;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;
  PERFORM update_referral_stats(user_1);
  RAISE NOTICE '✅ Diamante: % indicações', created_count;
  
  -- ========================================
  -- 2. PLATINA 1: 35 indicações
  -- ========================================
  RAISE NOTICE '💎 Criando PLATINA 1 (35 indicações)...';
  SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = user_2;
  created_count := 0;
  
  FOR i IN 1..35 LOOP
    selected_user := pool_users[1 + ((i * 7) % array_length(pool_users, 1))];
    
    IF selected_user = user_2 THEN CONTINUE; END IF;
    
    BEGIN
      INSERT INTO referrals (referrer_id, referred_id, referral_code, status, profile_completed, first_post_made, active_30_days, created_at, activated_at, completed_at, source)
      VALUES (user_2, selected_user, referrer_code,
        CASE WHEN i <= 27 THEN 'completed' WHEN i <= 32 THEN 'active' ELSE 'pending' END,
        true, (i <= 25), (i <= 27),
        NOW() - (FLOOR(RANDOM() * 150) || ' days')::INTERVAL,
        NOW() - (FLOOR(RANDOM() * 140) || ' days')::INTERVAL,
        CASE WHEN i <= 27 THEN NOW() - (FLOOR(RANDOM() * 90) || ' days')::INTERVAL ELSE NULL END,
        (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + (i % 3)]);
      created_count := created_count + 1;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;
  PERFORM update_referral_stats(user_2);
  RAISE NOTICE '✅ Platina 1: % indicações', created_count;
  
  -- ========================================
  -- 3. PLATINA 2: 28 indicações
  -- ========================================
  RAISE NOTICE '💎 Criando PLATINA 2 (28 indicações)...';
  SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = user_3;
  created_count := 0;
  
  FOR i IN 1..28 LOOP
    selected_user := pool_users[1 + ((i * 11) % array_length(pool_users, 1))];
    
    IF selected_user = user_3 THEN CONTINUE; END IF;
    
    BEGIN
      INSERT INTO referrals (referrer_id, referred_id, referral_code, status, profile_completed, first_post_made, active_30_days, created_at, activated_at, completed_at, source)
      VALUES (user_3, selected_user, referrer_code,
        CASE WHEN i <= 21 THEN 'completed' WHEN i <= 25 THEN 'active' ELSE 'pending' END,
        true, (i <= 20), (i <= 21),
        NOW() - (FLOOR(RANDOM() * 140) || ' days')::INTERVAL,
        NOW() - (FLOOR(RANDOM() * 130) || ' days')::INTERVAL,
        CASE WHEN i <= 21 THEN NOW() - (FLOOR(RANDOM() * 85) || ' days')::INTERVAL ELSE NULL END,
        (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + (i % 3)]);
      created_count := created_count + 1;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;
  PERFORM update_referral_stats(user_3);
  RAISE NOTICE '✅ Platina 2: % indicações', created_count;
  
  -- ========================================
  -- 4. OURO 1: 18 indicações
  -- ========================================
  RAISE NOTICE '🥇 Criando OURO 1 (18 indicações)...';
  SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = user_4;
  created_count := 0;
  
  FOR i IN 1..18 LOOP
    selected_user := pool_users[1 + ((i * 13) % array_length(pool_users, 1))];
    
    IF selected_user = user_4 THEN CONTINUE; END IF;
    
    BEGIN
      INSERT INTO referrals (referrer_id, referred_id, referral_code, status, profile_completed, first_post_made, active_30_days, created_at, activated_at, completed_at, source)
      VALUES (user_4, selected_user, referrer_code,
        CASE WHEN i <= 14 THEN 'completed' WHEN i <= 16 THEN 'active' ELSE 'pending' END,
        (i <= 16), (i <= 13), (i <= 14),
        NOW() - (FLOOR(RANDOM() * 120) || ' days')::INTERVAL,
        NOW() - (FLOOR(RANDOM() * 110) || ' days')::INTERVAL,
        CASE WHEN i <= 14 THEN NOW() - (FLOOR(RANDOM() * 80) || ' days')::INTERVAL ELSE NULL END,
        (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + (i % 3)]);
      created_count := created_count + 1;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;
  PERFORM update_referral_stats(user_4);
  RAISE NOTICE '✅ Ouro 1: % indicações', created_count;
  
  -- ========================================
  -- 5. OURO 2: 15 indicações
  -- ========================================
  RAISE NOTICE '🥇 Criando OURO 2 (15 indicações)...';
  SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = user_5;
  created_count := 0;
  
  FOR i IN 1..15 LOOP
    selected_user := pool_users[1 + ((i * 17) % array_length(pool_users, 1))];
    
    IF selected_user = user_5 THEN CONTINUE; END IF;
    
    BEGIN
      INSERT INTO referrals (referrer_id, referred_id, referral_code, status, profile_completed, first_post_made, active_30_days, created_at, activated_at, completed_at, source)
      VALUES (user_5, selected_user, referrer_code,
        CASE WHEN i <= 11 THEN 'completed' WHEN i <= 13 THEN 'active' ELSE 'pending' END,
        (i <= 13), (i <= 10), (i <= 11),
        NOW() - (FLOOR(RANDOM() * 110) || ' days')::INTERVAL,
        NOW() - (FLOOR(RANDOM() * 100) || ' days')::INTERVAL,
        CASE WHEN i <= 11 THEN NOW() - (FLOOR(RANDOM() * 75) || ' days')::INTERVAL ELSE NULL END,
        (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + (i % 3)]);
      created_count := created_count + 1;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;
  PERFORM update_referral_stats(user_5);
  RAISE NOTICE '✅ Ouro 2: % indicações', created_count;
  
  -- ========================================
  -- 6. OURO 3: 12 indicações
  -- ========================================
  RAISE NOTICE '🥇 Criando OURO 3 (12 indicações)...';
  SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = user_6;
  created_count := 0;
  
  FOR i IN 1..12 LOOP
    selected_user := pool_users[1 + ((i * 19) % array_length(pool_users, 1))];
    
    IF selected_user = user_6 THEN CONTINUE; END IF;
    
    BEGIN
      INSERT INTO referrals (referrer_id, referred_id, referral_code, status, profile_completed, first_post_made, active_30_days, created_at, activated_at, completed_at, source)
      VALUES (user_6, selected_user, referrer_code,
        CASE WHEN i <= 9 THEN 'completed' WHEN i <= 11 THEN 'active' ELSE 'pending' END,
        (i <= 11), (i <= 8), (i <= 9),
        NOW() - (FLOOR(RANDOM() * 100) || ' days')::INTERVAL,
        NOW() - (FLOOR(RANDOM() * 90) || ' days')::INTERVAL,
        CASE WHEN i <= 9 THEN NOW() - (FLOOR(RANDOM() * 70) || ' days')::INTERVAL ELSE NULL END,
        (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + (i % 3)]);
      created_count := created_count + 1;
    EXCEPTION WHEN unique_violation THEN NULL; END;
  END LOOP;
  PERFORM update_referral_stats(user_6);
  RAISE NOTICE '✅ Ouro 3: % indicações', created_count;
  
  -- PRATA (5 usuários: 7, 7, 6, 6, 5)
  RAISE NOTICE '🥈 Criando 5 PRATA...';
  FOR prata_idx IN 7..11 LOOP
    SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = all_users_list[prata_idx];
    created_count := 0;
    FOR i IN 1..(CASE WHEN prata_idx <= 8 THEN 7 WHEN prata_idx <= 10 THEN 6 ELSE 5 END) LOOP
      selected_user := pool_users[1 + ((prata_idx * 100 + i * 23) % array_length(pool_users, 1))];
      
      IF selected_user = all_users_list[prata_idx] THEN CONTINUE; END IF;
      
      BEGIN
        INSERT INTO referrals (referrer_id, referred_id, referral_code, status, profile_completed, first_post_made, created_at, activated_at, source)
        VALUES (all_users_list[prata_idx], selected_user, referrer_code,
          CASE WHEN i <= 5 THEN 'completed' WHEN i <= 6 THEN 'active' ELSE 'pending' END,
          (i <= 6), (i <= 4),
          NOW() - (FLOOR(RANDOM() * 90) || ' days')::INTERVAL,
          NOW() - (FLOOR(RANDOM() * 80) || ' days')::INTERVAL,
          (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + (i % 3)]);
        created_count := created_count + 1;
      EXCEPTION WHEN unique_violation THEN NULL; END;
    END LOOP;
    PERFORM update_referral_stats(all_users_list[prata_idx]);
    RAISE NOTICE '✅ Prata %: % indicações', prata_idx - 6, created_count;
  END LOOP;
  
  -- BRONZE (8 usuários: 3, 3, 2, 2, 2, 1, 1, 1)
  RAISE NOTICE '🥉 Criando 8 BRONZE...';
  FOR bronze_idx IN 12..19 LOOP
    SELECT referral_code INTO referrer_code FROM user_referral_stats WHERE user_id = all_users_list[bronze_idx];
    created_count := 0;
    FOR i IN 1..(CASE WHEN bronze_idx <= 13 THEN 3 WHEN bronze_idx <= 16 THEN 2 ELSE 1 END) LOOP
      selected_user := pool_users[1 + ((bronze_idx * 200 + i * 29) % array_length(pool_users, 1))];
      
      IF selected_user = all_users_list[bronze_idx] THEN CONTINUE; END IF;
      
      BEGIN
        INSERT INTO referrals (referrer_id, referred_id, referral_code, status, profile_completed, first_post_made, created_at, activated_at, source)
        VALUES (all_users_list[bronze_idx], selected_user, referrer_code,
          CASE WHEN i = 1 THEN 'completed' ELSE 'active' END,
          (i = 1), (i = 1),
          NOW() - (FLOOR(RANDOM() * 60) || ' days')::INTERVAL,
          NOW() - (FLOOR(RANDOM() * 50) || ' days')::INTERVAL,
          (ARRAY['whatsapp', 'telegram', 'link_direto'])[1 + (i % 3)]);
        created_count := created_count + 1;
      EXCEPTION WHEN unique_violation THEN NULL; END;
    END LOOP;
    PERFORM update_referral_stats(all_users_list[bronze_idx]);
    RAISE NOTICE '✅ Bronze %: % indicações', bronze_idx - 11, created_count;
  END LOOP;
  
  PERFORM update_referral_rankings();
  RAISE NOTICE '============================================';
  RAISE NOTICE '🎉 CONCLUÍDO!';
END $$;

-- Verificar resultado
SELECT 
  p.full_name,
  urs.tier,
  urs.total_referrals,
  urs.total_points,
  urs.rank
FROM user_referral_stats urs
JOIN profiles p ON p.id = urs.user_id
WHERE urs.total_referrals > 0
ORDER BY urs.total_referrals DESC
LIMIT 20;

-- Contagem por tier
SELECT 
  tier,
  COUNT(*) as quantidade
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

