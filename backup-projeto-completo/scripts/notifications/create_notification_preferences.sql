-- =====================================================
-- CRIAÇÃO DA TABELA DE PREFERÊNCIAS DE NOTIFICAÇÕES
-- =====================================================

-- Criar tabela de preferências de notificações
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    push BOOLEAN DEFAULT true,
    email BOOLEAN DEFAULT true,
    inApp BOOLEAN DEFAULT true,
    messages BOOLEAN DEFAULT true,
    reviews BOOLEAN DEFAULT true,
    updates BOOLEAN DEFAULT true,
    marketing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Inserir preferências padrão para usuários existentes
INSERT INTO public.notification_preferences (user_id, push, email, inApp, messages, reviews, updates, marketing)
SELECT 
    p.id,
    true,  -- push
    true,  -- email
    true,  -- inApp
    true,  -- messages
    true,  -- reviews
    true,  -- updates
    false  -- marketing
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.notification_preferences np WHERE np.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar se foi criado
SELECT 
    '✅ Tabela notification_preferences criada com sucesso!' as status,
    COUNT(*) as total_preferences
FROM public.notification_preferences;
