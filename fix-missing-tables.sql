-- =====================================================
-- CORRIGIR TABELAS FALTANTES NO BANCO DE DADOS
-- =====================================================

-- =====================================================
-- 1. TABELA: notification_preferences
-- =====================================================

-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notification_preferences'
);

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    push_enabled boolean DEFAULT TRUE,
    email_enabled boolean DEFAULT TRUE,
    message_notifications boolean DEFAULT TRUE,
    review_notifications boolean DEFAULT TRUE,
    booking_notifications boolean DEFAULT TRUE,
    achievement_notifications boolean DEFAULT TRUE,
    marketing_notifications boolean DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Adicionar constraint único se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_user_id' 
        AND table_name = 'notification_preferences'
    ) THEN
        ALTER TABLE public.notification_preferences ADD CONSTRAINT unique_user_id UNIQUE (user_id);
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS se não existirem
DO $$ 
BEGIN
    -- Política de SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notification_preferences' 
        AND policyname = 'Users can view their own notification preferences'
    ) THEN
        CREATE POLICY "Users can view their own notification preferences" 
        ON public.notification_preferences FOR SELECT 
        TO authenticated USING (user_id = auth.uid());
    END IF;

    -- Política de UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notification_preferences' 
        AND policyname = 'Users can update their own notification preferences'
    ) THEN
        CREATE POLICY "Users can update their own notification preferences" 
        ON public.notification_preferences FOR UPDATE 
        TO authenticated USING (user_id = auth.uid()) 
        WITH CHECK (user_id = auth.uid());
    END IF;

    -- Política de INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notification_preferences' 
        AND policyname = 'Users can insert their own notification preferences'
    ) THEN
        CREATE POLICY "Users can insert their own notification preferences" 
        ON public.notification_preferences FOR INSERT 
        TO authenticated WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_notification_preferences_timestamp'
    ) THEN
        CREATE TRIGGER trigger_update_notification_preferences_timestamp
            BEFORE UPDATE ON public.notification_preferences
            FOR EACH ROW
            EXECUTE FUNCTION update_notification_preferences_timestamp();
    END IF;
END $$;

-- =====================================================
-- 2. TABELA: user_recommendations
-- =====================================================

-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_recommendations'
);

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.user_recommendations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recommended_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Adicionar constraint único se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_recommendation' 
        AND table_name = 'user_recommendations'
    ) THEN
        ALTER TABLE public.user_recommendations ADD CONSTRAINT unique_recommendation UNIQUE (recommender_id, recommended_id);
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS se não existirem
DO $$ 
BEGIN
    -- Política de SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_recommendations' 
        AND policyname = 'Users can view their own recommendations'
    ) THEN
        CREATE POLICY "Users can view their own recommendations" 
        ON public.user_recommendations FOR SELECT 
        TO authenticated USING (recommender_id = auth.uid() OR recommended_id = auth.uid());
    END IF;

    -- Política de INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_recommendations' 
        AND policyname = 'Users can insert their own recommendations'
    ) THEN
        CREATE POLICY "Users can insert their own recommendations" 
        ON public.user_recommendations FOR INSERT 
        TO authenticated WITH CHECK (recommender_id = auth.uid());
    END IF;

    -- Política de DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_recommendations' 
        AND policyname = 'Users can delete their own recommendations'
    ) THEN
        CREATE POLICY "Users can delete their own recommendations" 
        ON public.user_recommendations FOR DELETE 
        TO authenticated USING (recommender_id = auth.uid());
    END IF;
END $$;

-- Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_user_recommendations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_user_recommendations_timestamp'
    ) THEN
        CREATE TRIGGER trigger_update_user_recommendations_timestamp
            BEFORE UPDATE ON public.user_recommendations
            FOR EACH ROW
            EXECUTE FUNCTION update_user_recommendations_timestamp();
    END IF;
END $$;

-- =====================================================
-- 3. INSERIR PREFERÊNCIAS PADRÃO PARA USUÁRIOS EXISTENTES
-- =====================================================

-- Inserir preferências padrão para usuários que não têm
INSERT INTO public.notification_preferences (user_id, push_enabled, email_enabled, message_notifications, review_notifications, booking_notifications, achievement_notifications, marketing_notifications)
SELECT 
    p.id,
    TRUE,  -- push_enabled
    TRUE,  -- email_enabled
    TRUE,  -- message_notifications
    TRUE,  -- review_notifications
    TRUE,  -- booking_notifications
    TRUE,  -- achievement_notifications
    FALSE  -- marketing_notifications
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.notification_preferences np 
    WHERE np.user_id = p.id
);

-- =====================================================
-- 4. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    'notification_preferences' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notification_preferences'
    ) as exists
UNION ALL
SELECT 
    'user_recommendations' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_recommendations'
    ) as exists;

-- Contar registros nas tabelas
SELECT 'notification_preferences' as table_name, COUNT(*) as count FROM public.notification_preferences
UNION ALL
SELECT 'user_recommendations' as table_name, COUNT(*) as count FROM public.user_recommendations;
