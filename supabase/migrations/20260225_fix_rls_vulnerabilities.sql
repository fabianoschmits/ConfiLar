-- Migration: Correção Crítica de Vulnerabilidades RLS nas Tabelas de Economia
-- Motivo: As tabelas user_points_balance e profiles permitiam escritas (UPDATE/ALL) aos próprios usuários na API PostgREST.
-- Isso permitia que um atacante abrisse o console do navegador e alterasse manualmente seus próprios saldos e pontos.

-- ==========================================
-- 1. CORRIGIR RLS DE `user_points_balance`
-- ==========================================
-- A permissão 'ALL' concedia direito de INSERT, UPDATE e DELETE ao usuário. Vamos restringir para apenas SELECT.
DROP POLICY IF EXISTS "Users can manage own balance" ON public.user_points_balance;
DROP POLICY IF EXISTS "Users can view own balance" ON public.user_points_balance;

CREATE POLICY "Users can view own balance" 
ON public.user_points_balance 
FOR SELECT 
USING (auth.uid() = user_id);

-- ==========================================
-- 2. CORRIGIR RLS DE `profiles` (PROTEÇÃO DE COLUNA)
-- ==========================================
-- A tabela profiles precisa permitir UPDATE para os usuários mudarem nome, avatar, bio, etc.
-- Contudo, não podemos permitir que a policy UPDATE modifique `points_balance` ou metadados de pontos.
-- Criamos uma trigger que anula silenciosamente qualquer alteração nessas colunas financeiras se a chamada
-- vier diretamente de uma requisição 'anon' ou 'authenticated' (PostgREST frontend client).

CREATE OR REPLACE FUNCTION public.protect_profile_financials()
RETURNS trigger AS $$
BEGIN
    -- Supabase injeta o role 'anon' ou 'authenticated' em requisições web comuns limitadas pelo RLS.
    -- Se o update vier desse tipo de requisição (frontend direto), nós engessamos as colunas financeiras
    -- forçando os novos valores a continuarem sendo os antigos.
    -- O 'service_role' (backend API de add_points) e o 'postgres' (SECURITY DEFINER interno) não caem neste IF.
    IF current_setting('role', true) IN ('anon', 'authenticated') THEN
        NEW.points_balance = OLD.points_balance;
        NEW.total_points_earned = OLD.total_points_earned;
        NEW.total_points_spent = OLD.total_points_spent;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_profile_financials_readonly ON public.profiles;

CREATE TRIGGER enforce_profile_financials_readonly
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_financials();

-- ==========================================
-- 3. REVISÃO DE `points_transfers` PARA GARANTIR SEGURANÇA
-- ==========================================
-- As transferências agora usam API segura (server route) + Admin Client. Nós revogamos os acessos diretos.
-- É válido garantir que usuários não enviem registros falsos pelo frontend.
DROP POLICY IF EXISTS "Users can manage own transfers" ON public.points_transfers;
DROP POLICY IF EXISTS "Users can view own transfers" ON public.points_transfers;

CREATE POLICY "Users can view own transfers" 
ON public.points_transfers 
FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
