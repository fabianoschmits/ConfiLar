-- Verificar triggers na tabela feed_posts_likes
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'feed_posts_likes';

-- Verificar funções relacionadas
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%like%' 
OR routine_name LIKE '%points%'
OR routine_name LIKE '%premium%';
