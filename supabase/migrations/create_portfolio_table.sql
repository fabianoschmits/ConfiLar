-- Create portfolio_projects table
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT,
    tags TEXT[],
    views_count INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Policies for portfolio_projects
CREATE POLICY "Public profiles are viewable by everyone" ON public.portfolio_projects
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own projects" ON public.portfolio_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.portfolio_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.portfolio_projects
    FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Portfolio images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-images');

CREATE POLICY "Users can upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their portfolio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their portfolio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
