-- =====================================================
-- CONFI LAR - ATUALIZAÇÃO DOS TIPOS TYPESCRIPT
-- =====================================================
--
-- Após executar a limpeza do banco, você precisa atualizar
-- o arquivo src/types/database.ts para remover as tabelas
-- que não existem mais.
--
-- =====================================================

/*
INSTRUÇÕES PARA ATUALIZAR OS TIPOS TYPESCRIPT:

1. Abra o arquivo: src/types/database.ts

2. Remova as seguintes seções de tabelas:

   - achievements
   - ad_interests  
   - ad_messages
   - appointment_history
   - appointment_notifications
   - portfolio_projects
   - service_listings
   - service_requests
   - service_proposals
   - service_history
   - service_reviews
   - service_favorites
   - support_tickets
   - support_messages
   - professional_availability
   - weekly_templates
   - trust_metrics
   - verification_scores

3. Mantenha as seguintes tabelas (em uso):
   - profiles
   - classified_ads
   - notifications
   - notification_preferences
   - messages
   - conversations
   - conversation_participants
   - reviews
   - user_reviews
   - user_recommendations
   - favorites
   - contact_agreements
   - appointments
   - search_history
   - service_categories
   - professional_services
   - feed_posts
   - post_comments
   - post_likes
   - reports
   - work_schedules
   - user_activity_log
   - user_files
   - user_preferences
   - user_settings
   - user_statistics
   - verification_documents

4. Atualize os tipos exportados removendo:
   - ServiceListing
   - ServiceRequest
   - ServiceProposal
   - ServiceHistory
   - ServiceReview
   - PortfolioProject
   - SupportTicket
   - SupportMessage
   - TrustMetrics
   - VerificationScores

5. Mantenha os tipos:
   - Profile
   - ClassifiedAd
   - Notification
   - Message
   - Conversation
   - Review
   - UserReview
   - UserRecommendation
   - Favorite
   - ContactAgreement
   - Appointment
   - SearchHistory
   - ServiceCategory
   - ProfessionalService
   - FeedPost
   - PostComment
   - PostLike
   - Report
   - WorkSchedule
   - UserActivityLog
   - UserFile
   - UserPreference
   - UserSetting
   - UserStatistic
   - VerificationDocument

6. Execute o comando para regenerar os tipos:
   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.ts

7. Teste a aplicação para garantir que não há erros de tipo.
*/

-- =====================================================
-- COMANDO PARA REGENERAR TIPOS
-- =====================================================

/*
Execute este comando no terminal:

npx supabase gen types typescript --project-id oolqodaehouaidxuowtw > src/types/database.ts

Ou se você tiver o Supabase CLI configurado:

supabase gen types typescript --local > src/types/database.ts
*/

-- =====================================================
-- VERIFICAÇÃO DOS TIPOS
-- =====================================================

/*
Após atualizar os tipos, verifique se não há erros:

1. Execute: npm run build
2. Verifique se não há erros de TypeScript
3. Teste as funcionalidades principais:
   - Login/Cadastro
   - Perfil
   - Classificados
   - Mensagens
   - Avaliações
   - Feed
   - Agendamentos
   - Denúncias
*/

-- =====================================================
-- FIM DAS INSTRUÇÕES
-- =====================================================
