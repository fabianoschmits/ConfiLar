BEGIN;
-- Preserve sensitive values privately; existing public profile columns remain compatible but empty.
CREATE TABLE IF NOT EXISTS public.profile_private_details (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
 data jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_private_details ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_private_details FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.profile_private_details TO authenticated;
GRANT ALL ON public.profile_private_details TO service_role;
DROP POLICY IF EXISTS "Owner or admin private profile" ON public.profile_private_details;
CREATE POLICY "Owner or admin private profile" ON public.profile_private_details FOR SELECT TO authenticated
 USING(user_id=auth.uid() OR public.is_admin(auth.uid()));
INSERT INTO public.profile_private_details(user_id,data)
 SELECT id,jsonb_strip_nulls(jsonb_build_object('cpf_cnpj',cpf_cnpj,'birth_date',birth_date,
  'selfie_document_url',selfie_document_url,'client_verification_document',client_verification_document,
  'residence_proof_url',residence_proof_url)) FROM public.profiles
ON CONFLICT(user_id) DO UPDATE SET data=profile_private_details.data || EXCLUDED.data;
UPDATE public.profiles SET cpf_cnpj=NULL,birth_date=NULL,selfie_document_url=NULL,
 client_verification_document=NULL,residence_proof_url=NULL;

CREATE OR REPLACE FUNCTION public.store_private_profile_details()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE incoming jsonb; cpf text;
BEGIN
 incoming := jsonb_strip_nulls(jsonb_build_object('cpf_cnpj',NEW.cpf_cnpj,'birth_date',NEW.birth_date,
  'selfie_document_url',NEW.selfie_document_url,'client_verification_document',NEW.client_verification_document,
  'residence_proof_url',NEW.residence_proof_url));
 cpf := nullif(incoming->>'cpf_cnpj','');
 IF cpf IS NOT NULL AND cpf IS DISTINCT FROM (SELECT data->>'cpf_cnpj' FROM public.profile_private_details WHERE user_id=NEW.id) THEN
  PERFORM pg_advisory_xact_lock(hashtextextended('cpf:'||cpf,0));
  IF EXISTS(SELECT 1 FROM public.profile_private_details WHERE user_id<>NEW.id AND data->>'cpf_cnpj'=cpf) THEN
   RAISE EXCEPTION 'CPF/CNPJ já cadastrado' USING ERRCODE='23505';
  END IF;
 END IF;
 IF incoming<>'{}'::jsonb THEN
  INSERT INTO public.profile_private_details(user_id,data) VALUES(NEW.id,incoming)
  ON CONFLICT(user_id) DO UPDATE SET data=profile_private_details.data || EXCLUDED.data,updated_at=now();
 END IF;
 NEW.cpf_cnpj:=NULL; NEW.birth_date:=NULL; NEW.selfie_document_url:=NULL;
 NEW.client_verification_document:=NULL; NEW.residence_proof_url:=NULL;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS z_store_private_profile_details ON public.profiles;
CREATE TRIGGER z_store_private_profile_details BEFORE INSERT OR UPDATE ON public.profiles
 FOR EACH ROW EXECUTE FUNCTION public.store_private_profile_details();
REVOKE ALL ON FUNCTION public.store_private_profile_details() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.get_private_profile(p_user_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT coalesce((SELECT data FROM public.profile_private_details WHERE user_id=p_user_id AND
  (auth.uid()=p_user_id OR public.is_admin(auth.uid()) OR auth.role()='service_role')),'{}'::jsonb);
$$;
REVOKE ALL ON FUNCTION public.get_private_profile(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_private_profile(uuid) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.check_cpf_exists(p_cpf text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT length(regexp_replace(p_cpf,'\D','','g')) IN (11,14) AND EXISTS(
  SELECT 1 FROM public.profile_private_details WHERE data->>'cpf_cnpj'=regexp_replace(p_cpf,'\D','','g'));
$$;
REVOKE ALL ON FUNCTION public.check_cpf_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_cpf_exists(text) TO anon,authenticated,service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
