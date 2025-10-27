-- Script para adicionar 100.000 pontos na conta de teste
-- Usuário: 5f3a507a-6ab2-430c-b20e-1bd322a85c3b

-- ============================================
-- VERIFICAÇÕES INICIAIS
-- ============================================

-- Verificar se o usuário existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b') THEN
    RAISE EXCEPTION 'Usuário não encontrado: 5f3a507a-6ab2-430c-b20e-1bd322a85c3b';
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado: 5f3a507a-6ab2-430c-b20e-1bd322a85c3b';
END $$;

-- ============================================
-- CRIAR/ATUALIZAR SALDO DE PONTOS
-- ============================================

-- Inserir ou atualizar saldo na tabela user_points_balance
INSERT INTO public.user_points_balance (
  user_id,
  balance,
  level,
  total_earned,
  total_spent,
  available_balance,
  created_at,
  updated_at
) VALUES (
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b',
  100000,  -- 100.000 pontos
  1,       -- Nível inicial
  100000,  -- Total ganho
  0,       -- Total gasto
  100000,  -- Saldo disponível
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  balance = 100000,
  level = 1,
  total_earned = 100000,
  total_spent = 0,
  available_balance = 100000,
  updated_at = NOW();

-- ============================================
-- CRIAR TRANSAÇÃO DE PONTOS
-- ============================================

-- Inserir transação de pontos ganhos
INSERT INTO public.points_transactions (
  id,
  user_id,
  points,
  source,
  description,
  metadata,
  created_at
) VALUES (
  gen_random_uuid(),
  '5f3a507a-6ab2-430c-b20e-1bd322a85c3b',
  100000,
  'admin_bonus',
  'Pontos de teste para sistema premium - 100.000 pontos',
  '{"admin_action": true, "test_points": true, "amount": 100000}'::jsonb,
  NOW()
);

-- ============================================
-- VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar se os pontos foram adicionados corretamente
DO $$
DECLARE
  current_balance INTEGER;
  transaction_count INTEGER;
BEGIN
  -- Verificar saldo
  SELECT balance INTO current_balance 
  FROM public.user_points_balance 
  WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b';
  
  -- Verificar transação
  SELECT COUNT(*) INTO transaction_count
  FROM public.points_transactions 
  WHERE user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b' 
  AND source = 'admin_bonus';
  
  IF current_balance = 100000 THEN
    RAISE NOTICE '✅ Saldo atualizado: % pontos', current_balance;
  ELSE
    RAISE EXCEPTION '❌ Erro: Saldo não foi atualizado corretamente. Atual: %', current_balance;
  END IF;
  
  IF transaction_count > 0 THEN
    RAISE NOTICE '✅ Transação criada: % registro(s)', transaction_count;
  ELSE
    RAISE EXCEPTION '❌ Erro: Transação não foi criada';
  END IF;
  
  RAISE NOTICE '🎉 Script executado com sucesso!';
  RAISE NOTICE '💰 Usuário agora tem 100.000 pontos para testar o sistema premium';
END $$;

-- ============================================
-- INFORMAÇÕES ADICIONAIS
-- ============================================

-- Mostrar informações do usuário
SELECT 
  u.id,
  u.email,
  p.full_name,
  upb.balance,
  upb.level,
  upb.total_earned,
  upb.total_spent,
  upb.available_balance
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_points_balance upb ON upb.user_id = u.id
WHERE u.id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b';

-- Mostrar transações recentes
SELECT 
  pt.id,
  pt.points,
  pt.source,
  pt.description,
  pt.created_at
FROM public.points_transactions pt
WHERE pt.user_id = '5f3a507a-6ab2-430c-b20e-1bd322a85c3b'
ORDER BY pt.created_at DESC
LIMIT 5;
