-- =============================================
-- SCRIPT FINAL PARA CORRIGIR TABELA REPORTS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Verificar estrutura atual da tabela
DO $$
DECLARE
    column_info record;
BEGIN
    RAISE NOTICE '=== ESTRUTURA ATUAL DA TABELA REPORTS ===';
    
    FOR column_info IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'reports' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Coluna: %, Tipo: %, Nullable: %, Default: %', 
            column_info.column_name, 
            column_info.data_type, 
            column_info.is_nullable, 
            column_info.column_default;
    END LOOP;
END $$;

-- 2. Remover tabela existente se houver problemas
DROP TABLE IF EXISTS reports CASCADE;

-- 3. Criar tabela reports com estrutura correta
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

-- 4. Criar índices para performance
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_reported_post_id ON reports(reported_post_id);
CREATE INDEX idx_reports_reported_message_id ON reports(reported_message_id);
CREATE INDEX idx_reports_reported_classified_id ON reports(reported_classified_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can insert their own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (auth.uid() = reporter_id);

-- Política para admins (ajuste conforme sua estrutura de usuários)
-- CREATE POLICY "Admins can view all reports" ON reports
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM profiles
--             WHERE profiles.id = auth.uid()
--             AND profiles.is_admin = true
--         )
--     );

-- 7. Verificar estrutura final
DO $$
DECLARE
    column_info record;
BEGIN
    RAISE NOTICE '=== ESTRUTURA FINAL DA TABELA REPORTS ===';
    
    FOR column_info IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'reports' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Coluna: %, Tipo: %, Nullable: %, Default: %', 
            column_info.column_name, 
            column_info.data_type, 
            column_info.is_nullable, 
            column_info.column_default;
    END LOOP;
    
    RAISE NOTICE 'Tabela reports criada com sucesso!';
END $$;
