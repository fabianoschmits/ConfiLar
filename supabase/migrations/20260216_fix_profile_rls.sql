
-- Fix Profile RLS: Allow Admins to update user profiles (for verification badge)

-- Policy for Admins to UPDATE ALL profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.is_active = true
  )
);

-- Note: Select policies already allow public view (or authenticated view), so reading is fine.
