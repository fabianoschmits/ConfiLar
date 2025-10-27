-- =====================================================
-- CORRIGIR TABELA point_transactions
-- =====================================================

-- 1. VERIFICAR SE A TABELA EXISTE
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'point_transactions') THEN
    RAISE NOTICE 'Criando tabela point_transactions...';
    
    CREATE TABLE public.point_transactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend')),
      source VARCHAR(50) NOT NULL,
      description TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
      post_id UUID REFERENCES public.feed_posts(id) ON DELETE SET NULL,
      related_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Criar índices
    CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
    CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at);
    CREATE INDEX idx_point_transactions_type ON public.point_transactions(type);
    CREATE INDEX idx_point_transactions_source ON public.point_transactions(source);
    
    -- Habilitar RLS
    ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas RLS
    CREATE POLICY "Users can view own point transactions" ON public.point_transactions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert point transactions" ON public.point_transactions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE '✅ Tabela point_transactions criada com sucesso';
  ELSE
    RAISE NOTICE '✅ Tabela point_transactions já existe';
  END IF;
END $$;

-- 2. VERIFICAR SE HÁ DADOS
SELECT COUNT(*) as total_transactions FROM point_transactions;

-- 3. INSERIR DADOS DE TESTE SE NÃO HOUVER TRANSAÇÕES
DO $$ 
DECLARE
  user_count INTEGER;
  transaction_count INTEGER;
BEGIN
  -- Verificar se há usuários
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- Verificar se há transações
  SELECT COUNT(*) INTO transaction_count FROM point_transactions;
  
  IF user_count > 0 AND transaction_count = 0 THEN
    RAISE NOTICE 'Inserindo dados de teste...';
    
    -- Inserir transações de teste para o primeiro usuário
    INSERT INTO point_transactions (user_id, amount, type, source, description)
    SELECT 
      u.id,
      100,
      'earn',
      'daily_login',
      'Login diário'
    FROM auth.users u
    LIMIT 1;
    
    INSERT INTO point_transactions (user_id, amount, type, source, description)
    SELECT 
      u.id,
      50,
      'earn',
      'profile_completion',
      'Perfil completado'
    FROM auth.users u
    LIMIT 1;
    
    INSERT INTO point_transactions (user_id, amount, type, source, description)
    SELECT 
      u.id,
      -10,
      'spend',
      'give_like',
      'Curtiu um post'
    FROM auth.users u
    LIMIT 1;
    
    RAISE NOTICE '✅ Dados de teste inseridos';
  ELSE
    RAISE NOTICE '✅ Já existem transações ou não há usuários';
  END IF;
END $$;

-- 4. VERIFICAR DADOS FINAIS
SELECT 
  id, 
  user_id, 
  amount, 
  type, 
  source, 
  description, 
  created_at 
FROM point_transactions 
ORDER BY created_at DESC 
LIMIT 5;

