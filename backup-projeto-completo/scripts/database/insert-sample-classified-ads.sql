-- Script para inserir anúncios de exemplo
-- Execute no SQL Editor do Supabase como usuário postgres

-- ========================================
-- INSERIR ANÚNCIOS DE EXEMPLO
-- ========================================

-- Primeiro, vamos verificar se há profiles disponíveis
SELECT COUNT(*) as total_profiles FROM profiles;

-- Inserir anúncios de exemplo
INSERT INTO classified_ads (
  user_id,
  user_name,
  user_type,
  title,
  description,
  category,
  location_state,
  location_city,
  contact_info
) VALUES 
-- Anúncio de profissional de construção
(
  (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
  'João Silva',
  'professional',
  'Serviços de Construção e Reforma',
  'Ofereço serviços de construção, reforma e manutenção residencial. Trabalho com qualidade e pontualidade. Orçamentos gratuitos.',
  'construction',
  'SP',
  'São Paulo',
  'WhatsApp: (11) 99999-9999'
),
-- Anúncio de profissional de limpeza
(
  (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
  'Maria Santos',
  'professional',
  'Serviços de Limpeza Residencial',
  'Ofereço serviços de limpeza residencial e comercial. Limpeza geral, organização e higienização. Preços acessíveis.',
  'cleaning',
  'SP',
  'São Paulo',
  'Telefone: (11) 88888-8888'
),
-- Anúncio de cliente procurando pedreiro
(
  (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1),
  'Carlos Oliveira',
  'client',
  'Preciso de Pedreiro para Reforma',
  'Preciso de um pedreiro qualificado para fazer uma pequena reforma no banheiro. Trabalho simples e rápido.',
  'construction',
  'SP',
  'São Paulo',
  'Contato via plataforma'
),
-- Anúncio de cliente procurando serviços de limpeza
(
  (SELECT id FROM profiles WHERE user_type = 'client' LIMIT 1),
  'Ana Costa',
  'client',
  'Preciso de Serviços de Limpeza',
  'Preciso de serviços de limpeza para minha casa. Limpeza geral e organização. Preferência para fins de semana.',
  'cleaning',
  'SP',
  'São Paulo',
  'WhatsApp: (11) 77777-7777'
),
-- Anúncio de profissional de tecnologia
(
  (SELECT id FROM profiles WHERE user_type = 'professional' LIMIT 1),
  'Pedro Tech',
  'professional',
  'Serviços de Tecnologia e TI',
  'Ofereço serviços de suporte técnico, manutenção de computadores, instalação de sistemas e consultoria em TI.',
  'technology',
  'SP',
  'São Paulo',
  'Email: pedro@tech.com'
);

-- Verificar se os anúncios foram inseridos
SELECT COUNT(*) as total_ads FROM classified_ads;

-- Ver os anúncios inseridos
SELECT 
  id,
  user_name,
  user_type,
  title,
  category,
  location_state,
  created_at
FROM classified_ads 
ORDER BY created_at DESC;

-- ========================================
-- ALTERNATIVA: INSERIR SEM DEPENDER DE PROFILES
-- ========================================

-- Se não houver profiles ou der erro, use este comando alternativo:
/*
INSERT INTO classified_ads (
  user_id,
  user_name,
  user_type,
  title,
  description,
  category,
  location_state,
  location_city,
  contact_info
) VALUES 
(
  gen_random_uuid(),
  'João Silva',
  'professional',
  'Serviços de Construção e Reforma',
  'Ofereço serviços de construção, reforma e manutenção residencial. Trabalho com qualidade e pontualidade.',
  'construction',
  'SP',
  'São Paulo',
  'WhatsApp: (11) 99999-9999'
),
(
  gen_random_uuid(),
  'Maria Santos',
  'professional',
  'Serviços de Limpeza Residencial',
  'Ofereço serviços de limpeza residencial e comercial. Limpeza geral, organização e higienização.',
  'cleaning',
  'SP',
  'São Paulo',
  'Telefone: (11) 88888-8888'
);
*/
