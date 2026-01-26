-- Add missing columns to portfolio_projects table
ALTER TABLE public.portfolio_projects 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Make sure RLS is enabled
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Re-apply policies to be safe (DROP first to avoid errors if they act differently)
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
