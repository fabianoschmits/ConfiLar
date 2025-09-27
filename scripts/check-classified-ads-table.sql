-- Verificar se a tabela classified_ads existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'classified_ads'
ORDER BY ordinal_position;

-- Se a tabela não existir, criar ela
CREATE TABLE IF NOT EXISTS classified_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'professional')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location_state TEXT,
    location_city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    user_avatar_url TEXT,
    ad_type TEXT NOT NULL CHECK (ad_type IN ('oferecer', 'procurar'))
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_classified_ads_user_id ON classified_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_classified_ads_is_active ON classified_ads(is_active);
CREATE INDEX IF NOT EXISTS idx_classified_ads_created_at ON classified_ads(created_at);
CREATE INDEX IF NOT EXISTS idx_classified_ads_category ON classified_ads(category);
CREATE INDEX IF NOT EXISTS idx_classified_ads_location ON classified_ads(location_state, location_city);

-- Habilitar RLS
ALTER TABLE classified_ads ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY IF NOT EXISTS "Public read access" ON classified_ads
    FOR SELECT USING (is_active = true);

-- Política para inserção (usuários autenticados)
CREATE POLICY IF NOT EXISTS "Users can insert their own ads" ON classified_ads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualização (apenas o dono)
CREATE POLICY IF NOT EXISTS "Users can update their own ads" ON classified_ads
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para exclusão (apenas o dono)
CREATE POLICY IF NOT EXISTS "Users can delete their own ads" ON classified_ads
    FOR DELETE USING (auth.uid() = user_id);
