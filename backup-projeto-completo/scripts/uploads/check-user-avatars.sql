-- 🔍 Script para verificar avatares dos usuários
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela profiles
SELECT 'Estrutura da tabela profiles:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('id', 'email', 'full_name', 'avatar_url')
ORDER BY ordinal_position;

-- 2. Verificar usuários existentes e seus avatares
SELECT 'Usuários e avatares:' as info;
SELECT 
    id,
    email,
    full_name,
    avatar_url,
    CASE 
        WHEN avatar_url IS NULL THEN '❌ Sem foto'
        WHEN avatar_url = '' THEN '❌ URL vazia'
        ELSE '✅ Com foto: ' || avatar_url
    END as status_avatar
FROM profiles 
ORDER BY created_at DESC;

-- 3. Verificar se há URLs de avatar válidas
SELECT 'URLs de avatar válidas:' as info;
SELECT 
    id,
    full_name,
    avatar_url
FROM profiles 
WHERE avatar_url IS NOT NULL 
AND avatar_url != ''
AND avatar_url != 'null'
ORDER BY created_at DESC;

-- 4. Contar usuários com e sem fotos
SELECT 'Contagem de avatares:' as info;
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(avatar_url) as com_foto,
    COUNT(*) - COUNT(avatar_url) as sem_foto,
    ROUND((COUNT(avatar_url)::float / COUNT(*)::float) * 100, 2) as percentual_com_foto
FROM profiles;

-- 5. Verificar se há problemas com URLs
SELECT 'Problemas com URLs:' as info;
SELECT 
    id,
    full_name,
    avatar_url,
    CASE 
        WHEN avatar_url LIKE 'http%' THEN '✅ URL válida'
        WHEN avatar_url LIKE 'data:%' THEN '✅ Data URL'
        WHEN avatar_url IS NULL THEN '❌ NULL'
        WHEN avatar_url = '' THEN '❌ Vazio'
        WHEN avatar_url = 'null' THEN '❌ String "null"'
        ELSE '❓ Formato desconhecido: ' || avatar_url
    END as tipo_url
FROM profiles 
ORDER BY created_at DESC;

-- ✅ RESULTADO ESPERADO:
-- - Campo avatar_url existe na tabela
-- - Usuários listados com status de avatar
-- - Contagem de usuários com/sem fotos
-- - Identificação de problemas com URLs
