
-- Cleanup RLS: Remove duplicate policies
-- Description: There are duplicate policies with slightly different names (e.g. "Users can view their own verification" vs "verifications").

-- Drop the singular versions (assuming the plural ones 'verifications' are the standard we want to keep)
DROP POLICY IF EXISTS "Users can view their own verification" ON professional_verifications;
DROP POLICY IF EXISTS "Users can insert their own verification" ON professional_verifications;
DROP POLICY IF EXISTS "Individual can view their own verifications" ON professional_verifications;

-- Verify we keep:
-- "Users can view their own verifications"
-- "Users can insert their own verifications"
-- "Users can update their own verifications"
-- "Users can delete their own verifications"
-- "Admins can view all verifications"
-- "Admins can update all verifications"

-- Also nice to ensure descriptions/names are consistent, but dropping duplicates is the main step.
