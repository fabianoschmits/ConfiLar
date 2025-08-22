# Configuração Completa do Supabase para ConfiLar v3

## 📋 Visão Geral

Este documento descreve como configurar completamente o Supabase para o projeto ConfiLar v3, incluindo todas as tabelas, funcionalidades e configurações necessárias.

## 🚀 Passos para Configuração

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Digite um nome para o projeto (ex: "confilar-v3")
6. Digite uma senha forte para o banco de dados
7. Escolha uma região (recomendado: São Paulo)
8. Clique em "Create new project"

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Para obter essas chaves:**
1. No dashboard do Supabase, vá para "Settings" > "API"
2. Copie a "Project URL" para `NEXT_PUBLIC_SUPABASE_URL`
3. Copie a "anon public" para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copie a "service_role" para `SUPABASE_SERVICE_ROLE_KEY`

### 3. Executar Migrações do Banco de Dados

#### Opção A: Via SQL Editor do Supabase

1. No dashboard do Supabase, vá para "SQL Editor"
2. Execute cada arquivo de migração em ordem:
   - `001_initial_schema.sql`
   - `002_complete_system.sql`
   - `003_complete_functionality.sql`

#### Opção B: Via Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login

# Linkar projeto
supabase link --project-ref seu-project-ref

# Executar migrações
supabase db push
```

### 4. Configurar Storage para Upload de Arquivos

1. No dashboard do Supabase, vá para "Storage"
2. Crie os seguintes buckets:

#### Bucket: `avatars`
- **Public**: ✅ Sim
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp

#### Bucket: `documents`
- **Public**: ❌ Não
- **File size limit**: 10MB
- **Allowed MIME types**: application/pdf, image/jpeg, image/png

#### Bucket: `portfolio`
- **Public**: ✅ Sim
- **File size limit**: 10MB
- **Allowed MIME types**: image/jpeg, image/png, image/webp

#### Bucket: `verification`
- **Public**: ❌ Não
- **File size limit**: 10MB
- **Allowed MIME types**: application/pdf, image/jpeg, image/png

### 5. Configurar Políticas de Storage

Execute as seguintes políticas no SQL Editor:

```sql
-- Política para avatars (público)
CREATE POLICY "Public avatars are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para documentos (privado)
CREATE POLICY "Users can view own documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para portfolio (público)
CREATE POLICY "Public portfolio images are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Professionals can upload portfolio images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para verificação (privado)
CREATE POLICY "Users can view own verification documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload verification documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'verification' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 6. Configurar Autenticação

1. No dashboard do Supabase, vá para "Authentication" > "Settings"
2. Configure as seguintes opções:

#### Site URL
```
http://localhost:3000
```

#### Redirect URLs
```
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
http://localhost:3000/perfil
```

#### Email Templates
- Personalize os templates de email para confirmação e reset de senha
- Use o idioma português brasileiro

### 7. Configurar Funções Edge (Opcional)

Para funcionalidades avançadas como processamento de imagens:

```sql
-- Função para redimensionar imagens
CREATE OR REPLACE FUNCTION resize_image(
    image_url TEXT,
    width INTEGER DEFAULT 800,
    height INTEGER DEFAULT 600
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    -- Implementar lógica de redimensionamento
    RETURN image_url;
END;
$$;
```

### 8. Configurar Webhooks (Opcional)

Para integrações com serviços externos:

1. Vá para "Database" > "Hooks"
2. Configure webhooks para eventos importantes:
   - Novo usuário registrado
   - Agendamento criado
   - Pagamento processado

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `profiles` | Perfis dos usuários | ✅ |
| `appointments` | Agendamentos | ✅ |
| `favorites` | Favoritos | ✅ |
| `payments` | Pagamentos | ✅ |
| `portfolio_projects` | Projetos do portfólio | ✅ |
| `earnings` | Ganhos dos profissionais | ✅ |
| `user_files` | Arquivos dos usuários | ✅ |
| `support_tickets` | Tickets de suporte | ✅ |

### Funcionalidades Implementadas

- ✅ **Autenticação completa** (login, registro, reset de senha)
- ✅ **Perfis de usuário** (cliente e profissional)
- ✅ **Sistema de agendamentos**
- ✅ **Sistema de favoritos**
- ✅ **Histórico de pagamentos**
- ✅ **Portfólio de projetos**
- ✅ **Sistema de avaliações**
- ✅ **Chat/mensagens**
- ✅ **Feed social**
- ✅ **Upload de arquivos**
- ✅ **Sistema de notificações**
- ✅ **Suporte e tickets**
- ✅ **Cupons e descontos**
- ✅ **Estatísticas e relatórios**

## 🔧 Configurações de Desenvolvimento

### Habilitar Logs SQL

```sql
-- Ativar logs SQL para debug
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

### Configurar Timezone

```sql
-- Configurar timezone para Brasil
SET timezone = 'America/Sao_Paulo';
```

## 🧪 Testando a Configuração

### 1. Testar Conexão

```bash
npm run dev
```

Verifique se não há erros de conexão no console.

### 2. Testar Autenticação

1. Acesse a página de registro
2. Crie uma conta de teste
3. Verifique se o perfil foi criado automaticamente

### 3. Testar Upload de Arquivos

1. Faça login
2. Vá para o perfil
3. Tente fazer upload de uma imagem de avatar

### 4. Testar Funcionalidades

1. Crie um agendamento
2. Adicione um profissional aos favoritos
3. Verifique se as notificações funcionam

## 🚨 Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto está ativo no Supabase

### Erro de RLS
- Verifique se as políticas estão configuradas corretamente
- Confirme se o usuário está autenticado

### Erro de Storage
- Verifique se os buckets foram criados
- Confirme se as políticas de storage estão aplicadas

### Erro de Migração
- Execute as migrações em ordem
- Verifique se não há conflitos de nomes

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guia de Storage](https://supabase.com/docs/guides/storage)
- [Guia de Edge Functions](https://supabase.com/docs/guides/functions)

## 🔄 Manutenção

### Backup Automático
O Supabase faz backup automático diário. Para backup manual:

1. Vá para "Settings" > "Database"
2. Clique em "Create backup"

### Monitoramento
1. Vá para "Dashboard" para ver métricas
2. Configure alertas para uso de recursos
3. Monitore logs de erro

### Atualizações
- Mantenha o Supabase atualizado
- Teste migrações em ambiente de desenvolvimento
- Faça backup antes de atualizações importantes

---

**Nota**: Este guia assume que você está usando Next.js 13+ com App Router. Ajuste conforme necessário para sua configuração específica.










