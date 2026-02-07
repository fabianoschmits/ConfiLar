-- 1. Enable RLS on unprotected tables
ALTER TABLE public.point_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_email_queue ENABLE ROW LEVEL SECURITY;

-- 2. Policies for point_orders (User owns their orders)
CREATE POLICY "Users can view own point orders" ON public.point_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all point orders" ON public.point_orders
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_active = true));

-- 3. Policies for point_packages (Public read, Admin write)
CREATE POLICY "Anyone can view point packages" ON public.point_packages
    FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage point packages" ON public.point_packages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_active = true));

-- 4. Policies for notification_email_queue (Restricted)
CREATE POLICY "Admins can manage email queue" ON public.notification_email_queue
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_active = true));

-- 5. Fix admins table (Close self-promotion loophole)
-- Drop the permissive insert policy
DROP POLICY IF EXISTS "Allow admin creation" ON public.admins;

-- Create a restrictive one: Only existing admins can create other admins
CREATE POLICY "Only admins can create other admins" ON public.admins
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_active = true));

-- 6. Fix help_articles (Restrict management to admins)
-- The original policy "Authenticated users can manage help articles" was too permissive
DROP POLICY IF EXISTS "Authenticated users can manage help articles" ON public.help_articles;

CREATE POLICY "Only admins can manage help articles" ON public.help_articles
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid() AND is_active = true));
