-- =============================================
-- ADICIONAR NOTIFICAÇÃO DE LEVEL UP
-- =============================================
-- Notifica quando usuário sobe de nível nos ConfiPoints
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. FUNÇÃO PARA NOTIFICAR LEVEL UP
-- =============================================
CREATE OR REPLACE FUNCTION notify_level_up()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  emoji TEXT;
BEGIN
  -- Só notificar se o nível subiu (não descer)
  IF NEW.level > COALESCE(OLD.level, 0) THEN
    -- Buscar nome do usuário
    SELECT full_name INTO user_name
    FROM profiles
    WHERE id = NEW.user_id;

    -- Emoji baseado no nível
    IF NEW.level >= 100 THEN
      emoji := '🏆';
    ELSIF NEW.level >= 50 THEN
      emoji := '🥇';
    ELSIF NEW.level >= 20 THEN
      emoji := '🥈';
    ELSIF NEW.level >= 10 THEN
      emoji := '🥉';
    ELSE
      emoji := '⭐';
    END IF;

    -- Criar notificação
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      priority,
      metadata,
      is_read
    ) VALUES (
      NEW.user_id,
      'achievement',
      emoji || ' Level Up!',
      'Parabéns! Você subiu para o nível ' || NEW.level || '!',
      '/confipoints/dashboard',
      'high',
      jsonb_build_object(
        'old_level', COALESCE(OLD.level, 0),
        'new_level', NEW.level,
        'total_points', NEW.balance,
        'type', 'level_up'
      ),
      FALSE
    );

    RAISE NOTICE '✅ Notificação de level up criada para % (nível %)', user_name, NEW.level;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. TRIGGER PARA LEVEL UP
-- =============================================
DROP TRIGGER IF EXISTS on_level_up ON public.user_points_balance;

CREATE TRIGGER on_level_up
  AFTER UPDATE OF level ON public.user_points_balance
  FOR EACH ROW
  WHEN (NEW.level > COALESCE(OLD.level, 0))
  EXECUTE FUNCTION notify_level_up();

-- =============================================
-- 3. GARANTIR PERMISSÕES
-- =============================================
GRANT EXECUTE ON FUNCTION notify_level_up() TO service_role;

-- =============================================
-- 4. MENSAGEM DE SUCESSO
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ NOTIFICAÇÃO DE LEVEL UP CONFIGURADA!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Funcionalidade:';
  RAISE NOTICE '   Notifica quando usuário sobe de nível';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Os níveis são calculados automaticamente';
  RAISE NOTICE '   baseados no total de pontos do usuário';
  RAISE NOTICE '';
END $$;

-- =============================================
-- FIM DO SCRIPT
-- =============================================

