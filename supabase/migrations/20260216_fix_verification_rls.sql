
-- Migration to fix RLS on professional_verifications for clients
-- Description: Allow any authenticated user (client or professional) to insert/view their own records

-- 1. Enable RLS (just to be safe)
ALTER TABLE professional_verifications ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can view their own verifications" ON professional_verifications;
DROP POLICY IF EXISTS "Users can insert their own verifications" ON professional_verifications;
DROP POLICY IF EXISTS "Professionals can insert verification requests" ON professional_verifications;
DROP POLICY IF EXISTS "Individual can view their own verifications" ON professional_verifications;

-- 3. Create new inclusive policies
-- Allow users to view their own records
CREATE POLICY "Users can view their own verifications"
ON professional_verifications FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own records (regardless of user_type)
CREATE POLICY "Users can insert their own verifications"
ON professional_verifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own records (for cancellation)
CREATE POLICY "Users can delete their own verifications"
ON professional_verifications FOR DELETE
USING (auth.uid() = user_id);

-- Allow dashboard/admins to view all (assuming they have service_role or admin user_type, 
-- but RLS usually bypassed by service_role. If admins are regular users with a flag, they need a policy)
-- Adding a policy for admins if they are querying via client with RLS enabled:
-- (Optional: adjust based on actual admin implementation)
