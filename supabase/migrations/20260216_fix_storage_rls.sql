
-- Fix Storage RLS: Allow Admins to view all verification documents

-- 1. Policy for Admins to SELECT (download/view) all files in the bucket
-- storage.objects is the table for Supabase Storage
CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents'
  AND (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
      AND admins.is_active = true
    )
  )
);

-- Note: Users already have a policy to view their own files (usually). 
-- If not, we should probably add that too, but the priority is Admin visibility.
