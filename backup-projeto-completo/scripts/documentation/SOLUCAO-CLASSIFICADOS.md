# 🔧 SOLUÇÃO PARA PROBLEMA DOS CLASSIFICADOS

## Problema Identificado
A página de classificados não está exibindo anúncios porque as tabelas necessárias (`classified_ads` e `professional_services`) podem não existir no banco de dados ou não ter dados.

## Solução

### Passo 1: Executar Script de Verificação e Criação das Tabelas

1. Acesse o **Dashboard do Supabase**
2. Vá em **SQL Editor**
3. Execute o script `fix-classified-tables.sql` que foi criado

Este script irá:
- ✅ Verificar se as tabelas existem
- ✅ Criar as tabelas se não existirem
- ✅ Configurar as políticas de segurança (RLS)
- ✅ Criar índices para melhor performance
- ✅ Inserir categorias padrão de serviços
- ✅ Evitar erros de colunas inexistentes

### Passo 2: Inserir Dados de Teste (Opcional)

Se quiser testar com dados de exemplo:
1. Execute o script `fix-professional-services.sql` no SQL Editor (corrige os problemas de referência)
2. Se ainda houver problemas, execute `diagnose-professional-services.sql` para diagnosticar

### Passo 3: Verificar se Funcionou

1. Acesse a página de classificados no seu aplicativo
2. Abra o **Console do Navegador** (F12)
3. Verifique se aparecem as mensagens de log:
   - `🔄 Carregando anúncios...`
   - `✅ Anúncios carregados: X anúncios`
   - `🔄 Carregando serviços profissionais...`
   - `✅ Serviços profissionais carregados: X serviços`

### Passo 4: Criar Anúncios de Teste

1. Faça login no aplicativo
2. Vá para a página de classificados
3. Clique em "Criar Anúncio"
4. Preencha os dados e teste a criação

## Estrutura das Tabelas

### Tabela `classified_ads`
- `id`: UUID único
- `user_id`: ID do usuário que criou o anúncio
- `user_name`: Nome do usuário
- `user_type`: 'client' ou 'professional'
- `title`: Título do anúncio
- `description`: Descrição do anúncio
- `category`: Categoria do serviço
- `location_state`: Estado
- `location_city`: Cidade
- `is_active`: Se o anúncio está ativo
- `views`: Número de visualizações

### Tabela `professional_services`
- `id`: UUID único
- `professional_id`: ID do profissional
- `category_id`: ID da categoria de serviço
- `title`: Título do serviço
- `description`: Descrição do serviço
- `price_min`: Preço mínimo
- `price_max`: Preço máximo
- `service_type`: 'hourly', 'fixed' ou 'negotiable'
- `experience_level`: 'beginner', 'intermediate', 'advanced' ou 'expert'
- `insurance_coverage`: Se tem cobertura de seguro
- `emergency_service`: Se oferece serviço de emergência
- `is_active`: Se o serviço está ativo

## Políticas de Segurança (RLS)

As tabelas têm políticas de segurança configuradas:
- ✅ Todos podem ver anúncios/serviços ativos
- ✅ Usuários autenticados podem criar anúncios
- ✅ Usuários podem editar/excluir apenas seus próprios anúncios
- ✅ Profissionais podem gerenciar apenas seus próprios serviços

## Troubleshooting

### Se ainda não aparecer nada:
1. Verifique se há erros no console do navegador
2. Confirme se as tabelas foram criadas no Supabase
3. Verifique se há dados nas tabelas
4. Confirme se as políticas RLS estão funcionando

### Se houver erros de permissão:
1. Verifique se o usuário está autenticado
2. Confirme se as políticas RLS estão corretas
3. Verifique se o usuário tem perfil na tabela `profiles`

## Comandos Úteis para Verificação

```sql
-- Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('classified_ads', 'professional_services', 'service_categories');

-- Contar registros ativos
SELECT 'classified_ads' as tabela, COUNT(*) as total FROM classified_ads WHERE is_active = true
UNION ALL
SELECT 'professional_services' as tabela, COUNT(*) as total FROM professional_services WHERE is_active = true;

-- Ver alguns dados de exemplo
SELECT title, user_name, category FROM classified_ads WHERE is_active = true LIMIT 5;
```
