BEGIN;
-- Public download URLs stay public. Mutations are never public.
DROP POLICY IF EXISTS "Allow public access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar owner mutations" ON storage.objects;
CREATE POLICY "Avatar owner mutations" ON storage.objects FOR ALL TO authenticated
USING (bucket_id='avatars' AND auth.uid() IS NOT NULL AND (
 (storage.foldername(name))[1]=auth.uid()::text OR owner_id=auth.uid()::text OR
 name LIKE auth.uid()::text || '-%' OR name LIKE 'avatars/' || auth.uid()::text || '-%'))
WITH CHECK (bucket_id='avatars' AND auth.uid() IS NOT NULL AND (
 (storage.foldername(name))[1]=auth.uid()::text OR
 name LIKE auth.uid()::text || '-%' OR name LIKE 'avatars/' || auth.uid()::text || '-%'));
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload story images" ON storage.objects;
DROP POLICY IF EXISTS "Feed image owner mutations" ON storage.objects;
CREATE POLICY "Feed image owner mutations" ON storage.objects FOR ALL TO authenticated
USING (bucket_id='feed-images' AND auth.uid() IS NOT NULL AND (
 owner_id=auth.uid()::text OR (storage.foldername(name))[1]=auth.uid()::text OR
 ((storage.foldername(name))[1] IN ('feed','stories','classifieds') AND (storage.foldername(name))[2]=auth.uid()::text)))
WITH CHECK (bucket_id='feed-images' AND auth.uid() IS NOT NULL AND (
 (storage.foldername(name))[1]=auth.uid()::text OR
 ((storage.foldername(name))[1] IN ('feed','stories','classifieds') AND (storage.foldername(name))[2]=auth.uid()::text)));
COMMIT;
