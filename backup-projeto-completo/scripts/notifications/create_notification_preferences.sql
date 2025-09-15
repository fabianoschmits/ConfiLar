-- =====================================================
-- CORREÇÃO DO ERRO 406 - TABELA NOTIFICATION_PREFERENCES
-- Script corrigido para evitar conflitos com objetos existentes
-- =====================================================

-- 1. Verificar e criar tabela se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notification_preferences') THEN
        RAISE NOTICE 'Criando tabela notification_preferences...';
        
        CREATE TABLE public.notification_preferences (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            push_enabled BOOLEAN DEFAULT true,
            email_enabled BOOLEAN DEFAULT true,
            message_notifications BOOLEAN DEFAULT true,
            review_notifications BOOLEAN DEFAULT true,
            booking_notifications BOOLEAN DEFAULT true,
            achievement_notifications BOOLEAN DEFAULT true,
            marketing_notifications BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        RAISE NOTICE 'Tabela notification_preferences criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela notification_preferences já existe.';
    END IF;
END $$;

-- 2. Habilitar RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas se existirem (sem erro se não existirem)
DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can create their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can delete their own notification preferences" ON public.notification_preferences;

-- 4. Criar políticas RLS corretas
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification preferences" ON public.notification_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Criar índice para performance (sem erro se já existir)
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- 6. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Remover trigger existente se existir e criar novo
DROP TRIGGER IF EXISTS trigger_update_notification_preferences_updated_at ON public.notification_preferences;
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- 8. Inserir preferências padrão para usuários existentes (sem conflito)
INSERT INTO public.notification_preferences (
    user_id, 
    push_enabled, 
    email_enabled, 
    message_notifications, 
    review_notifications, 
    booking_notifications, 
    achievement_notifications, 
    marketing_notifications
)
SELECT 
    p.id,
    true,  -- push_enabled
    true,  -- email_enabled
    true,  -- message_notifications
    true,  -- review_notifications
    true,  -- booking_notifications
    true,  -- achievement_notifications
    false  -- marketing_notifications
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.notification_preferences np WHERE np.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 9. Verificar se tudo foi criado corretamente
SELECT 
    '✅ Correção concluída!' as status,
    COUNT(*) as total_preferences,
    COUNT(DISTINCT user_id) as unique_users
FROM public.notification_preferences;

-- 10. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'notification_preferences';

-- 11. Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'notification_preferences';
