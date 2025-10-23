-- ============================================
-- SISTEMA DE NOTIFICAÇÕES PARA REFERRALS
-- ============================================

-- ============================================
-- 1. FUNÇÃO PARA CRIAR NOTIFICAÇÃO DE PONTOS
-- ============================================
CREATE OR REPLACE FUNCTION notify_referral_points()
RETURNS TRIGGER AS $$
DECLARE
  referrer_name TEXT;
  referred_name TEXT;
  title_text TEXT;
  message_text TEXT;
  notification_type TEXT;
  emoji TEXT;
BEGIN
  -- Buscar nome do usuário que vai receber os pontos
  SELECT full_name INTO referrer_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Buscar nome do usuário indicado (se houver referral_id)
  IF NEW.referral_id IS NOT NULL THEN
    SELECT full_name INTO referred_name
    FROM profiles p
    INNER JOIN referrals r ON r.referred_id = p.id
    WHERE r.id = NEW.referral_id;
  END IF;
  
  -- Definir mensagem baseada no tipo de ação
  CASE NEW.action_type
    WHEN 'referral_signup' THEN
      emoji := '🎉';
      title_text := emoji || ' Nova Indicação!';
      message_text := COALESCE(referred_name, 'Alguém') || ' usou seu código e criou uma conta! Você ganhou ' || NEW.points || ' pontos!';
      notification_type := 'achievement';
      
    WHEN 'profile_completed' THEN
      emoji := '✅';
      title_text := emoji || ' Perfil Completado!';
      message_text := COALESCE(referred_name, 'Sua indicação') || ' completou o perfil! +' || NEW.points || ' pontos para você!';
      notification_type := 'achievement';
      
    WHEN 'first_post' THEN
      emoji := '📝';
      title_text := emoji || ' Primeiro Post!';
      message_text := COALESCE(referred_name, 'Sua indicação') || ' fez o primeiro post! +' || NEW.points || ' pontos para você!';
      notification_type := 'achievement';
      
    WHEN 'first_review' THEN
      emoji := '⭐';
      title_text := emoji || ' Primeira Avaliação!';
      message_text := COALESCE(referred_name, 'Sua indicação') || ' fez a primeira avaliação! +' || NEW.points || ' pontos para você!';
      notification_type := 'achievement';
      
    WHEN 'active_30_days' THEN
      emoji := '🔥';
      title_text := emoji || ' 30 Dias Ativo!';
      message_text := COALESCE(referred_name, 'Sua indicação') || ' completou 30 dias ativo! +' || NEW.points || ' pontos para você!';
      notification_type := 'achievement';
      
    ELSE
      emoji := '💰';
      title_text := emoji || ' Você ganhou pontos!';
      message_text := 'Você ganhou ' || NEW.points || ' pontos no programa de indicações!';
      notification_type := 'achievement';
  END CASE;
  
  -- Criar notificação
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    NEW.user_id,
    title_text,
    message_text,
    notification_type,
    'high',
    '/indicacoes',
    jsonb_build_object(
      'action_type', NEW.action_type,
      'points', NEW.points,
      'referral_id', NEW.referral_id,
      'referred_name', COALESCE(referred_name, 'Usuário'),
      'total_points_after', (SELECT total_points FROM user_referral_stats WHERE user_id = NEW.user_id)
    )
  );
  
  RAISE NOTICE '✅ Notificação de pontos criada para %: % pontos (%)', referrer_name, NEW.points, NEW.action_type;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. TRIGGER PARA PONTOS
-- ============================================
DROP TRIGGER IF EXISTS on_referral_points_added ON public.referral_points_history;
CREATE TRIGGER on_referral_points_added
  AFTER INSERT ON public.referral_points_history
  FOR EACH ROW
  EXECUTE FUNCTION notify_referral_points();

-- ============================================
-- 3. FUNÇÃO PARA MUDANÇA DE TIER
-- ============================================
CREATE OR REPLACE FUNCTION notify_tier_change()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  tier_names JSONB;
  old_tier_name TEXT;
  new_tier_name TEXT;
  emoji TEXT;
  title_text TEXT;
  message_text TEXT;
  tier_benefits TEXT;
BEGIN
  -- Só notificar se o tier realmente mudou
  IF NEW.tier = OLD.tier THEN
    RETURN NEW;
  END IF;
  
  -- Buscar nome do usuário
  SELECT full_name INTO user_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Definir nomes dos tiers
  tier_names := '{
    "none": "Sem Tier",
    "bronze": "Bronze",
    "silver": "Silver",
    "gold": "Gold",
    "platinum": "Platinum",
    "diamond": "Diamond"
  }'::jsonb;
  
  old_tier_name := tier_names->>OLD.tier;
  new_tier_name := tier_names->>NEW.tier;
  
  -- Definir emoji e benefícios baseado no novo tier
  CASE NEW.tier
    WHEN 'bronze' THEN
      emoji := '🥉';
      tier_benefits := 'Você alcançou o tier Bronze! Continue indicando amigos.';
    WHEN 'silver' THEN
      emoji := '🥈';
      tier_benefits := 'Parabéns! Tier Silver desbloqueado! Você está crescendo na comunidade.';
    WHEN 'gold' THEN
      emoji := '🥇';
      tier_benefits := 'Incrível! Tier Gold conquistado! Você é uma referência na plataforma.';
    WHEN 'platinum' THEN
      emoji := '💎';
      tier_benefits := 'Fantástico! Tier Platinum! Você é um dos melhores embaixadores do ConfiLar.';
    WHEN 'diamond' THEN
      emoji := '👑';
      tier_benefits := 'LENDÁRIO! Tier Diamond alcançado! Você está no topo do programa de indicações!';
    ELSE
      emoji := '✨';
      tier_benefits := 'Seu tier foi atualizado!';
  END CASE;
  
  title_text := emoji || ' Novo Tier: ' || new_tier_name;
  message_text := tier_benefits || ' Total de ' || NEW.total_referrals || ' indicações e ' || NEW.total_points || ' pontos!';
  
  -- Criar notificação
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    NEW.user_id,
    title_text,
    message_text,
    'achievement',
    'urgent',
    '/indicacoes',
    jsonb_build_object(
      'old_tier', OLD.tier,
      'new_tier', NEW.tier,
      'total_referrals', NEW.total_referrals,
      'total_points', NEW.total_points,
      'tier_change', true
    )
  );
  
  RAISE NOTICE '✅ Notificação de mudança de tier criada: % -> % (usuário: %)', old_tier_name, new_tier_name, user_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TRIGGER PARA MUDANÇA DE TIER
-- ============================================
DROP TRIGGER IF EXISTS on_tier_changed ON public.user_referral_stats;
CREATE TRIGGER on_tier_changed
  AFTER UPDATE ON public.user_referral_stats
  FOR EACH ROW
  WHEN (OLD.tier IS DISTINCT FROM NEW.tier)
  EXECUTE FUNCTION notify_tier_change();

-- ============================================
-- 5. FUNÇÃO PARA NOTIFICAR USUÁRIO INDICADO
-- ============================================
CREATE OR REPLACE FUNCTION notify_referred_user()
RETURNS TRIGGER AS $$
DECLARE
  referrer_name TEXT;
  referred_name TEXT;
BEGIN
  -- Apenas notificar quando um novo referral é criado
  IF TG_OP != 'INSERT' THEN
    RETURN NEW;
  END IF;
  
  -- Buscar nomes
  SELECT full_name INTO referrer_name
  FROM profiles
  WHERE id = NEW.referrer_id;
  
  SELECT full_name INTO referred_name
  FROM profiles
  WHERE id = NEW.referred_id;
  
  -- Notificar o usuário indicado
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    NEW.referred_id,
    '🎁 Bem-vindo via Indicação!',
    'Você foi indicado por ' || COALESCE(referrer_name, 'um amigo') || '! Complete seu perfil e faça seu primeiro post para ajudar seu indicador a ganhar pontos!',
    'achievement',
    'normal',
    '/onboarding',
    jsonb_build_object(
      'referrer_name', COALESCE(referrer_name, 'Amigo'),
      'referrer_id', NEW.referrer_id,
      'referral_code', NEW.referral_code,
      'is_referred', true
    )
  );
  
  RAISE NOTICE '✅ Notificação de boas-vindas enviada para usuário indicado: %', referred_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TRIGGER PARA NOTIFICAR USUÁRIO INDICADO
-- ============================================
DROP TRIGGER IF EXISTS on_referral_created ON public.referrals;
CREATE TRIGGER on_referral_created
  AFTER INSERT ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_referred_user();

-- ============================================
-- 7. FUNÇÃO PARA NOTIFICAR INDICAÇÃO COMPLETADA
-- ============================================
CREATE OR REPLACE FUNCTION notify_referral_completed()
RETURNS TRIGGER AS $$
DECLARE
  referrer_name TEXT;
  referred_name TEXT;
BEGIN
  -- Só notificar quando status muda para 'completed'
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;
  
  -- Buscar nomes
  SELECT full_name INTO referrer_name
  FROM profiles
  WHERE id = NEW.referrer_id;
  
  SELECT full_name INTO referred_name
  FROM profiles
  WHERE id = NEW.referred_id;
  
  -- Criar notificação
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    NEW.referrer_id,
    '🎉 Indicação Completada!',
    COALESCE(referred_name, 'Sua indicação') || ' completou todos os marcos! Você recebeu todos os pontos possíveis!',
    'achievement',
    'high',
    '/indicacoes',
    jsonb_build_object(
      'referral_id', NEW.id,
      'referred_name', COALESCE(referred_name, 'Usuário'),
      'status', 'completed',
      'total_points_earned', 380
    )
  );
  
  RAISE NOTICE '✅ Notificação de indicação completada enviada para %', referrer_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. TRIGGER PARA INDICAÇÃO COMPLETADA
-- ============================================
DROP TRIGGER IF EXISTS on_referral_completed ON public.referrals;
CREATE TRIGGER on_referral_completed
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION notify_referral_completed();

-- ============================================
-- 9. FUNÇÃO PARA NOTIFICAR NOVO BADGE
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_badge()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  new_badge JSONB;
  badge_tier TEXT;
  emoji TEXT;
  title_text TEXT;
  message_text TEXT;
BEGIN
  -- Verificar se badges foram adicionados
  IF jsonb_array_length(NEW.badges) <= jsonb_array_length(OLD.badges) THEN
    RETURN NEW;
  END IF;
  
  -- Buscar nome do usuário
  SELECT full_name INTO user_name
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Pegar o último badge adicionado
  new_badge := NEW.badges->-1;
  badge_tier := new_badge->>'tier';
  
  -- Definir emoji baseado no tier
  CASE badge_tier
    WHEN 'bronze' THEN
      emoji := '🥉';
    WHEN 'silver' THEN
      emoji := '🥈';
    WHEN 'gold' THEN
      emoji := '🥇';
    WHEN 'platinum' THEN
      emoji := '💎';
    WHEN 'diamond' THEN
      emoji := '👑';
    ELSE
      emoji := '🏆';
  END CASE;
  
  title_text := emoji || ' Novo Badge Conquistado!';
  message_text := 'Parabéns! Você conquistou o badge ' || UPPER(badge_tier) || '! ' || 
                  'Agora você tem ' || jsonb_array_length(NEW.badges) || ' badge(s) no programa de indicações!';
  
  -- Criar notificação
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority,
    action_url,
    metadata
  ) VALUES (
    NEW.user_id,
    title_text,
    message_text,
    'achievement',
    'urgent',
    '/indicacoes',
    jsonb_build_object(
      'badge', new_badge,
      'tier', badge_tier,
      'total_badges', jsonb_array_length(NEW.badges),
      'total_referrals', NEW.total_referrals,
      'total_points', NEW.total_points,
      'badge_earned', true
    )
  );
  
  RAISE NOTICE '✅ Notificação de novo badge % criada para %', badge_tier, user_name;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. TRIGGER PARA NOVO BADGE
-- ============================================
DROP TRIGGER IF EXISTS on_badge_earned ON public.user_referral_stats;
CREATE TRIGGER on_badge_earned
  AFTER UPDATE ON public.user_referral_stats
  FOR EACH ROW
  WHEN (jsonb_array_length(NEW.badges) > jsonb_array_length(OLD.badges))
  EXECUTE FUNCTION notify_new_badge();

-- ============================================
-- 11. ADICIONAR TIPO 'referral' À TABELA DE NOTIFICAÇÕES
-- ============================================
-- Verificar tipos existentes e adicionar 'referral'
DO $$
DECLARE
  existing_types TEXT[];
  new_constraint TEXT;
BEGIN
  -- Remover constraint se existir
  ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
  
  -- Buscar tipos únicos já existentes na tabela
  SELECT ARRAY_AGG(DISTINCT type) INTO existing_types
  FROM notifications;
  
  RAISE NOTICE 'Tipos existentes na tabela: %', existing_types;
  
  -- Adicionar nova constraint incluindo todos os tipos possíveis
  ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'message', 'review', 'booking', 'verification', 'achievement', 
    'system', 'chat', 'evaluation', 'recommendation', 'favorite',
    'follow', 'profile_view', 'post_like', 'post_comment', 'availability',
    'portfolio', 'reputation', 'admin', 'security', 'maintenance',
    'update', 'reminder', 'success', 'warning', 'error', 'info', 'referral',
    'agreement', 'proposal', 'new_conversation', 'share', 'mention',
    'like', 'comment', 'reply', 'tag', 'notification'
  ));
  
  RAISE NOTICE '✅ Constraint de notificações atualizada com suporte a "referral" e outros tipos';
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT 
  'Sistema de notificações de referral criado com sucesso!' as status,
  COUNT(*) FILTER (WHERE tgname LIKE '%referral%') as triggers_criados,
  COUNT(*) FILTER (WHERE proname LIKE 'notify_%') as funcoes_criadas
FROM pg_trigger
CROSS JOIN pg_proc
WHERE tgname LIKE '%referral%' OR proname LIKE 'notify_%';

