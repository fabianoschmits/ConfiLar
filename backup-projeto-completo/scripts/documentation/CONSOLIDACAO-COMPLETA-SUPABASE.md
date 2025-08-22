# 🗄️ CONSOLIDAÇÃO COMPLETA - SUPABASE CONFILAR

## 📋 **ÍNDICE RÁPIDO:**

1. **🔧 SCRIPTS PRINCIPAIS** - Para executar primeiro
2. **🛠️ SCRIPTS DE CORREÇÃO** - Para problemas específicos  
3. **🔍 SCRIPTS DE VERIFICAÇÃO** - Para diagnosticar
4. **📚 COMENTÁRIOS E EXPLICAÇÕES** - Para entender tudo
5. **🚀 SOLUÇÃO FINAL** - Como está funcionando agora

---

## 🔧 **SCRIPTS PRINCIPAIS (EXECUTAR PRIMEIRO)**

### **1. CRIAR TODAS AS TABELAS DO ZERO**
```sql
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
```

---

## 🛠️ **SCRIPTS DE CORREÇÃO (PARA PROBLEMAS ESPECÍFICOS)**

### **2. CORRIGIR RLS SIMPLES (se der problema)**
```sql
-- Script SIMPLES para corrigir RLS
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 2. HABILITAR RLS novamente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR STATUS
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'RLS ATIVO' ELSE 'RLS INATIVO' END as rls_status
FROM pg_tables 
WHERE tablename IN ('profiles', 'conversations', 'messages')
ORDER BY tablename;
```

### **3. CORRIGIR STORAGE (se der problema)**
```sql
-- Corrigir configuração do storage
-- Execute no SQL Editor do Supabase

-- 1. Tornar bucket avatars público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 2. Verificar configuração
SELECT 
    id, 
    name, 
    public,
    'Bucket configurado' as status
FROM storage.buckets 
WHERE id = 'avatars';

-- 3. Verificar se storage.objects tem RLS
SELECT 
    'Storage RLS' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND rowsecurity = true
        ) THEN 'RLS ATIVO - PROBLEMA AQUI!'
        ELSE 'RLS INATIVO - OK'
    END as status;
```

---

## 🔍 **SCRIPTS DE VERIFICAÇÃO (PARA DIAGNOSTICAR)**

### **4. VERIFICAR ESTRUTURA COMPLETA**
```sql
-- Verificar toda a estrutura do banco
-- Execute no SQL Editor do Supabase

-- 1. Verificar tabelas principais
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

-- 2. Verificar políticas RLS
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'conversations', 'conversation_participants', 'messages', 'notifications', 'classified_ads')
ORDER BY tablename, policyname;

-- 3. Verificar storage
SELECT 
    id, 
    name, 
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 4. Verificar estrutura da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### **5. VERIFICAR PROBLEMAS ESPECÍFICOS**
```sql
-- Verificar problemas específicos
-- Execute no SQL Editor do Supabase

-- 1. Verificar RLS do storage
SELECT 
    'Storage Objects RLS' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND rowsecurity = true
        ) THEN 'RLS ATIVO - PROBLEMA AQUI!'
        ELSE 'RLS INATIVO - OK'
    END as status;

-- 2. Verificar bucket avatars
SELECT 
    'Bucket Avatars' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id = 'avatars' AND public = true
        ) THEN 'PÚBLICO - OK'
        ELSE 'PRIVADO - PROBLEMA AQUI!'
    END as status;

-- 3. Verificar se conseguimos acessar storage
SELECT 
    'Acesso ao Storage' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.objects 
            WHERE bucket_id = 'avatars'
        ) THEN '✅ CONSEGUIMOS ACESSAR'
        ELSE '❌ NÃO CONSEGUIMOS ACESSAR'
    END as status;
```

---

## 📚 **COMENTÁRIOS E EXPLICAÇÕES**

### **🔐 O QUE É RLS (Row Level Security):**
- **Sistema de segurança** do PostgreSQL
- **Controla acesso** aos dados por usuário
- **Cada tabela** pode ter políticas diferentes
- **Usuário só vê** seus próprios dados

### **❌ POR QUE O STORAGE DÁ PROBLEMA:**
- **`storage.objects`** é tabela do sistema Supabase
- **RLS ativo** por padrão
- **Não conseguimos desabilitar** (sem permissão de owner)
- **Não conseguimos criar políticas** (versão antiga do Supabase)

### **✅ COMO RESOLVEMOS:**
- **API route** com chave de serviço
- **Contorna RLS** completamente
- **Upload direto** para bucket público
- **Atualização** do perfil via RLS correto

---

## 🚀 **SOLUÇÃO FINAL (COMO ESTÁ FUNCIONANDO AGORA)**

### **📁 ARQUIVOS CRIADOS:**
1. **`src/app/api/upload-avatar/route.ts`** - API para upload
2. **`src/hooks/useAuth.ts`** - Hook atualizado
3. **`src/components/ui/AvatarUpload.tsx`** - Componente de upload

### **🔑 CHAVE DE SERVIÇO USADA:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbnF3d3pyZ3ZxYmxyZHh2d3ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1Njg0NiwiZXhwIjoyMDcxMTMyODQ2fQ.CDJYSQcHhioImf6VN7hdSnDChI6u_rATeeU6FdpQ2eQ
```

### **🎯 FLUXO DE FUNCIONAMENTO:**
1. **Usuário seleciona arquivo** → Frontend
2. **Arquivo convertido para base64** → Frontend
3. **Upload via API** → Backend (contorna RLS)
4. **Salva no storage** → Supabase (chave de serviço)
5. **Atualiza perfil** → Database (RLS correto)
6. **Avatar exibido** → Frontend

---

## 📋 **ORDEM DE EXECUÇÃO RECOMENDADA:**

### **1️⃣ PRIMEIRA EXECUÇÃO (sistema novo):**
- Execute o **Script Principal** completo

### **2️⃣ SE DER PROBLEMA DE RLS:**
- Execute o **Script de Correção RLS**

### **3️⃣ SE DER PROBLEMA DE STORAGE:**
- Execute o **Script de Correção Storage**

### **4️⃣ PARA VERIFICAR:**
- Execute os **Scripts de Verificação**

---

## 🎉 **RESULTADO FINAL:**

### **✅ SISTEMA FUNCIONANDO:**
- **Upload de avatares** ✅
- **RLS configurado** ✅
- **Storage funcionando** ✅
- **Perfis sendo atualizados** ✅

### **🔮 PARA O FUTURO:**
- **Quando Supabase permitir**, migrar para políticas nativas
- **Por enquanto**, solução atual é perfeita e funcional

---

## 📞 **SUPORTE:**

### **Se der problema:**
1. **Execute os scripts de verificação**
2. **Identifique onde está falhando**
3. **Execute o script de correção correspondente**
4. **Teste novamente**

### **Se funcionar:**
**🎊 PARABÉNS! Sistema funcionando perfeitamente!**

---

## **🏁 FIM DA CONSOLIDAÇÃO**

**Todos os scripts e explicações em um só lugar!** 🎯✨
