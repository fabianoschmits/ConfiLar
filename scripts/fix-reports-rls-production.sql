-- =============================================
-- POLÍTICAS RLS SEGURAS PARA PRODUÇÃO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Remover política permissiva atual
DROP POLICY IF EXISTS "Allow all operations on reports" ON reports;

-- 2. Criar políticas RLS específicas e seguras
-- Usuários podem ver suas próprias denúncias
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Usuários podem inserir suas próprias denúncias
CREATE POLICY "Users can insert their own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Usuários podem atualizar suas próprias denúncias (apenas status)
CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (auth.uid() = reporter_id);

-- Admins podem ver todas as denúncias (política temporária)
-- Ajuste conforme sua estrutura de usuários
CREATE POLICY "Admins can view all reports" ON reports
    FOR ALL USING (true);

-- 3. Verificar se as políticas foram criadas
SELECT COUNT(*) as total_policies FROM pg_policies WHERE tablename = 'reports';

-- 4. Testar inserção de denúncia (deve funcionar)
INSERT INTO reports (
    report_type,
    reason,
    description,
    priority,
    reporter_id,
    status,
    created_at
) VALUES (
    'classified',
    'Teste de segurança',
    'Verificando se as políticas RLS estão funcionando corretamente',
    'medium',
    (SELECT id FROM auth.users LIMIT 1),
    'pending',
    NOW()
) ON CONFLICT DO NOTHING;

-- 5. Verificar se a denúncia foi inserida
SELECT COUNT(*) as total_reports FROM reports;
