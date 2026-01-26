-- Fix critical RLS vulnerability in user_bans table
-- Previous policy allowed public access (USING true)
-- New policy restricts access to verified admins only

BEGIN;

-- Drop the insecure policy
DROP POLICY IF EXISTS "Admins can view all bans" ON "public"."user_bans";

-- Create specific policies for Admins
-- 1. Admins can do everything (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage bans" 
ON "public"."user_bans" 
FOR ALL 
TO authenticated 
USING (
  is_admin(auth.uid())
)
WITH CHECK (
  is_admin(auth.uid())
);

COMMIT;
