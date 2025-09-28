# 🚨 CORREÇÃO DOS ERROS DE AVALIAÇÃO

## ❌ Problema Atual

O sistema está tentando acessar a tabela `evaluation_requests` que ainda não foi criada no banco de dados, causando erros 404.

## ✅ Solução

### 1. Acesse o Supabase Dashboard

1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto ConfiLar
4. Vá para **SQL Editor**

### 2. Execute o SQL de Criação da Tabela

Cole e execute este SQL no **SQL Editor**:

```sql
-- Criar tabela de solicitações de avaliação
CREATE TABLE IF NOT EXISTS evaluation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, target_id)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_evaluation_requests_requester ON evaluation_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_requests_target ON evaluation_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_requests_status ON evaluation_requests(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_requests_created_at ON evaluation_requests(created_at);
```

### 3. Configure as Políticas RLS

Execute este SQL no **SQL Editor**:

```sql
-- Habilitar RLS
ALTER TABLE evaluation_requests ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver suas próprias solicitações
CREATE POLICY "Users can view their own evaluation requests" ON evaluation_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = target_id
  );

-- Política: usuários podem criar solicitações
CREATE POLICY "Users can create evaluation requests" ON evaluation_requests
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id AND auth.uid() != target_id
  );

-- Política: usuários podem atualizar suas próprias solicitações
CREATE POLICY "Users can update their own evaluation requests" ON evaluation_requests
  FOR UPDATE USING (
    auth.uid() = requester_id OR auth.uid() = target_id
  );

-- Política: usuários podem deletar suas próprias solicitações
CREATE POLICY "Users can delete their own evaluation requests" ON evaluation_requests
  FOR DELETE USING (
    auth.uid() = requester_id OR auth.uid() = target_id
  );
```

### 4. Configure o Trigger de Atualização

Execute este SQL no **SQL Editor**:

```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_evaluation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_evaluation_requests_updated_at
  BEFORE UPDATE ON evaluation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_evaluation_requests_updated_at();
```

### 5. Verificar se Funcionou

Após executar todos os comandos:

1. Vá para **Table Editor** no Supabase Dashboard
2. Procure pela tabela `evaluation_requests`
3. Verifique se as colunas estão corretas:
   - `id` (UUID, Primary Key)
   - `requester_id` (UUID, Foreign Key para profiles)
   - `target_id` (UUID, Foreign Key para profiles)
   - `status` (VARCHAR, com CHECK constraint)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### 6. Testar o Sistema

Execute este comando para testar:

```bash
node scripts/test-table-exists.js
```

Se retornar "✅ Tabela evaluation_requests existe e está funcionando!", o problema foi resolvido.

## 🔧 Alternativa: Script de Teste

Se preferir, execute este script que testa a tabela:

```bash
node scripts/test-evaluation-system.js
```

## 📞 Se Ainda Houver Problemas

1. **Verifique as permissões**: Certifique-se de que você tem acesso de administrador
2. **Verifique a tabela profiles**: A tabela `profiles` deve existir
3. **Verifique as políticas RLS**: As políticas devem estar ativas
4. **Verifique os índices**: Os índices devem ter sido criados

## 🎯 Resultado Esperado

Após executar todos os comandos, o sistema de avaliações deve funcionar corretamente:

- ✅ Botão "Solicitar Avaliação" no chat
- ✅ Página de avaliações funcionando
- ✅ Solicitações sendo criadas e gerenciadas
- ✅ Sem mais erros 404
