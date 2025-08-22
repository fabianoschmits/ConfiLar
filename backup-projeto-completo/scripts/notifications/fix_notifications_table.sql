-- =====================================================
-- CORREÇÃO DA TABELA DE NOTIFICAÇÕES
-- =====================================================

-- 1. Verificar se a tabela notifications existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
        RAISE NOTICE '✅ Tabela notifications existe';
    ELSE
        RAISE NOTICE '❌ Tabela notifications NÃO existe';
        RAISE NOTICE '📋 Criando tabela notifications...';
        
        CREATE TABLE public.notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'info',
            category TEXT NOT NULL DEFAULT 'system',
            is_read BOOLEAN DEFAULT false,
            action_url TEXT,
            action_label TEXT,
            metadata JSONB,
            priority TEXT DEFAULT 'normal',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Tabela notifications criada';
    END IF;
END $$;

-- 2. Corrigir coluna read para is_read se existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'read') THEN
        RAISE NOTICE '🔄 Renomeando coluna read para is_read...';
        ALTER TABLE public.notifications RENAME COLUMN read TO is_read;
        RAISE NOTICE '✅ Coluna renomeada com sucesso';
    ELSE
        RAISE NOTICE '✅ Coluna is_read já existe';
    END IF;
END $$;

-- 3. Adicionar colunas que podem estar faltando
DO $$
BEGIN
    -- Adicionar coluna priority se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE public.notifications ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
        RAISE NOTICE '✅ Coluna priority adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna priority já existe';
    END IF;
    
    -- Adicionar coluna action_url se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'action_url') THEN
        ALTER TABLE public.notifications ADD COLUMN action_url TEXT;
        RAISE NOTICE '✅ Coluna action_url adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna action_url já existe';
    END IF;
    
    -- Adicionar coluna action_label se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'action_label') THEN
        ALTER TABLE public.notifications ADD COLUMN action_label TEXT;
        RAISE NOTICE '✅ Coluna action_label adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna action_label já existe';
    END IF;
    
    -- Adicionar coluna metadata se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE public.notifications ADD COLUMN metadata JSONB;
        RAISE NOTICE '✅ Coluna metadata adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna metadata já existe';
    END IF;
    
    -- Adicionar coluna updated_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'updated_at') THEN
        ALTER TABLE public.notifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Coluna updated_at adicionada';
    ELSE
        RAISE NOTICE '✅ Coluna updated_at já existe';
    END IF;
END $$;

-- 4. Habilitar RLS
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'notifications' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS já está habilitado na tabela notifications';
    ELSE
        RAISE NOTICE '🔒 Habilitando RLS na tabela notifications...';
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado';
    END IF;
END $$;

-- 5. Criar políticas RLS
DO $$
BEGIN
    -- Remover políticas antigas se existirem
    DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
    
    -- Criar políticas corretas
    CREATE POLICY "Users can view own notifications" ON public.notifications
        FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own notifications" ON public.notifications
        FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert own notifications" ON public.notifications
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete own notifications" ON public.notifications
        FOR DELETE USING (auth.uid() = user_id);
    
    RAISE NOTICE '✅ Políticas RLS criadas para notifications';
END $$;

-- 6. Criar índices para performance
DO $$
BEGIN
    -- Índice para user_id (mais usado)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'notifications' AND indexname = 'idx_notifications_user_id') THEN
        CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
        RAISE NOTICE '✅ Índice idx_notifications_user_id criado';
    ELSE
        RAISE NOTICE '✅ Índice idx_notifications_user_id já existe';
    END IF;
    
    -- Índice para is_read (para filtrar não lidas)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'notifications' AND indexname = 'idx_notifications_is_read') THEN
        CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
        RAISE NOTICE '✅ Índice idx_notifications_is_read criado';
    ELSE
        RAISE NOTICE '✅ Índice idx_notifications_is_read já existe';
    END IF;
    
    -- Índice para created_at (para ordenação)
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'notifications' AND indexname = 'idx_notifications_created_at') THEN
        CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
        RAISE NOTICE '✅ Índice idx_notifications_created_at criado';
    ELSE
        RAISE NOTICE '✅ Índice idx_notifications_created_at já existe';
    END IF;
END $$;

-- 7. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON public.notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- 9. Verificação final
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Contar notificações
    RAISE NOTICE '📊 Total de notificações: %', (
        SELECT COUNT(*) FROM public.notifications
    );
    
    -- Contar notificações não lidas
    RAISE NOTICE '🔔 Notificações não lidas: %', (
        SELECT COUNT(*) FROM public.notifications WHERE is_read = false
    );
    
    -- Verificar políticas
    RAISE NOTICE '🔒 Políticas RLS criadas: %', (
        SELECT COUNT(*) FROM pg_policies WHERE tablename = 'notifications'
    );
    
    RAISE NOTICE '✅ Sistema de notificações corrigido com sucesso!';
END $$;
