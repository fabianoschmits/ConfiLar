-- =====================================================
-- MAPEAMENTO COMPLETO DAS TABELAS NECESSÁRIAS - CONFILAR
-- =====================================================
-- Análise baseada no código TypeScript e funcionalidades implementadas
-- Data: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

-- =====================================================
-- 1. TABELAS PRINCIPAIS (EM USO ATUALMENTE)
-- =====================================================

-- ✅ PROFILES - Perfis de usuários (CLIENTE E PROFISSIONAL)
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: id, email, full_name, user_type, phone, bio, location, etc.
-- Funcionalidades: Cadastro, login, perfil completo, verificação

-- ✅ CONVERSATIONS - Conversas entre usuários
-- Status: IMPLEMENTADO E FUNCIONANDO  
-- Campos principais: id, client_id, professional_id, last_message_at
-- Funcionalidades: Chat direto, histórico de conversas

-- ✅ CONVERSATION_PARTICIPANTS - Participantes das conversas
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: conversation_id, participant_id, role
-- Funcionalidades: Gerenciar participantes, roles

-- ✅ MESSAGES - Mensagens do chat
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: conversation_id, sender_id, content, is_read
-- Funcionalidades: Envio/recebimento, leitura, histórico

-- ✅ NOTIFICATIONS - Sistema de notificações
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, title, message, type, is_read
-- Funcionalidades: Notificações em tempo real, push, email

-- ✅ CLASSIFIED_ADS - Anúncios classificados
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, title, description, category, location
-- Funcionalidades: Criar/editar anúncios, busca, filtros

-- =====================================================
-- 2. TABELAS DE SUPORTE (EM USO ATUALMENTE)
-- =====================================================

-- ✅ SERVICE_CATEGORIES - Categorias de serviços
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: name, description, icon, parent_id
-- Funcionalidades: Organização de serviços, hierarquia

-- ✅ PROFESSIONAL_SERVICES - Serviços oferecidos por profissionais
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: professional_id, category_id, title, price_range
-- Funcionalidades: Cadastro de serviços, preços, disponibilidade

-- ✅ FAVORITES - Favoritos/salvos
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, ad_id
-- Funcionalidades: Salvar anúncios favoritos

-- ✅ REVIEWS - Avaliações entre usuários
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: reviewer_id, reviewed_id, rating, comment
-- Funcionalidades: Avaliações, reputação, verificação

-- ✅ USER_REVIEWS - Avaliações específicas (pode ser duplicado com reviews)
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: reviewer_id, reviewed_id, rating, review_type
-- Funcionalidades: Avaliações cliente->profissional e vice-versa

-- ✅ USER_RECOMMENDATIONS - Recomendações entre usuários
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: recommender_id, recommended_id, recommendation_type
-- Funcionalidades: Sistema de recomendações

-- ✅ CONTACT_AGREEMENTS - Acordos de contato
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: client_id, professional_id, status, agreed_price
-- Funcionalidades: Proteção de dados, acordos formais

-- ✅ APPOINTMENTS - Agendamentos
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: client_id, professional_id, date, time, status
-- Funcionalidades: Agendamento de serviços

-- ✅ SEARCH_HISTORY - Histórico de buscas
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, search_query, filters
-- Funcionalidades: Histórico de buscas, sugestões

-- =====================================================
-- 3. TABELAS DE FEED SOCIAL (EM USO ATUALMENTE)
-- =====================================================

-- ✅ FEED_POSTS - Posts do feed social
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: professional_id, title, description, images
-- Funcionalidades: Feed social, compartilhamento de trabalhos

-- ✅ POST_LIKES - Curtidas dos posts
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: post_id, user_id
-- Funcionalidades: Sistema de curtidas

-- ✅ POST_COMMENTS - Comentários dos posts
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: post_id, user_id, content, parent_comment_id
-- Funcionalidades: Comentários, respostas

-- =====================================================
-- 4. TABELAS DE CONFIGURAÇÃO E PREFERÊNCIAS
-- =====================================================

-- ✅ NOTIFICATION_PREFERENCES - Preferências de notificação
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, push, email, in_app, messages
-- Funcionalidades: Configurar notificações

-- ✅ USER_SETTINGS - Configurações do usuário
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, privacy_level, language, timezone
-- Funcionalidades: Configurações pessoais

-- ✅ USER_STATISTICS - Estatísticas do usuário
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, total_appointments, earnings, rating
-- Funcionalidades: Dashboard, métricas

-- =====================================================
-- 5. TABELAS DE ARQUIVOS E DOCUMENTOS
-- =====================================================

-- ✅ USER_FILES - Arquivos do usuário
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, file_name, file_url, file_type
-- Funcionalidades: Upload de arquivos, portfólio

-- ✅ VERIFICATION_DOCUMENTS - Documentos de verificação
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: professional_id, document_type, status
-- Funcionalidades: Verificação de documentos

-- =====================================================
-- 6. TABELAS DE LOGS E ATIVIDADE
-- =====================================================

-- ✅ USER_ACTIVITY_LOG - Log de atividades
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: user_id, activity_type, description, metadata
-- Funcionalidades: Auditoria, análise de comportamento

-- ✅ REPORTS - Denúncias/reports
-- Status: IMPLEMENTADO E FUNCIONANDO
-- Campos principais: reporter_id, reported_id, reason, status
-- Funcionalidades: Sistema de denúncias

-- =====================================================
-- 7. TABELAS ADICIONAIS (POTENCIALMENTE NECESSÁRIAS)
-- =====================================================

-- ⚠️ WORK_SCHEDULES - Horários de trabalho
-- Status: NÃO IMPLEMENTADO MAS PODE SER ÚTIL
-- Campos sugeridos: professional_id, day_of_week, start_time, end_time
-- Funcionalidades: Disponibilidade profissional

-- ⚠️ USER_PREFERENCES - Preferências avançadas
-- Status: NÃO IMPLEMENTADO MAS PODE SER ÚTIL
-- Campos sugeridos: user_id, theme, notifications_frequency
-- Funcionalidades: Personalização avançada

-- =====================================================
-- 8. TABELAS REMOVIDAS (NÃO NECESSÁRIAS)
-- =====================================================

-- ❌ ACHIEVEMENTS - Sistema de gamification
-- Motivo: Não implementado no frontend
-- Alternativa: Usar badges no perfil

-- ❌ SERVICE_LISTINGS - Listagens de serviços
-- Motivo: Duplicado com professional_services
-- Alternativa: Usar professional_services

-- ❌ SERVICE_REQUESTS - Solicitações de serviço
-- Motivo: Não implementado no frontend
-- Alternativa: Usar classified_ads com tipo "service_needed"

-- ❌ SERVICE_PROPOSALS - Propostas de serviço
-- Motivo: Não implementado no frontend
-- Alternativa: Usar contact_agreements

-- ❌ SERVICE_HISTORY - Histórico de serviços
-- Motivo: Não implementado no frontend
-- Alternativa: Usar appointments com status "completed"

-- ❌ PORTFOLIO_PROJECTS - Projetos do portfólio
-- Motivo: Não implementado no frontend
-- Alternativa: Usar user_files com categoria "portfolio"

-- ❌ SUPPORT_TICKETS - Tickets de suporte
-- Motivo: Não implementado no frontend
-- Alternativa: Sistema externo ou reports

-- ❌ SUPPORT_MESSAGES - Mensagens de suporte
-- Motivo: Não implementado no frontend
-- Alternativa: Sistema externo

-- =====================================================
-- 9. RESUMO FINAL - TABELAS ESSENCIAIS
-- =====================================================

/*
TABELAS ESSENCIAIS PARA O CONFILAR (22 tabelas):

1.  profiles                    - Perfis de usuários
2.  conversations              - Conversas
3.  conversation_participants  - Participantes
4.  messages                   - Mensagens
5.  notifications              - Notificações
6.  classified_ads             - Anúncios
7.  service_categories         - Categorias
8.  professional_services      - Serviços profissionais
9.  favorites                  - Favoritos
10. reviews                   - Avaliações
11. user_reviews              - Avaliações específicas
12. user_recommendations      - Recomendações
13. contact_agreements        - Acordos de contato
14. appointments              - Agendamentos
15. search_history            - Histórico de busca
16. feed_posts                - Feed social
17. post_likes                - Curtidas
18. post_comments             - Comentários
19. notification_preferences   - Preferências de notificação
20. user_settings             - Configurações
21. user_statistics           - Estatísticas
22. user_files                - Arquivos
23. verification_documents    - Documentos de verificação
24. user_activity_log         - Log de atividades
25. reports                   - Denúncias

TABELAS OPCIONAIS (2 tabelas):
26. work_schedules            - Horários de trabalho
27. user_preferences          - Preferências avançadas

TOTAL: 27 tabelas para um sistema completo
*/

-- =====================================================
-- 10. VERIFICAÇÃO DE INTEGRIDADE
-- =====================================================

-- Verificar se todas as tabelas essenciais existem
SELECT 
    'VERIFICAÇÃO DE TABELAS ESSENCIAIS' as secao,
    COUNT(*) as total_tabelas,
    COUNT(CASE WHEN tablename IN (
        'profiles', 'conversations', 'conversation_participants', 'messages',
        'notifications', 'classified_ads', 'service_categories', 'professional_services',
        'favorites', 'reviews', 'user_reviews', 'user_recommendations',
        'contact_agreements', 'appointments', 'search_history', 'feed_posts',
        'post_likes', 'post_comments', 'notification_preferences', 'user_settings',
        'user_statistics', 'user_files', 'verification_documents', 'user_activity_log',
        'reports'
    ) THEN 1 END) as tabelas_essenciais_encontradas
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar tabelas faltantes
SELECT 
    'TABELAS FALTANTES' as secao,
    tablename as tabela_necessaria
FROM (
    VALUES 
        ('profiles'), ('conversations'), ('conversation_participants'), ('messages'),
        ('notifications'), ('classified_ads'), ('service_categories'), ('professional_services'),
        ('favorites'), ('reviews'), ('user_reviews'), ('user_recommendations'),
        ('contact_agreements'), ('appointments'), ('search_history'), ('feed_posts'),
        ('post_likes'), ('post_comments'), ('notification_preferences'), ('user_settings'),
        ('user_statistics'), ('user_files'), ('verification_documents'), ('user_activity_log'),
        ('reports')
) AS necessarias(tablename)
WHERE NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = necessarias.tablename
);

-- =====================================================
-- 11. RECOMENDAÇÕES FINAIS
-- =====================================================

SELECT 
    'RECOMENDAÇÕES' as tipo,
    '1. Execute o script verificar-banco-completo.sql para diagnóstico completo' as acao;

SELECT 
    'RECOMENDAÇÕES' as tipo,
    '2. Execute o script corrigir-banco-automatico.sql para correções automáticas' as acao;

SELECT 
    'RECOMENDAÇÕES' as tipo,
    '3. Crie as tabelas faltantes conforme identificado acima' as acao;

SELECT 
    'RECOMENDAÇÕES' as tipo,
    '4. Atualize o arquivo src/types/database.ts para refletir a estrutura real' as acao;

SELECT 
    'RECOMENDAÇÕES' as tipo,
    '5. Teste todas as funcionalidades após as correções' as acao;
