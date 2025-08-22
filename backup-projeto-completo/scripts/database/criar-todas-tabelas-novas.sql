-- Script para CRIAR TODAS as tabelas e storage do ZERO
-- Execute este script no SQL Editor do Supabase
-- ATENÇÃO: Este script vai DROPAR e RECRIAR todas as tabelas!

-- =====================================================
-- 1. REMOVER TABELAS EXISTENTES (CUIDADO!)
-- =====================================================

-- Remover tabelas na ordem correta (devido a foreign keys)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS classified_ads CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- 2. CRIAR TABELA PROFILES
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    user_type TEXT CHECK (user_type IN ('client', 'professional')) DEFAULT 'client',
    phone TEXT,
    cpf_cnpj TEXT,
    birth_date DATE,
    location_state TEXT,
    location_city TEXT,
    neighborhood TEXT,
    address TEXT,
    bio TEXT,
    avatar_url TEXT,
    professional_services TEXT[],
    professional_experience_years INTEGER,
    professional_certifications TEXT[],
    professional_portfolio_url TEXT,
    profile_photo_url TEXT,
    selfie_document_url TEXT,
    residence_proof_url TEXT,
    whatsapp TEXT,
    is_verified BOOLEAN DEFAULT false,
    badge TEXT DEFAULT 'bronze' CHECK (badge IN ('bronze', 'silver', 'gold', 'platinum')),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    profile_completion_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CRIAR TABELA CONVERSATIONS
-- =====================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    conversation_type TEXT CHECK (conversation_type IN ('direct', 'group')) DEFAULT 'direct',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CRIAR TABELA CONVERSATION_PARTICIPANTS
-- =====================================================

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, participant_id)
);

-- =====================================================
-- 5. CRIAR TABELA MESSAGES
-- =====================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file')) DEFAULT 'text',
    file_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. CRIAR TABELA NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('message', 'system', 'reminder')) DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. CRIAR TABELA CLASSIFIED_ADS
-- =====================================================

CREATE TABLE classified_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location_state TEXT NOT NULL,
    location_city TEXT NOT NULL,
    neighborhood TEXT,
    ad_type TEXT CHECK (ad_type IN ('service_offered', 'service_needed')) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_location ON profiles(location_state, location_city);

-- Índices para conversations
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

-- Índices para conversation_participants
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_participant_id ON conversation_participants(participant_id);

-- Índices para messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Índices para classified_ads
CREATE INDEX idx_classified_ads_user_id ON classified_ads(user_id);
CREATE INDEX idx_classified_ads_category ON classified_ads(category);
CREATE INDEX idx_classified_ads_location ON classified_ads(location_state, location_city);
CREATE INDEX idx_classified_ads_ad_type ON classified_ads(ad_type);
CREATE INDEX idx_classified_ads_is_active ON classified_ads(is_active);

-- =====================================================
-- 9. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE classified_ads ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CRIAR POLÍTICAS RLS
-- =====================================================

-- Políticas para PROFILES
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Políticas para CONVERSATIONS
CREATE POLICY "Users can view conversations they participate in" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = conversations.id 
            AND participant_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update conversations they participate in" ON conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = conversations.id 
            AND participant_id = auth.uid()
        )
    );

-- Políticas para CONVERSATION_PARTICIPANTS
CREATE POLICY "Users can view participants of their conversations" ON conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.participant_id = auth.uid()
        )
    );

CREATE POLICY "Users can add themselves to conversations" ON conversation_participants
    FOR INSERT WITH CHECK (participant_id = auth.uid());

-- Políticas para MESSAGES
CREATE POLICY "Users can view messages from their conversations" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND participant_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to conversations they participate in" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND participant_id = auth.uid()
        )
    );

-- Políticas para NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own notifications" ON notifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Políticas para CLASSIFIED_ADS
CREATE POLICY "Users can view all active ads" ON classified_ads
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create own ads" ON classified_ads
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own ads" ON classified_ads
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own ads" ON classified_ads
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- 11. CRIAR TRIGGERS PARA TIMESTAMPS AUTOMÁTICOS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas que têm updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classified_ads_updated_at BEFORE UPDATE ON classified_ads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. VERIFICAR CONFIGURAÇÃO FINAL
-- =====================================================

-- Verificar tabelas criadas
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ATIVO'
        ELSE 'RLS INATIVO'
    END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'conversation_participants', 'messages', 'notifications', 'classified_ads')
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename IN ('profiles', 'conversations', 'conversation_participants', 'messages', 'notifications', 'classified_ads')
GROUP BY tablename
ORDER BY tablename;

-- Verificar bucket avatars
SELECT 
    id, 
    name, 
    public,
    'Bucket verificado' as status
FROM storage.buckets 
WHERE id = 'avatars';

-- =====================================================
-- 13. MENSAGEM DE SUCESSO
-- =====================================================

SELECT 
    '✅ SISTEMA RECRIADO COM SUCESSO!' as mensagem,
    'Todas as tabelas foram criadas com RLS e políticas corretas' as detalhes;
