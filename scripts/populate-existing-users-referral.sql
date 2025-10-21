-- ============================================
-- POPULAR CÓDIGOS DE REFERRAL PARA USUÁRIOS EXISTENTES
-- ============================================

-- Este script cria códigos de referral para todos os usuários que já existem
-- mas ainda não têm registro na tabela user_referral_stats

-- Função para gerar código de referral único (se não existir)
CREATE OR REPLACE FUNCTION generate_referral_code(user_name TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Normalizar nome (primeiras letras + sufixo aleatório)
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(user_name, '[^a-zA-Z0-9]', '', 'g'), 1, 6));
  
  -- Se o nome for muito curto, usar parte do UUID
  IF LENGTH(base_code) < 4 THEN
    base_code := base_code || SUBSTRING(REPLACE(user_id::TEXT, '-', ''), 1, 6 - LENGTH(base_code));
  END IF;
  
  -- Adicionar sufixo numérico se necessário
  final_code := base_code || FLOOR(RANDOM() * 9999)::TEXT;
  
  -- Garantir unicidade
  WHILE EXISTS (SELECT 1 FROM public.user_referral_stats WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || FLOOR(RANDOM() * 9999)::TEXT;
    
    -- Prevenir loop infinito
    IF counter > 100 THEN
      final_code := SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 12);
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Inserir códigos de referral para todos os usuários existentes que ainda não têm
DO $$
DECLARE
  profile_record RECORD;
  new_referral_code TEXT;
  users_processed INTEGER := 0;
  users_skipped INTEGER := 0;
BEGIN
  RAISE NOTICE 'Iniciando população de códigos de referral...';
  
  -- Loop por todos os perfis
  FOR profile_record IN 
    SELECT 
      p.id,
      COALESCE(p.full_name, 'USER') as full_name
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_referral_stats urs
      WHERE urs.user_id = p.id
    )
  LOOP
    BEGIN
      -- Gerar código único
      new_referral_code := generate_referral_code(profile_record.full_name, profile_record.id);
      
      -- Inserir na tabela de stats
      INSERT INTO public.user_referral_stats (
        user_id,
        referral_code,
        total_referrals,
        active_referrals,
        completed_referrals,
        total_points,
        tier,
        created_at,
        updated_at
      ) VALUES (
        profile_record.id,
        new_referral_code,
        0,
        0,
        0,
        0,
        'none',
        NOW(),
        NOW()
      );
      
      users_processed := users_processed + 1;
      
      RAISE NOTICE 'Criado código % para usuário % (ID: %)', 
        new_referral_code, 
        profile_record.full_name, 
        profile_record.id;
        
    EXCEPTION WHEN OTHERS THEN
      users_skipped := users_skipped + 1;
      RAISE WARNING 'Erro ao processar usuário % (ID: %): %', 
        profile_record.full_name, 
        profile_record.id,
        SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Processamento completo!';
  RAISE NOTICE 'Usuários processados: %', users_processed;
  RAISE NOTICE 'Usuários ignorados (erro): %', users_skipped;
  RAISE NOTICE '============================================';
END $$;

-- Verificar resultado
SELECT 
  COUNT(*) as total_users_with_referral_code,
  COUNT(DISTINCT referral_code) as unique_codes
FROM public.user_referral_stats;

-- Mostrar alguns exemplos
SELECT 
  urs.referral_code,
  p.full_name,
  urs.tier,
  urs.total_referrals,
  urs.created_at
FROM public.user_referral_stats urs
JOIN public.profiles p ON p.id = urs.user_id
ORDER BY urs.created_at DESC
LIMIT 10;

-- Verificar se há usuários sem código ainda
SELECT 
  COUNT(*) as users_without_referral_code
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_referral_stats urs
  WHERE urs.user_id = p.id
);

