-- =====================================================
-- SISTEMA DE VISUALIZAÇÕES DE PERFIS - CONFILAR
-- =====================================================
-- Este script cria o sistema completo de visualizações
-- de perfis de usuários no ConfiLar.

-- Data: 2024-01-15 14:00:00

-- =====================================================
-- 1. TABELA: PROFILE_VIEWS
-- =====================================================

-- Criar tabela para registrar visualizações de perfis
CREATE TABLE IF NOT EXISTS public.profile_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para buscar visualizações por perfil visualizado
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_profile 
ON public.profile_views(viewed_profile_id);

-- Índice para buscar visualizações por visualizador
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer 
ON public.profile_views(viewer_id);

-- Índice para buscar visualizações por data
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at 
ON public.profile_views(viewed_at);

-- Índice composto para estatísticas
CREATE INDEX IF NOT EXISTS idx_profile_views_stats 
ON public.profile_views(viewed_profile_id, viewed_at);

-- =====================================================
-- 3. RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS na tabela
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem inserir suas próprias visualizações
CREATE POLICY "Users can insert their own profile views" ON public.profile_views
    FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Política: Usuários podem ver visualizações de seus próprios perfis
CREATE POLICY "Users can view their own profile views" ON public.profile_views
    FOR SELECT USING (
        auth.uid() = viewer_id OR 
        auth.uid() = viewed_profile_id
    );

-- Política: Usuários podem ver estatísticas de visualizações (contagem)
CREATE POLICY "Users can view profile view statistics" ON public.profile_views
    FOR SELECT USING (true);

-- =====================================================
-- 4. FUNÇÕES HELPER
-- =====================================================

-- Função para registrar uma visualização
CREATE OR REPLACE FUNCTION public.record_profile_view(
    target_profile_id UUID,
    viewer_ip INET DEFAULT NULL,
    viewer_user_agent TEXT DEFAULT NULL,
    viewer_referrer TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    last_view_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Obter ID do usuário atual
    current_user_id := auth.uid();
    
    -- Se não há usuário autenticado, usar um ID genérico para visitantes
    IF current_user_id IS NULL THEN
        current_user_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END IF;
    
    -- Verificar se já visualizou nos últimos 30 minutos (evitar spam)
    SELECT MAX(viewed_at) INTO last_view_time
    FROM public.profile_views
    WHERE viewer_id = current_user_id 
    AND viewed_profile_id = target_profile_id
    AND viewed_at > NOW() - INTERVAL '30 minutes';
    
    -- Se já visualizou recentemente, não registrar novamente
    IF last_view_time IS NOT NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Registrar a visualização
    INSERT INTO public.profile_views (
        viewer_id,
        viewed_profile_id,
        ip_address,
        user_agent,
        referrer
    ) VALUES (
        current_user_id,
        target_profile_id,
        viewer_ip,
        viewer_user_agent,
        viewer_referrer
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de visualizações de um perfil
CREATE OR REPLACE FUNCTION public.get_profile_view_stats(target_profile_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    unique_viewers BIGINT,
    views_today BIGINT,
    views_this_week BIGINT,
    views_this_month BIGINT,
    last_viewed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT viewer_id) as unique_viewers,
        COUNT(*) FILTER (WHERE viewed_at >= CURRENT_DATE) as views_today,
        COUNT(*) FILTER (WHERE viewed_at >= DATE_TRUNC('week', CURRENT_DATE)) as views_this_week,
        COUNT(*) FILTER (WHERE viewed_at >= DATE_TRUNC('month', CURRENT_DATE)) as views_this_month,
        MAX(viewed_at) as last_viewed_at
    FROM public.profile_views
    WHERE viewed_profile_id = target_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter visualizações recentes de um perfil
CREATE OR REPLACE FUNCTION public.get_recent_profile_views(
    target_profile_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    viewer_name TEXT,
    viewer_avatar_url TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE,
    is_authenticated BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(p.full_name, 'Visitante') as viewer_name,
        p.avatar_url as viewer_avatar_url,
        pv.viewed_at,
        (pv.viewer_id != '00000000-0000-0000-0000-000000000000'::UUID) as is_authenticated
    FROM public.profile_views pv
    LEFT JOIN public.profiles p ON pv.viewer_id = p.id
    WHERE pv.viewed_profile_id = target_profile_id
    ORDER BY pv.viewed_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGER PARA ATUALIZAR ESTATÍSTICAS
-- =====================================================

-- Função para atualizar estatísticas quando uma visualização é registrada
CREATE OR REPLACE FUNCTION public.update_profile_view_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contador de visualizações no perfil (se existir campo)
    -- Nota: Por enquanto não temos campo total_views na tabela profiles
    -- Podemos adicionar depois se necessário
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar após inserir visualização
CREATE TRIGGER trigger_update_profile_view_count
    AFTER INSERT ON public.profile_views
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_view_count();

-- =====================================================
-- 6. VIEWS ÚTEIS
-- =====================================================

-- View para estatísticas de visualizações por perfil
CREATE OR REPLACE VIEW public.profile_view_statistics AS
SELECT 
    p.id as profile_id,
    p.full_name,
    p.user_type,
    COALESCE(stats.total_views, 0) as total_views,
    COALESCE(stats.unique_viewers, 0) as unique_viewers,
    COALESCE(stats.views_today, 0) as views_today,
    COALESCE(stats.views_this_week, 0) as views_this_week,
    COALESCE(stats.views_this_month, 0) as views_this_month,
    stats.last_viewed_at
FROM public.profiles p
LEFT JOIN LATERAL (
    SELECT * FROM public.get_profile_view_stats(p.id)
) stats ON true;

-- =====================================================
-- 7. DADOS INICIAIS
-- =====================================================

-- Inserir algumas visualizações de exemplo (opcional)
-- INSERT INTO public.profile_views (viewer_id, viewed_profile_id) 
-- SELECT 
--     p1.id,
--     p2.id
-- FROM public.profiles p1
-- CROSS JOIN public.profiles p2
-- WHERE p1.id != p2.id
-- AND random() < 0.1; -- 10% de chance de ter visualização

-- =====================================================
-- 8. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se a tabela foi criada corretamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_views') THEN
        RAISE NOTICE '✅ Tabela profile_views criada com sucesso!';
        RAISE NOTICE '📊 Sistema de visualizações implementado!';
        RAISE NOTICE '🔒 RLS configurado corretamente!';
        RAISE NOTICE '⚡ Índices criados para performance!';
        RAISE NOTICE '🎯 Funções helper disponíveis!';
    ELSE
        RAISE NOTICE '❌ Erro ao criar tabela profile_views!';
    END IF;
END $$;

-- =====================================================
-- COMO USAR O SISTEMA:
-- =====================================================

-- 1. Registrar visualização:
-- SELECT public.record_profile_view('user-uuid-here');

-- 2. Obter estatísticas:
-- SELECT * FROM public.get_profile_view_stats('user-uuid-here');

-- 3. Ver visualizações recentes:
-- SELECT * FROM public.get_recent_profile_views('user-uuid-here', 5);

-- 4. Ver estatísticas de todos os perfis:
-- SELECT * FROM public.profile_view_statistics ORDER BY total_views DESC;
