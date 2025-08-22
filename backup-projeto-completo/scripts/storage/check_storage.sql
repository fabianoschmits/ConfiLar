-- =====================================================
-- VERIFICAÇÃO SIMPLES DO STORAGE
-- =====================================================

-- 1. VERIFICAR SE O SCHEMA STORAGE EXISTE
SELECT 
    'SCHEMAS EXISTENTES' as info,
    schema_name
FROM information_schema.schemata 
WHERE schema_name IN ('public', 'auth', 'storage')
ORDER BY schema_name;

-- 2. VERIFICAR SE AS TABELAS DE STORAGE EXISTEM
SELECT 
    'TABELAS DE STORAGE' as info,
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'storage'
ORDER BY table_name;

-- 3. VERIFICAR SE OS BUCKETS EXISTEM (se storage estiver funcionando)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        RAISE NOTICE '✅ Schema storage existe';
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
            RAISE NOTICE '✅ Tabela storage.buckets existe';
            
            -- Contar buckets
            RAISE NOTICE '📦 Buckets encontrados: %', (
                SELECT COUNT(*) FROM storage.buckets
            );
            
            -- Listar buckets
            RAISE NOTICE '📋 Lista de buckets:';
            FOR bucket_record IN SELECT id, name, public FROM storage.buckets LOOP
                RAISE NOTICE '  - %: % (public: %)', 
                    bucket_record.id, 
                    bucket_record.name, 
                    bucket_record.public;
            END LOOP;
            
        ELSE
            RAISE NOTICE '❌ Tabela storage.buckets não existe';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
            RAISE NOTICE '✅ Tabela storage.policies existe';
            
            -- Contar políticas
            RAISE NOTICE '🔒 Políticas encontradas: %', (
                SELECT COUNT(*) FROM storage.policies
            );
            
        ELSE
            RAISE NOTICE '❌ Tabela storage.policies não existe';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Schema storage não existe';
        RAISE NOTICE '⚠️ Storage não está habilitado no Supabase';
        RAISE NOTICE '📋 Habilite em: Dashboard > Storage > Enable Storage';
    END IF;
END $$;

-- 4. VERIFICAR ESTRUTURA DA TABELA PROFILES
SELECT 
    'ESTRUTURA PROFILES' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;






