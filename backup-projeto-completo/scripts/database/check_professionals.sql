-- =====================================================
-- VERIFICAÇÃO E CRIAÇÃO DE PROFISSIONAIS DE EXEMPLO
-- =====================================================

-- 1. VERIFICAR PROFISSIONAIS EXISTENTES
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE PROFISSIONAIS ===';
    
    -- Contar total de usuários
    RAISE NOTICE '👥 Total de usuários: %', (
        SELECT COUNT(*) FROM auth.users
    );
    
    -- Contar total de perfis
    RAISE NOTICE '📋 Total de perfis: %', (
        SELECT COUNT(*) FROM public.profiles
    );
    
    -- Contar profissionais
    RAISE NOTICE '🔨 Total de profissionais: %', (
        SELECT COUNT(*) FROM public.profiles WHERE user_type = 'professional'
    );
    
    -- Contar clientes
    RAISE NOTICE '👤 Total de clientes: %', (
        SELECT COUNT(*) FROM public.profiles WHERE user_type = 'client'
    );
    
    -- Mostrar alguns profissionais existentes
    RAISE NOTICE '📊 Profissionais existentes:';
    FOR prof IN 
        SELECT id, full_name, user_type, location_state, location_city, is_verified
        FROM public.profiles 
        WHERE user_type = 'professional'
        LIMIT 5
    LOOP
        RAISE NOTICE '  - %: % (% - %%) [%]', 
            prof.id, 
            prof.full_name, 
            prof.location_state, 
            prof.location_city,
            prof.is_verified ? 'Verificado' : 'Não verificado';
    END LOOP;
END $$;

-- 2. CRIAR PROFISSIONAIS DE EXEMPLO SE NÃO HOUVER
DO $$
DECLARE
    prof_count INTEGER;
    new_user_id UUID;
BEGIN
    -- Verificar quantos profissionais existem
    SELECT COUNT(*) INTO prof_count FROM public.profiles WHERE user_type = 'professional';
    
    IF prof_count = 0 THEN
        RAISE NOTICE '⚠️ Nenhum profissional encontrado. Criando exemplos...';
        
        -- Criar usuário 1: Pedreiro
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'pedreiro@exemplo.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            id, email, full_name, user_type, bio, location_state, location_city,
            phone, is_verified, badge, rating, total_reviews, is_available,
            professional_experience_years, professional_services
        ) VALUES (
            new_user_id,
            'pedreiro@exemplo.com',
            'João Silva - Pedreiro',
            'professional',
            'Pedreiro experiente com mais de 15 anos de experiência em construção civil. Especializado em alvenaria, acabamentos e reformas residenciais.',
            'SP',
            'São Paulo',
            '(11) 99999-1111',
            true,
            'gold',
            4.8,
            127,
            true,
            15,
            ARRAY['Alvenaria', 'Acabamentos', 'Reformas', 'Construção']
        );
        
        RAISE NOTICE '✅ Profissional 1 criado: João Silva (Pedreiro)';
        
        -- Criar usuário 2: Eletricista
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'eletricista@exemplo.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            id, email, full_name, user_type, bio, location_state, location_city,
            phone, is_verified, badge, rating, total_reviews, is_available,
            professional_experience_years, professional_services
        ) VALUES (
            new_user_id,
            'eletricista@exemplo.com',
            'Carlos Santos - Eletricista',
            'professional',
            'Eletricista certificado com 12 anos de experiência. Instalações elétricas residenciais e comerciais, manutenção e reparos.',
            'SP',
            'São Paulo',
            '(11) 99999-2222',
            true,
            'silver',
            4.6,
            89,
            true,
            12,
            ARRAY['Instalações Elétricas', 'Manutenção', 'Reparos', 'Projetos']
        );
        
        RAISE NOTICE '✅ Profissional 2 criado: Carlos Santos (Eletricista)';
        
        -- Criar usuário 3: Diarista
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'diarista@exemplo.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            id, email, full_name, user_type, bio, location_state, location_city,
            phone, is_verified, badge, rating, total_reviews, is_available,
            professional_experience_years, professional_services
        ) VALUES (
            new_user_id,
            'diarista@exemplo.com',
            'Maria Oliveira - Diarista',
            'professional',
            'Diarista profissional com 8 anos de experiência. Limpeza residencial, organização e cuidados com a casa.',
            'RJ',
            'Rio de Janeiro',
            '(21) 99999-3333',
            true,
            'bronze',
            4.7,
            156,
            true,
            8,
            ARRAY['Limpeza Residencial', 'Organização', 'Lavagem', 'Passar Roupas']
        );
        
        RAISE NOTICE '✅ Profissional 3 criado: Maria Oliveira (Diarista)';
        
        -- Criar usuário 4: Encanador
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'encanador@exemplo.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            id, email, full_name, user_type, bio, location_state, location_city,
            phone, is_verified, badge, rating, total_reviews, is_available,
            professional_experience_years, professional_services
        ) VALUES (
            new_user_id,
            'encanador@exemplo.com',
            'Pedro Costa - Encanador',
            'professional',
            'Encanador especializado com 10 anos de experiência. Instalação e reparo de sistemas hidráulicos, desentupimentos.',
            'MG',
            'Belo Horizonte',
            '(31) 99999-4444',
            false,
            'bronze',
            4.5,
            67,
            true,
            10,
            ARRAY['Instalação Hidráulica', 'Reparos', 'Desentupimento', 'Manutenção']
        );
        
        RAISE NOTICE '✅ Profissional 4 criado: Pedro Costa (Encanador)';
        
        -- Criar usuário 5: Pintor
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'pintor@exemplo.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        ) RETURNING id INTO new_user_id;
        
        INSERT INTO public.profiles (
            id, email, full_name, user_type, bio, location_state, location_city,
            phone, is_verified, badge, rating, total_reviews, is_available,
            professional_experience_years, professional_services
        ) VALUES (
            new_user_id,
            'pintor@exemplo.com',
            'Roberto Lima - Pintor',
            'professional',
            'Pintor profissional com 14 anos de experiência. Pinturas residenciais e comerciais, texturas e acabamentos especiais.',
            'RS',
            'Porto Alegre',
            '(51) 99999-5555',
            true,
            'silver',
            4.9,
            203,
            true,
            14,
            ARRAY['Pintura Residencial', 'Pintura Comercial', 'Texturas', 'Acabamentos']
        );
        
        RAISE NOTICE '✅ Profissional 5 criado: Roberto Lima (Pintor)';
        
        RAISE NOTICE '🎉 5 profissionais de exemplo criados com sucesso!';
        
    ELSE
        RAISE NOTICE '✅ Já existem % profissionais cadastrados', prof_count;
    END IF;
END $$;

-- 3. VERIFICAÇÃO FINAL
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
    
    -- Contar profissionais
    RAISE NOTICE '🔨 Total de profissionais: %', (
        SELECT COUNT(*) FROM public.profiles WHERE user_type = 'professional'
    );
    
    -- Contar por estado
    RAISE NOTICE '📊 Distribuição por estado:';
    FOR state_count IN 
        SELECT location_state, COUNT(*) as total
        FROM public.profiles 
        WHERE user_type = 'professional' AND location_state IS NOT NULL
        GROUP BY location_state
        ORDER BY total DESC
    LOOP
        RAISE NOTICE '  - %: % profissionais', state_count.location_state, state_count.total;
    END LOOP;
    
    -- Contar por cidade
    RAISE NOTICE '🏙️ Distribuição por cidade:';
    FOR city_count IN 
        SELECT location_city, COUNT(*) as total
        FROM public.profiles 
        WHERE user_type = 'professional' AND location_city IS NOT NULL
        GROUP BY location_city
        ORDER BY total DESC
    LOOP
        RAISE NOTICE '  - %: % profissionais', city_count.location_city, city_count.total;
    END LOOP;
    
    RAISE NOTICE '✅ Sistema de profissionais configurado!';
END $$;






