-- Add ALL potentially missing columns to portfolio_projects table
-- This script is safe to run even if columns already exist (IF NOT EXISTS)

ALTER TABLE public.portfolio_projects 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure RLS is enabled
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Re-apply policies to ensure they cover correct permissions
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.portfolio_projects;

CREATE POLICY "Public profiles are viewable by everyone" ON public.portfolio_projects
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own projects" ON public.portfolio_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.portfolio_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.portfolio_projects
    FOR DELETE USING (auth.uid() = user_id);

-- Explicitly notify PostgREST to reload schema cache (works in some Supabase setups)
NOTIFY pgrst, 'reload config';
