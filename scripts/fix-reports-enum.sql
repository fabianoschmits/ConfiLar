-- =============================================
-- CORRIGIR ENUM DA TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar se a tabela reports existe e qual o tipo da coluna report_type
DO $$
DECLARE
    column_type text;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        -- Verificar o tipo da coluna report_type
        SELECT data_type INTO column_type 
        FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'report_type';
        
        RAISE NOTICE 'Tipo da coluna report_type: %', column_type;
        
        IF column_type = 'USER-DEFINED' THEN
            RAISE NOTICE 'Coluna report_type é um ENUM';
        ELSIF column_type = 'character varying' THEN
            RAISE NOTICE 'Coluna report_type é VARCHAR';
        ELSE
            RAISE NOTICE 'Tipo desconhecido: %', column_type;
        END IF;
    ELSE
        RAISE NOTICE 'Tabela reports NÃO existe';
    END IF;
END $$;

-- 2. Adicionar coluna para classificados (se não existir)
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS reported_classified_id UUID REFERENCES classified_ads(id) ON DELETE CASCADE;

-- 3. Se report_type é ENUM, adicionar valor 'classified'
DO $$
DECLARE
    enum_name text;
    enum_values text[];
BEGIN
    -- Verificar se report_type é um ENUM
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' 
        AND column_name = 'report_type' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Obter o nome do ENUM
        SELECT udt_name INTO enum_name
        FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'report_type';
        
        RAISE NOTICE 'Nome do ENUM: %', enum_name;
        
        -- Verificar se 'classified' já existe no ENUM
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'classified' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = enum_name)
        ) THEN
            -- Adicionar 'classified' ao ENUM
            EXECUTE format('ALTER TYPE %I ADD VALUE ''classified''', enum_name);
            RAISE NOTICE 'Valor ''classified'' adicionado ao ENUM %', enum_name;
        ELSE
            RAISE NOTICE 'Valor ''classified'' já existe no ENUM';
        END IF;
    ELSE
        RAISE NOTICE 'Coluna report_type não é um ENUM, tentando atualizar constraint...';
        
        -- Se não for ENUM, tentar atualizar constraint
        BEGIN
            ALTER TABLE reports 
            DROP CONSTRAINT IF EXISTS reports_report_type_check;
            
            ALTER TABLE reports 
            ADD CONSTRAINT reports_report_type_check 
            CHECK (report_type IN ('user', 'post', 'message', 'review', 'classified', 'other'));
            
            RAISE NOTICE 'Constraint report_type atualizada';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao atualizar constraint: %', SQLERRM;
        END;
    END IF;
END $$;

-- 4. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_reports_classified_id ON reports(reported_classified_id);

-- 5. Se a tabela não existir, criar com estrutura correta
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        -- Criar ENUM primeiro
        CREATE TYPE report_type_enum AS ENUM ('user', 'post', 'message', 'review', 'classified', 'other');
        
        -- Criar tabela reports
        CREATE TABLE reports (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            report_type report_type_enum NOT NULL,
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
