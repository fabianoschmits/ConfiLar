
-- Fix RLS: Add Admin access and User Upsert capability

-- 1. Policy for Admins to VIEW ALL records
-- This relies on the 'admins' table.
CREATE POLICY "Admins can view all verifications"
ON professional_verifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.is_active = true
  )
);

-- 2. Policy for Admins to UPDATE ALL records (for approval/rejection)
CREATE POLICY "Admins can update all verifications"
ON professional_verifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.is_active = true
  )
);

-- 3. Policy for Users to UPDATE their own records
-- Required for upsert() when a record already exists (e.g. retry after rejection)
CREATE POLICY "Users can update their own verifications"
ON professional_verifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: Existing INSERT/DELETE/SELECT-OWN policies from previous migration remain active.
-- If we want to be clean, we could verify them, but adding new ones is safe.
