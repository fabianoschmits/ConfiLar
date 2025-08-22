-- =====================================================
-- CORREÇÃO DO SISTEMA DE NOTIFICAÇÕES
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL DA TABELA
DO $$
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICANDO ESTRUTURA ATUAL ===';
    
    -- Mostrar colunas existentes
    RAISE NOTICE '📋 Colunas existentes na tabela notifications:';
    FOR col IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'notifications'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %: % (nullable: %, default: %)', 
            col.column_name, 
            col.data_type, 
            col.is_nullable, 
            col.column_default;
    END LOOP;
END $$;

-- 2. ADICIONAR COLUNAS QUE FALTAM
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
    
    -- Verificar se a coluna type tem as constraints corretas
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'type') THEN
        -- Tentar adicionar constraint se não existir
        BEGIN
            ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('info', 'success', 'warning', 'error'));
            RAISE NOTICE '✅ Constraint para type adicionada';
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE '✅ Constraint para type já existe';
        END;
    END IF;
END $$;

-- 3. VERIFICAR E CRIAR POLÍTICAS RLS
DO $$
BEGIN
    -- Verificar se RLS está habilitado
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

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
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

-- 5. CRIAR NOTIFICAÇÕES DE TESTE
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Pegar o primeiro usuário que tenha perfil na tabela profiles
    SELECT p.id INTO test_user_id 
    FROM public.profiles p 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE '👤 Usuário de teste encontrado: %', test_user_id;
        
        -- Inserir notificações de teste
        INSERT INTO public.notifications (user_id, title, message, type, priority, is_read)
        VALUES 
            (test_user_id, 'Bem-vindo!', 'Seu cadastro foi realizado com sucesso.', 'success', 'normal', false),
            (test_user_id, 'Perfil Completo', 'Complete seu perfil para receber mais oportunidades.', 'info', 'normal', false),
            (test_user_id, 'Verificação', 'Sua conta foi verificada com sucesso.', 'success', 'normal', false),
            (test_user_id, 'Novo Serviço', 'Um novo serviço foi adicionado na sua área.', 'info', 'normal', false),
            (test_user_id, 'Lembrete', 'Não se esqueça de atualizar suas informações.', 'warning', 'low', false)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ 5 notificações de teste criadas';
    ELSE
        RAISE NOTICE '⚠️ Nenhum usuário com perfil encontrado na tabela profiles';
        RAISE NOTICE '📋 Crie um usuário primeiro através do cadastro no sistema';
    END IF;
END $$;

-- 6. VERIFICAÇÃO FINAL
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
    
    RAISE NOTICE '✅ Sistema de notificações configurado com sucesso!';
END $$;
