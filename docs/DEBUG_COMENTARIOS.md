# Debug dos Comentários

## 🔍 Problema identificado

Os comentários não estão sendo exibidos, mesmo com o contador mostrando "2" comentários.

## 🛠️ Correções aplicadas

### 1. **Hook de Debug**
- ✅ Criado `useCommentsDebug.ts` com logs detalhados
- ✅ Adicionado console.log para rastrear o carregamento
- ✅ Adicionado tratamento de erros

### 2. **Interface de Debug**
- ✅ Adicionado painel de debug na interface
- ✅ Mostra: PostId, Loading, Comments count, Error
- ✅ Logs no console do navegador

### 3. **Scripts de Verificação**
- ✅ `scripts/check-comments-table.sql` - Verificar tabela
- ✅ `scripts/verify-comments-setup.sql` - Verificar setup completo

## 🚀 Como debugar

### Passo 1: Execute o SQL de verificação
```sql
-- Cole o conteúdo de scripts/verify-comments-setup.sql no SQL Editor
```

### Passo 2: Verifique o console do navegador
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Clique em "Comentar" em um post
4. Veja os logs que começam com 🔍

### Passo 3: Verifique a interface
- O painel de debug mostra informações em tempo real
- Verifique se há erros ou se os dados estão chegando

## 🔧 Possíveis problemas

### 1. **Tabela não existe**
- Execute `scripts/create-notification-tables.sql`
- Verifique se as tabelas foram criadas

### 2. **Políticas RLS**
- Verifique se as políticas estão corretas
- Execute o script de correção de RLS se necessário

### 3. **Dados não existem**
- Verifique se há comentários na tabela
- Teste criando um novo comentário

### 4. **Erro de permissão**
- Verifique se o usuário tem acesso à tabela
- Verifique as políticas RLS

## 📊 Informações de debug

O painel de debug mostra:
- **PostId**: ID do post sendo carregado
- **Loading**: Se está carregando (true/false)
- **Comments**: Quantidade de comentários carregados
- **Error**: Se há erro (true/false)

## 🎯 Próximos passos

1. Execute o SQL de verificação
2. Verifique os logs no console
3. Me informe o que aparece no painel de debug
4. Ajustaremos conforme necessário
