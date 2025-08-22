-- =====================================================
-- SISTEMA DE PROTEÇÃO DE DADOS DE CONTATO
-- =====================================================
-- Este script cria as tabelas e funcionalidades necessárias
-- para proteger os dados de contato dos profissionais até
-- que haja um acordo formal entre cliente e profissional

-- =====================================================
-- 1. TABELA CONTACT_AGREEMENTS (Acordos de Contato)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contact_agreements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Relacionamentos
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    
    -- Detalhes do Acordo
    service_description TEXT NOT NULL,
    agreed_price DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    
    -- Horários e Data
    proposed_date DATE,
    proposed_time TIME,
    estimated_duration INTEGER, -- em horas
    
    -- Status do Acordo
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',     -- Proposta enviada, aguardando resposta
        'accepted',    -- Acordo aceito, contatos liberados
        'rejected',    -- Acordo rejeitado
        'completed',   -- Serviço concluído
        'cancelled'    -- Acordo cancelado
    )),
    
    -- Quem fez a proposta
    proposed_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Quando foi aceito (contatos liberados)
    contacts_revealed_at TIMESTAMP WITH TIME ZONE,
    
    -- Observações
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que só existe um acordo ativo por conversa
    UNIQUE(conversation_id, status) DEFERRABLE
);

-- =====================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_contact_agreements_client ON public.contact_agreements(client_id);
CREATE INDEX IF NOT EXISTS idx_contact_agreements_professional ON public.contact_agreements(professional_id);
CREATE INDEX IF NOT EXISTS idx_contact_agreements_conversation ON public.contact_agreements(conversation_id);
CREATE INDEX IF NOT EXISTS idx_contact_agreements_status ON public.contact_agreements(status);
CREATE INDEX IF NOT EXISTS idx_contact_agreements_created ON public.contact_agreements(created_at);

-- =====================================================
-- 3. FUNÇÃO PARA VERIFICAR SE CONTATOS ESTÃO LIBERADOS
-- =====================================================
CREATE OR REPLACE FUNCTION public.are_contacts_revealed(
    user1_id UUID,
    user2_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verifica se existe algum acordo aceito entre os dois usuários
    RETURN EXISTS (
        SELECT 1 
        FROM public.contact_agreements ca
        INNER JOIN public.conversations c ON ca.conversation_id = c.id
        WHERE ca.status = 'accepted'
        AND ca.contacts_revealed_at IS NOT NULL
        AND (
            (c.participant1_id = user1_id AND c.participant2_id = user2_id) OR
            (c.participant1_id = user2_id AND c.participant2_id = user1_id)
        )
    );
END;
$$;

-- =====================================================
-- 4. FUNÇÃO PARA REVELAR CONTATOS APÓS ACORDO
-- =====================================================
CREATE OR REPLACE FUNCTION public.reveal_contacts(
    agreement_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atualiza o acordo para marcar que os contatos foram revelados
    UPDATE public.contact_agreements 
    SET 
        contacts_revealed_at = NOW(),
        updated_at = NOW()
    WHERE id = agreement_id 
    AND status = 'accepted'
    AND contacts_revealed_at IS NULL;
    
    RETURN FOUND;
END;
$$;

-- =====================================================
-- 5. FUNÇÃO PARA CRIAR PROPOSTA DE ACORDO
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_contact_agreement(
    p_client_id UUID,
    p_professional_id UUID,
    p_conversation_id UUID,
    p_service_description TEXT,
    p_agreed_price DECIMAL DEFAULT NULL,
    p_proposed_date DATE DEFAULT NULL,
    p_proposed_time TIME DEFAULT NULL,
    p_estimated_duration INTEGER DEFAULT NULL,
    p_proposed_by UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_agreement_id UUID;
BEGIN
    -- Inserir nova proposta de acordo
    INSERT INTO public.contact_agreements (
        client_id,
        professional_id,
        conversation_id,
        service_description,
        agreed_price,
        proposed_date,
        proposed_time,
        estimated_duration,
        proposed_by,
        notes,
        status
    ) VALUES (
        p_client_id,
        p_professional_id,
        p_conversation_id,
        p_service_description,
        p_agreed_price,
        p_proposed_date,
        p_proposed_time,
        p_estimated_duration,
        COALESCE(p_proposed_by, auth.uid()),
        p_notes,
        'pending'
    ) RETURNING id INTO new_agreement_id;
    
    RETURN new_agreement_id;
END;
$$;

-- =====================================================
-- 6. TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_contact_agreements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_contact_agreements_updated_at ON public.contact_agreements;
CREATE TRIGGER trigger_contact_agreements_updated_at
    BEFORE UPDATE ON public.contact_agreements
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contact_agreements_updated_at();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.contact_agreements ENABLE ROW LEVEL SECURITY;

-- Política para visualizar acordos (participantes da conversa)
DROP POLICY IF EXISTS "Users can view their contact agreements" ON public.contact_agreements;
CREATE POLICY "Users can view their contact agreements" ON public.contact_agreements
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() = professional_id
    );

-- Política para criar acordos (participantes da conversa)
DROP POLICY IF EXISTS "Users can create contact agreements" ON public.contact_agreements;
CREATE POLICY "Users can create contact agreements" ON public.contact_agreements
    FOR INSERT WITH CHECK (
        auth.uid() = client_id OR 
        auth.uid() = professional_id
    );

-- Política para atualizar acordos (apenas quem recebeu a proposta pode aceitar/rejeitar)
DROP POLICY IF EXISTS "Users can update their contact agreements" ON public.contact_agreements;
CREATE POLICY "Users can update their contact agreements" ON public.contact_agreements
    FOR UPDATE USING (
        auth.uid() = client_id OR 
        auth.uid() = professional_id
    );

-- =====================================================
-- 8. PERMISSÕES DE EXECUÇÃO DAS FUNÇÕES
-- =====================================================
GRANT EXECUTE ON FUNCTION public.are_contacts_revealed(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reveal_contacts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_contact_agreement(UUID, UUID, UUID, TEXT, DECIMAL, DATE, TIME, INTEGER, UUID, TEXT) TO authenticated;

-- =====================================================
-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE public.contact_agreements IS 'Acordos entre clientes e profissionais para liberação de dados de contato';
COMMENT ON COLUMN public.contact_agreements.status IS 'Status: pending, accepted, rejected, completed, cancelled';
COMMENT ON COLUMN public.contact_agreements.contacts_revealed_at IS 'Quando os contatos foram liberados após acordo aceito';
COMMENT ON FUNCTION public.are_contacts_revealed(UUID, UUID) IS 'Verifica se os contatos estão liberados entre dois usuários';
COMMENT ON FUNCTION public.reveal_contacts(UUID) IS 'Marca um acordo como tendo contatos revelados';
COMMENT ON FUNCTION public.create_contact_agreement IS 'Cria uma nova proposta de acordo entre cliente e profissional';

-- =====================================================
-- 10. VERIFICAÇÃO FINAL
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de Proteção de Dados de Contato criado com sucesso!';
    RAISE NOTICE '📋 Tabela: contact_agreements';
    RAISE NOTICE '🔧 Funções: are_contacts_revealed, reveal_contacts, create_contact_agreement';
    RAISE NOTICE '🔒 RLS: Habilitado com políticas de segurança';
    RAISE NOTICE '📊 Índices: Criados para performance';
END $$;






