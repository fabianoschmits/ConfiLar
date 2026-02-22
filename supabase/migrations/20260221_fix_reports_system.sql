-- Migration: Fix Reports System (RLS and Schema)
-- Description: Enables RLS on reports table, creates policies for users and admins, and adds missing context columns.

-- 1. Add missing context columns with proper references
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='reported_review_id') THEN
        ALTER TABLE public.reports ADD COLUMN reported_review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='reported_comment_id') THEN
        ALTER TABLE public.reports ADD COLUMN reported_comment_id UUID REFERENCES public.post_comments(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='reported_story_id') THEN
        ALTER TABLE public.reports ADD COLUMN reported_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='reported_story_owner_id') THEN
        ALTER TABLE public.reports ADD COLUMN reported_story_owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create own reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.reports;

-- 4. Create Policies

-- Users can only see their own reports
CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT
    TO authenticated
    USING (auth.uid() = reporter_id);

-- Users can only create reports where they are the reporter
CREATE POLICY "Users can create own reports" ON public.reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all reports" ON public.reports
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- 5. Standardize type/report_type (Sync trigger if needed, but let's just ensure both are updated)
-- For now, we rely on the application to send both or we can add a trigger.
-- Given the risk of breaking existing code, we'll just ensure the columns exist and are nullable if one is missing in some inserts.
ALTER TABLE public.reports ALTER COLUMN report_type SET DEFAULT 'other';
ALTER TABLE public.reports ALTER COLUMN type SET DEFAULT 'other';
