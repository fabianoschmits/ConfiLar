-- Create help_articles table
CREATE TABLE IF NOT EXISTS public.help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  question_example TEXT,
  answer TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN ('link', 'email')),
  action_value TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create help_logs table for metrics
CREATE TABLE IF NOT EXISTS public.help_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_message TEXT NOT NULL,
  matched_article_id UUID REFERENCES public.help_articles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_help_articles_enabled ON public.help_articles(enabled);
CREATE INDEX IF NOT EXISTS idx_help_articles_category ON public.help_articles(category);
CREATE INDEX IF NOT EXISTS idx_help_articles_keywords ON public.help_articles USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_help_logs_user_id ON public.help_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_help_logs_created_at ON public.help_logs(created_at);

-- Enable RLS
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for help_articles
-- Public can read enabled articles
CREATE POLICY "Anyone can read enabled help articles"
  ON public.help_articles
  FOR SELECT
  USING (enabled = true);

-- Authenticated users can read all articles
CREATE POLICY "Authenticated users can read all help articles"
  ON public.help_articles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete help articles
CREATE POLICY "Admins can manage help articles"
  ON public.help_articles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for help_logs
-- Users can insert their own logs (or anonymous logs)
CREATE POLICY "Users can log help interactions"
  ON public.help_logs
  FOR INSERT
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Users can read their own logs
CREATE POLICY "Users can read their own help logs"
  ON public.help_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all logs
CREATE POLICY "Admins can read all help logs"
  ON public.help_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger for help_articles
CREATE OR REPLACE FUNCTION update_help_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER help_articles_updated_at
  BEFORE UPDATE ON public.help_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_help_articles_updated_at();
