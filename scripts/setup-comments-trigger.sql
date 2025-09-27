-- Script para criar trigger que atualiza automaticamente o contador de comentários
-- Execute este script no Supabase SQL Editor

-- Função para atualizar o contador de comentários
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é uma inserção ou atualização
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Atualizar contador do post
    UPDATE feed_posts 
    SET comments_count = (
      SELECT COUNT(*) 
      FROM post_comments 
      WHERE post_id = NEW.post_id 
      AND is_deleted = false
    )
    WHERE id = NEW.post_id;
  END IF;
  
  -- Se é uma deleção ou soft delete
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.is_deleted = false AND NEW.is_deleted = true) THEN
    -- Atualizar contador do post
    UPDATE feed_posts 
    SET comments_count = (
      SELECT COUNT(*) 
      FROM post_comments 
      WHERE post_id = OLD.post_id 
      AND is_deleted = false
    )
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para inserção de comentários
DROP TRIGGER IF EXISTS trigger_update_comments_count_insert ON post_comments;
CREATE TRIGGER trigger_update_comments_count_insert
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Trigger para atualização de comentários
DROP TRIGGER IF EXISTS trigger_update_comments_count_update ON post_comments;
CREATE TRIGGER trigger_update_comments_count_update
  AFTER UPDATE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Trigger para deleção de comentários
DROP TRIGGER IF EXISTS trigger_update_comments_count_delete ON post_comments;
CREATE TRIGGER trigger_update_comments_count_delete
  AFTER DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- Atualizar contadores existentes
UPDATE feed_posts 
SET comments_count = (
  SELECT COUNT(*) 
  FROM post_comments 
  WHERE post_id = feed_posts.id 
  AND is_deleted = false
);
