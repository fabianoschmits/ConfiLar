BEGIN;

-- Only trusted server endpoints may charge and activate premium content.
CREATE OR REPLACE FUNCTION public.purchase_premium_content(
  p_user_id uuid, p_kind text, p_record_id uuid, p_payload jsonb,
  p_points integer, p_credit text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  target_table text;
  owner_id uuid;
  cols text;
  payment jsonb;
  saved jsonb;
BEGIN
  target_table := CASE p_kind WHEN 'AD' THEN 'classified_ads' WHEN 'POST' THEN 'feed_posts' END;
  IF target_table IS NULL OR p_user_id IS NULL OR p_payload->>'user_id' IS DISTINCT FROM p_user_id::text
     OR NOT coalesce((p_payload->>'is_premium')::boolean, false) THEN
    RAISE EXCEPTION 'Invalid premium purchase';
  END IF;
  IF p_record_id IS NOT NULL THEN
    EXECUTE format('SELECT user_id FROM public.%I WHERE id = $1 FOR UPDATE', target_table)
      INTO owner_id USING p_record_id;
    IF owner_id IS DISTINCT FROM p_user_id THEN RAISE EXCEPTION 'Content not found or not owned by buyer'; END IF;
  END IF;
  IF p_credit IS NOT NULL THEN
    IF p_kind <> 'AD' OR p_credit NOT IN ('1d', '7d') OR p_points <> 0 THEN
      RAISE EXCEPTION 'Invalid premium credit';
    END IF;
    payment := public.decrement_credit_count(p_user_id,
      CASE p_credit WHEN '1d' THEN 'credits_ad_premium_1d' ELSE 'credits_ad_premium_7d' END, 1);
  ELSE
    IF p_points IS NULL OR p_points <= 0 THEN RAISE EXCEPTION 'Invalid premium price'; END IF;
    payment := public.deduct_points(p_user_id, p_points,
      CASE p_kind WHEN 'AD' THEN 'premium_ad' ELSE 'premium_post' END,
      'Compra premium confirmada no servidor');
  END IF;
  IF NOT coalesce((payment->>'success')::boolean, false) THEN
    RAISE EXCEPTION 'Insufficient points or credits';
  END IF;
  -- Identifiers are quoted; data remains bound parameters. Omitted columns retain defaults.
  SELECT string_agg(format('%I', key), ', ' ORDER BY key) INTO cols
  FROM jsonb_object_keys(p_payload) key;
  IF p_record_id IS NULL THEN
    EXECUTE format('INSERT INTO public.%1$I (%2$s) SELECT %2$s FROM jsonb_populate_record(NULL::public.%1$I, $1) RETURNING to_jsonb(%1$I)', target_table, cols)
      INTO saved USING p_payload;
  ELSE
    EXECUTE format('UPDATE public.%1$I SET (%2$s) = (SELECT %2$s FROM jsonb_populate_record(NULL::public.%1$I, $1)) WHERE id = $2 AND user_id = $3 RETURNING to_jsonb(%1$I)', target_table, cols)
      INTO saved USING p_payload, p_record_id, p_user_id;
  END IF;
  IF saved IS NULL THEN RAISE EXCEPTION 'Premium content was not saved'; END IF;
  INSERT INTO public.notifications(user_id,type,title,message,action_url,is_read)
  VALUES(p_user_id,'success','Premium ativado!','Seu conteúdo premium foi confirmado com sucesso.',
    CASE p_kind WHEN 'AD' THEN '/classificados?ad=' || (saved->>'id') ELSE '/feed?post=' || (saved->>'id') END,false);
  RETURN saved;
END;
$$;
REVOKE ALL ON FUNCTION public.purchase_premium_content(uuid,text,uuid,jsonb,integer,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_premium_content(uuid,text,uuid,jsonb,integer,text) TO service_role;

CREATE OR REPLACE FUNCTION public.protect_paid_content()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE key text; fields text[] := ARRAY['is_premium','is_featured','premium_points_spent','premium_expires_at','premium_highlight_color'];
BEGIN
  IF current_user IN ('anon','authenticated') AND NOT coalesce(public.is_admin(auth.uid()),false) THEN
    FOREACH key IN ARRAY fields LOOP
      IF TG_OP = 'UPDATE' THEN
        IF to_jsonb(NEW)->key IS DISTINCT FROM to_jsonb(OLD)->key THEN
          RAISE EXCEPTION 'Premium fields require a server purchase' USING ERRCODE = '42501';
        END IF;
      ELSIF key <> 'premium_highlight_color' AND coalesce(to_jsonb(NEW)->>key, 'null') NOT IN ('null','false','0') THEN
        RAISE EXCEPTION 'Premium fields require a server purchase' USING ERRCODE = '42501';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.protect_paid_content() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS protect_paid_content ON public.classified_ads;
CREATE TRIGGER protect_paid_content BEFORE INSERT OR UPDATE ON public.classified_ads FOR EACH ROW EXECUTE FUNCTION public.protect_paid_content();
DROP TRIGGER IF EXISTS protect_paid_content ON public.feed_posts;
CREATE TRIGGER protect_paid_content BEFORE INSERT OR UPDATE ON public.feed_posts FOR EACH ROW EXECUTE FUNCTION public.protect_paid_content();
COMMIT;
