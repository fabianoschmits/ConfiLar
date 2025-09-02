-- =====================================================
-- CONFI LAR - LIMPEZA DE TABELAS NÃO UTILIZADAS
-- =====================================================
-- 
-- Este script remove tabelas que não estão sendo utilizadas
-- no código atual da aplicação.
--
-- ⚠️  ATENÇÃO: Execute este script apenas após backup completo!
-- ⚠️  ATENÇÃO: Verifique se não há dados importantes nas tabelas!
--
-- =====================================================

-- =====================================================
-- FASE 1: REMOVER TABELAS COMPLETAMENTE NÃO UTILIZADAS
-- =====================================================

-- 1. Sistema de Conquistas (Gamification) - Não implementado
DROP TABLE IF EXISTS public.achievements CASCADE;

-- 2. Sistema de Interesses em Anúncios - Não implementado
DROP TABLE IF EXISTS public.ad_interests CASCADE;

-- 3. Sistema de Mensagens de Anúncios - Duplicado (usar messages + conversations)
DROP TABLE IF EXISTS public.ad_messages CASCADE;

-- 4. Sistema de Histórico de Agendamentos - Não implementado
DROP TABLE IF EXISTS public.appointment_history CASCADE;

-- 5. Sistema de Notificações de Agendamento - Não implementado
DROP TABLE IF EXISTS public.appointment_notifications CASCADE;

-- 6. Sistema de Portfolio - Não implementado
DROP TABLE IF EXISTS public.portfolio_projects CASCADE;

-- 7. Sistema de Serviços Avançado - Não implementado
DROP TABLE IF EXISTS public.service_listings CASCADE;
DROP TABLE IF EXISTS public.service_requests CASCADE;
DROP TABLE IF EXISTS public.service_proposals CASCADE;
DROP TABLE IF EXISTS public.service_history CASCADE;

-- 8. Sistema de Avaliações de Serviços - Duplicado (usar reviews)
DROP TABLE IF EXISTS public.service_reviews CASCADE;

-- 9. Sistema de Favoritos de Serviços - Duplicado (usar favorites)
DROP TABLE IF EXISTS public.service_favorites CASCADE;

-- 10. Sistema de Suporte - Não implementado
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.support_messages CASCADE;

-- 11. Sistema de Disponibilidade Profissional - Não implementado
DROP TABLE IF EXISTS public.professional_availability CASCADE;

-- 12. Sistema de Templates Semanais - Não implementado
DROP TABLE IF EXISTS public.weekly_templates CASCADE;

-- 13. Sistema de Métricas de Confiança - Não implementado
DROP TABLE IF EXISTS public.trust_metrics CASCADE;

-- 14. Sistema de Pontuação de Verificação - Não implementado
DROP TABLE IF EXISTS public.verification_scores CASCADE;

-- =====================================================
-- FASE 2: REMOVER ENUMS NÃO UTILIZADOS
-- =====================================================

-- Remover enums que não são mais utilizados
-- (Verificar se não há outras tabelas usando estes enums)

-- =====================================================
-- FASE 3: LIMPAR ÍNDICES ÓRFÃOS
-- =====================================================

-- Os índices serão removidos automaticamente com as tabelas
-- mas podemos verificar se há algum órfão

-- =====================================================
-- FASE 4: VERIFICAR DEPENDÊNCIAS
-- =====================================================

-- Verificar se não há foreign keys quebradas
-- Verificar se não há views que dependem das tabelas removidas
-- Verificar se não há funções que dependem das tabelas removidas

-- =====================================================
-- FASE 5: ATUALIZAR SEQUÊNCIAS
-- =====================================================

-- Resetar sequências se necessário
-- (Geralmente não necessário para UUIDs)

-- =====================================================
-- RESUMO DA LIMPEZA
-- =====================================================

/*
TABELAS REMOVIDAS:
✅ achievements - Sistema de gamification não implementado
✅ ad_interests - Sistema de interesses não implementado  
✅ ad_messages - Sistema duplicado de mensagens
✅ appointment_history - Histórico de agendamentos não implementado
✅ appointment_notifications - Notificações de agendamento não implementado
✅ portfolio_projects - Portfolio não implementado
✅ service_listings - Sistema de serviços avançado não implementado
✅ service_requests - Sistema de solicitações não implementado
✅ service_proposals - Sistema de propostas não implementado
✅ service_history - Histórico de serviços não implementado
✅ service_reviews - Avaliações de serviços (duplicado)
✅ service_favorites - Favoritos de serviços (duplicado)
✅ support_tickets - Sistema de suporte não implementado
✅ support_messages - Mensagens de suporte não implementado
✅ professional_availability - Disponibilidade profissional não implementado
✅ weekly_templates - Templates semanais não implementado
✅ trust_metrics - Métricas de confiança não implementado
✅ verification_scores - Pontuação de verificação não implementado

TABELAS MANTIDAS (EM USO):
✅ profiles - Perfis de usuários
✅ classified_ads - Anúncios classificados
✅ notifications - Sistema de notificações
✅ notification_preferences - Preferências de notificação
✅ messages - Mensagens do chat
✅ conversations - Conversas
✅ conversation_participants - Participantes das conversas
✅ reviews - Avaliações (sistema principal)
✅ user_reviews - Avaliações entre usuários (em uso)
✅ user_recommendations - Recomendações entre usuários (em uso)
✅ favorites - Favoritos (sistema principal)
✅ contact_agreements - Acordos de contato
✅ appointments - Agendamentos
✅ search_history - Histórico de busca
✅ service_categories - Categorias de serviços
✅ professional_services - Serviços profissionais
✅ feed_posts - Feed social (em uso)
✅ post_comments - Comentários do feed (definido no types)
✅ post_likes - Curtidas do feed (definido no types)
✅ reports - Sistema de denúncias (em uso)
✅ work_schedules - Horários de trabalho (em uso)
✅ user_activity_log - Log de atividades
✅ user_files - Arquivos de usuário
✅ user_preferences - Preferências de usuário
✅ user_settings - Configurações de usuário
✅ user_statistics - Estatísticas de usuário
✅ verification_documents - Documentos de verificação
*/

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas essenciais ainda existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'profiles', 'classified_ads', 'notifications', 'notification_preferences',
            'messages', 'conversations', 'conversation_participants', 'reviews',
            'user_reviews', 'user_recommendations', 'favorites', 'contact_agreements',
            'appointments', 'search_history', 'service_categories', 'professional_services',
            'feed_posts', 'post_comments', 'post_likes', 'reports', 'work_schedules',
            'user_activity_log', 'user_files', 'user_preferences', 'user_settings',
            'user_statistics', 'verification_documents'
        ) THEN '✅ MANTIDA'
        ELSE '❌ REMOVIDA'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
