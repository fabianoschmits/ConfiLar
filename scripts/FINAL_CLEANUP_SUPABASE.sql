-- =====================================================
-- LIMPEZA FINAL DO BANCO DE DADOS - CONFILAR
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- ⚠️ ATENÇÃO: Este script vai DELETAR tabelas não utilizadas!
-- ⚠️ Faça backup antes de executar!

-- =====================================================
-- TABELAS QUE SERÃO DELETADAS (NÃO UTILIZADAS NO CÓDIGO)
-- =====================================================

-- 1. Sistema de Serviços (Não Implementado)
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS professional_services CASCADE;

-- 2. Sistema de Agendamentos (Não Implementado)  
DROP TABLE IF EXISTS appointments CASCADE;

-- 3. Sistema de Arquivos (Não Implementado)
DROP TABLE IF EXISTS user_files CASCADE;

-- 4. Sistema de Logs (Não Implementado)
DROP TABLE IF EXISTS user_activity_log CASCADE;

-- 5. Sistema de Posts (Parcialmente Implementado - não usado)
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;

-- 6. Sistema de Verificação (Não Implementado)
DROP TABLE IF EXISTS verification_documents CASCADE;

-- 7. Sistema de Busca (Não Implementado)
DROP TABLE IF EXISTS search_history CASCADE;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram deletadas
SELECT 
    table_name,
    'DELETADA' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'service_categories',
    'professional_services',
    'appointments',
    'user_files',
    'user_activity_log',
    'post_likes',
    'post_comments',
    'verification_documents',
    'search_history'
);

-- Verificar tabelas que devem permanecer
SELECT 
    table_name,
    'MANTIDA' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles',
    'conversations',
    'messages',
    'reviews',
    'classified_ads',
    'feed_posts',
    'notifications',
    'favorites',
    'evaluation_requests',
    'portfolio_projects',
    'profile_views',
    'user_bans',
    'reports',
    'admins'
)
ORDER BY table_name;

-- =====================================================
-- COMENTÁRIOS SOBRE A LIMPEZA
-- =====================================================

-- TABELAS DELETADAS (9 tabelas):
-- - service_categories: Categorias de serviços (não usado)
-- - professional_services: Serviços profissionais (não usado)
-- - appointments: Agendamentos (não usado)
-- - user_files: Arquivos de usuários (não usado)
-- - user_activity_log: Log de atividades (não usado)
-- - post_likes: Curtidas de posts (não usado)
-- - post_comments: Comentários de posts (não usado)
-- - verification_documents: Documentos de verificação (não usado)
-- - search_history: Histórico de buscas (não usado)

-- TABELAS MANTIDAS (14 tabelas):
-- - profiles: Base do sistema
-- - conversations: Chat
-- - messages: Mensagens
-- - reviews: Avaliações
-- - classified_ads: Anúncios
-- - feed_posts: Feed social
-- - notifications: Notificações
-- - favorites: Favoritos
-- - evaluation_requests: Solicitações de avaliação
-- - portfolio_projects: Portfólio
-- - profile_views: Visualizações
-- - user_bans: Banimentos
-- - reports: Denúncias
-- - admins: Administradores

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

-- ANTES: 23 tabelas (14 utilizadas + 9 não utilizadas)
-- DEPOIS: 14 tabelas (apenas as utilizadas)
-- REDUÇÃO: 39% menos tabelas
-- BENEFÍCIO: Banco mais limpo e focado
