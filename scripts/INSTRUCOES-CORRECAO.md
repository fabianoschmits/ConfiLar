# 🔧 INSTRUÇÕES PARA CORRIGIR O BANCO DE DADOS

## ❌ Problema Identificado
- Existe 1 registro com tipo `love` (incompatível)
- Campos faltantes em várias tabelas
- Relacionamentos não configurados
- Erros 400 nas queries

## ✅ Solução

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard/project/[seu-projeto]/sql
- Clique em "SQL Editor"

### 2. Execute o Script SQL
- Copie TODO o conteúdo do arquivo: `scripts/fix-database-pure-sql.sql`
- Cole no SQL Editor
- Clique em "Run" ou "Execute"

### 3. Verifique o Resultado
- O script deve executar sem erros
- Você verá mensagens de sucesso
- Os relacionamentos serão criados

### 4. Teste a Aplicação
- Execute: `node scripts/run-final-test.js`
- Todos os testes devem passar
- Os erros 400 devem desaparecer

## 📋 O que o Script Faz

1. ✅ **Remove registros incompatíveis** (tipo `love`)
2. ✅ **Adiciona campo `name`** na tabela `profiles`
3. ✅ **Adiciona campos faltantes** em todas as tabelas
4. ✅ **Cria relacionamentos** (foreign keys)
5. ✅ **Configura políticas RLS**
6. ✅ **Cria índices** para performance
7. ✅ **Atualiza tipos de reação** para os 4 emojis corretos

## 🎯 Resultado Esperado

Após executar o script:
- ✅ Erro de constraint desaparecerá
- ✅ Todas as queries funcionarão
- ✅ Sistema de reações funcionará
- ✅ Erros 400 desaparecerão
- ✅ Aplicação funcionará normalmente

## ⚠️ Importante

- **Execute apenas o script SQL** no Supabase Dashboard
- **NÃO execute** os arquivos JavaScript no SQL Editor
- **O script é seguro** e não afetará dados importantes
- **Apenas 1 registro** será removido (tipo `love`)

## 🚀 Próximos Passos

1. Execute o script SQL
2. Teste com: `node scripts/run-final-test.js`
3. Se tudo funcionar, a aplicação estará corrigida!
