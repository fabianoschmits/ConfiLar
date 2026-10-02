BEGIN;
DROP POLICY IF EXISTS cp_select_participants ON public.conversation_participants;
CREATE POLICY cp_select_participants ON public.conversation_participants FOR SELECT TO authenticated
 USING(EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_id AND auth.uid() IN(c.client_id,c.professional_id)));
DROP POLICY IF EXISTS cp_insert_self ON public.conversation_participants;
CREATE POLICY cp_insert_self ON public.conversation_participants FOR INSERT TO authenticated
 WITH CHECK(profile_id=auth.uid() AND EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_id AND auth.uid() IN(c.client_id,c.professional_id)));
DROP POLICY IF EXISTS messages_insert_simple ON public.messages;
CREATE POLICY messages_insert_simple ON public.messages FOR INSERT TO authenticated
 WITH CHECK(sender_id=auth.uid() AND EXISTS(SELECT 1 FROM public.conversations c
  WHERE c.id=conversation_id AND ((c.client_id=sender_id AND c.professional_id=receiver_id) OR (c.professional_id=sender_id AND c.client_id=receiver_id))));
REVOKE UPDATE ON public.messages FROM anon,authenticated;
GRANT UPDATE(content,is_read,read_at,is_edited,updated_at) ON public.messages TO authenticated;
CREATE OR REPLACE FUNCTION public.protect_message_edit() RETURNS trigger
LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF current_user='authenticated' THEN
  IF NEW.content IS DISTINCT FROM OLD.content AND OLD.sender_id<>auth.uid() THEN
   RAISE EXCEPTION 'Only sender can edit content' USING ERRCODE='42501';
  END IF;
  IF NEW.is_read IS DISTINCT FROM OLD.is_read AND OLD.receiver_id<>auth.uid() THEN
   RAISE EXCEPTION 'Only recipient can mark read' USING ERRCODE='42501';
  END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_message_edit ON public.messages;
CREATE TRIGGER protect_message_edit BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.protect_message_edit();
REVOKE EXECUTE ON FUNCTION public.protect_message_edit() FROM PUBLIC,anon,authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
