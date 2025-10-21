-- ============================================
-- ADICIONAR 96 INDICAÇÕES FAKE PARA TESTE
-- Usando usuários reais do banco de dados
-- ============================================

-- Usuário que receberá as indicações: f7444305-a3bd-4d71-874a-bb95fd27f96a

DO $$
DECLARE
  referrer_uuid UUID := 'f7444305-a3bd-4d71-874a-bb95fd27f96a';
  referral_code TEXT;
  available_users UUID[];
  selected_user UUID;
  i INTEGER;
  total_created INTEGER := 0;
  status_choice TEXT;
  days_ago INTEGER;
  max_users_needed INTEGER := 96;
  users_count INTEGER;
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
    RAISE EXCEPTION 'Usuário % não tem código de referral!', referral_code;
  END IF;
  
  RAISE NOTICE 'Código de referral: %', referral_code;
  
  -- Buscar todos os usuários disponíveis (exceto o próprio indicador)
  SELECT ARRAY_AGG(id) INTO available_users
  FROM auth.users
  WHERE id != referrer_uuid
  AND id NOT IN (
    -- Excluir usuários que já foram indicados por este usuário
    SELECT referred_id FROM referrals WHERE referrer_id = referrer_uuid
  );
  
  users_count := COALESCE(array_length(available_users, 1), 0);
  RAISE NOTICE '📊 Usuários disponíveis para indicação: %', users_count;
  
  IF users_count = 0 THEN
    RAISE EXCEPTION 'Não há usuários disponíveis para serem indicados!';
  END IF;
  
  -- Se não houver usuários suficientes, usar os mesmos múltiplas vezes
  -- criando referrals "falsos" (para demonstração)
  FOR i IN 1..LEAST(max_users_needed, users_count) LOOP
    -- Selecionar usuário aleatório da lista
    selected_user := available_users[1 + FLOOR(RANDOM() * array_length(available_users, 1))];
    
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
    
    BEGIN
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
        selected_user,
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
        NOW() - (FLOOR(RANDOM() * GREATEST(days_ago, 1)) || ' days')::INTERVAL,
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
          'batch', i
        )
      );
      
      total_created := total_created + 1;
      
      -- Log a cada 10 indicações
      IF i % 10 = 0 THEN
        RAISE NOTICE 'Progresso: % indicações criadas', i;
      END IF;
      
    EXCEPTION WHEN unique_violation THEN
      -- Se já existe, ignorar e continuar
      RAISE NOTICE 'Indicação duplicada ignorada (usuário já indicado)';
    END;
  END LOOP;
  
  -- Se ainda não chegou a 96, avisar
  IF total_created < max_users_needed THEN
    RAISE NOTICE '⚠️ ATENÇÃO: Só foi possível criar % indicações (faltam usuários únicos no banco)', total_created;
    RAISE NOTICE '💡 Para ter 96 indicações, você precisa ter pelo menos 96 usuários diferentes no sistema';
  END IF;
  
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
  p.full_name as nome_indicador,
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
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM referrals WHERE referrer_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'), 1) as percentual
FROM referrals
WHERE referrer_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
GROUP BY status
ORDER BY quantidade DESC;

-- Ver milestones completados
SELECT 
  COUNT(*) FILTER (WHERE profile_completed = true) as perfis_completos,
  COUNT(*) FILTER (WHERE first_post_made = true) as posts_feitos,
  COUNT(*) FILTER (WHERE first_service_hired = true) as servicos_contratados,
  COUNT(*) FILTER (WHERE active_30_days = true) as ativos_30_dias
FROM referrals
WHERE referrer_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a';

-- Ver indicações recentes com nomes
SELECT 
  p.full_name as indicado,
  r.status,
  r.profile_completed,
  r.first_post_made,
  r.created_at,
  r.source
FROM referrals r
JOIN profiles p ON p.id = r.referred_id
WHERE r.referrer_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'
ORDER BY r.created_at DESC
LIMIT 10;

-- Ver total geral
SELECT COUNT(*) as total_indicacoes
FROM referrals
WHERE referrer_id = 'f7444305-a3bd-4d71-874a-bb95fd27f96a';

