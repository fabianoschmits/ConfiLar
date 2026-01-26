-- Fix mutable search_path in DB functions
-- Adding SET search_path = public to prevent schema hijacking

BEGIN;

-- 1. Fix get_public_url
CREATE OR REPLACE FUNCTION public.get_public_url(bucket_name text, file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN 'https://nyqhzbfjgmaeyoyawkrq.supabase.co/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$function$;

-- 2. Fix cleanup_temp_files
CREATE OR REPLACE FUNCTION public.cleanup_temp_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'temp' 
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$function$;

-- 3. Fix increment_points
CREATE OR REPLACE FUNCTION public.increment_points(uid uuid, amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  current_points INTEGER;
BEGIN
  UPDATE users
  SET points = COALESCE(points, 0) + amount
  WHERE id = uid
  RETURNING points INTO current_points;
  
  RETURN current_points;
END;
$function$;

-- 4. Fix notify_review
CREATE OR REPLACE FUNCTION public.notify_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  reviewer_name TEXT;
BEGIN
  SELECT full_name INTO reviewer_name FROM profiles WHERE id = NEW.reviewer_id;
  
  PERFORM create_simple_notification(
    NEW.reviewed_id,
    'Nova avaliação de ' || COALESCE(reviewer_name, 'Usuário'),
    'Você recebeu uma avaliação de ' || NEW.rating_person || ' estrelas',
    'review',
    '/perfil/' || NEW.reviewed_id
  );
  
  RETURN NEW;
END;
$function$;

COMMIT;
