# 🔧 Configuração da Tabela evaluation_requests

## ⚠️ IMPORTANTE: Execute estes comandos no Supabase Dashboard

### 1. Criar a Tabela

Execute este SQL no **SQL Editor** do Supabase Dashboard:

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

### 2. Configurar RLS (Row Level Security)

Execute este SQL no **SQL Editor** do Supabase Dashboard:

```sql
-- Habilitar RLS
ALTER TABLE evaluation_requests ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver suas próprias solicitações (como requester ou target)
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

### 3. Função para Atualizar updated_at

Execute este SQL no **SQL Editor** do Supabase Dashboard:

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

### 4. Comentários para Documentação

Execute este SQL no **SQL Editor** do Supabase Dashboard:

```sql
-- Comentários para documentação
COMMENT ON TABLE evaluation_requests IS 'Solicitações de avaliação mútua entre usuários';
COMMENT ON COLUMN evaluation_requests.requester_id IS 'ID do usuário que solicitou a avaliação';
COMMENT ON COLUMN evaluation_requests.target_id IS 'ID do usuário que recebeu a solicitação';
COMMENT ON COLUMN evaluation_requests.status IS 'Status da solicitação: pending, accepted, rejected, completed';
```

## ✅ Verificação

Após executar todos os comandos acima, teste se a tabela foi criada corretamente:

1. Vá para **Table Editor** no Supabase Dashboard
2. Procure pela tabela `evaluation_requests`
3. Verifique se as colunas estão corretas
4. Teste inserir um registro de teste

## 🚨 Problemas Comuns

### Erro 404 ao acessar a tabela
- **Causa**: Tabela não foi criada
- **Solução**: Execute os comandos SQL acima

### Erro de permissão
- **Causa**: RLS não configurado corretamente
- **Solução**: Verifique se as políticas RLS foram criadas

### Erro de foreign key
- **Causa**: Referência para tabela `profiles` não existe
- **Solução**: Verifique se a tabela `profiles` existe e tem a coluna `id`

## 📞 Suporte

Se encontrar problemas, verifique:
1. Se você tem permissões de administrador no Supabase
2. Se a tabela `profiles` existe
3. Se as políticas RLS estão ativas
4. Se os índices foram criados corretamente
