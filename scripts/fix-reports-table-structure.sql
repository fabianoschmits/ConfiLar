-- =============================================
-- CORRIGIR ESTRUTURA DA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela reports existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        RAISE NOTICE 'Tabela reports existe';
        
        -- Verificar se a coluna type existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'type') THEN
            RAISE NOTICE 'Coluna type existe';
        ELSE
            RAISE NOTICE 'Coluna type NÃO existe - provavelmente usa report_type';
        END IF;
        
        -- Verificar se a coluna report_type existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'report_type') THEN
            RAISE NOTICE 'Coluna report_type existe';
        ELSE
            RAISE NOTICE 'Coluna report_type NÃO existe';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela reports NÃO existe';
    END IF;
END $$;

-- 2. Adicionar coluna para classificados (se não existir)
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS reported_classified_id UUID REFERENCES classified_ads(id) ON DELETE CASCADE;

-- 3. Se a tabela usa report_type, atualizar constraint
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'report_type') THEN
        -- Atualizar constraint do report_type para incluir 'classified'
        ALTER TABLE reports 
        DROP CONSTRAINT IF EXISTS reports_report_type_check;
        
        ALTER TABLE reports 
        ADD CONSTRAINT reports_report_type_check 
        CHECK (report_type IN ('user', 'post', 'message', 'review', 'classified', 'other'));
        
        RAISE NOTICE 'Constraint report_type atualizada';
    END IF;
    
    -- Se a tabela usa type, atualizar constraint
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'type') THEN
        -- Atualizar constraint do type para incluir 'classified'
        ALTER TABLE reports 
        DROP CONSTRAINT IF EXISTS reports_type_check;
        
        ALTER TABLE reports 
        ADD CONSTRAINT reports_type_check 
        CHECK (type IN ('user', 'post', 'message', 'review', 'classified', 'other'));
        
        RAISE NOTICE 'Constraint type atualizada';
    END IF;
END $$;

-- 4. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_reports_classified_id ON reports(reported_classified_id);

-- 5. Se a tabela não existir, criar com estrutura correta
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        -- Criar tabela reports
        CREATE TABLE reports (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('user', 'post', 'message', 'review', 'classified', 'other')),
            reason VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
            priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            reported_post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
            reported_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
            reported_classified_id UUID REFERENCES classified_ads(id) ON DELETE CASCADE,
            admin_notes TEXT,
            resolution TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Criar índices
        CREATE INDEX idx_reports_report_type ON reports(report_type);
        CREATE INDEX idx_reports_status ON reports(status);
        CREATE INDEX idx_reports_priority ON reports(priority);
        CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
        CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
        CREATE INDEX idx_reports_classified_id ON reports(reported_classified_id);
        CREATE INDEX idx_reports_created_at ON reports(created_at);

        -- Habilitar RLS
        ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

        -- Criar políticas RLS
        CREATE POLICY "Users can view their own reports" ON reports
            FOR SELECT USING (auth.uid() = reporter_id);

        CREATE POLICY "Users can insert their own reports" ON reports
            FOR INSERT WITH CHECK (auth.uid() = reporter_id);

        CREATE POLICY "Users can update their own reports" ON reports
            FOR UPDATE USING (auth.uid() = reporter_id);

        CREATE POLICY "Admins can view all reports" ON reports
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin'
                )
            );
            
        RAISE NOTICE 'Tabela reports criada com sucesso';
    END IF;
END $$;
