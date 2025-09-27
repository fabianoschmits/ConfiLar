# 🔧 COMO CORRIGIR O BANCO DE DADOS

## ❌ ERRO ATUAL
Você está tentando executar código JavaScript no SQL Editor do Supabase.

## ✅ SOLUÇÃO CORRETA

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard/project/[seu-projeto]/sql
- Clique em "SQL Editor"

### 2. Execute APENAS o arquivo SQL
- Abra o arquivo: `scripts/corrigir-banco.sql`
- Copie TODO o conteúdo
- Cole no SQL Editor
- Clique em "Run"

### 3. Teste a correção
- Execute no terminal: `node scripts/run-final-test.js`
- Todos os testes devem passar

## 📋 O QUE FAZER

1. **NÃO execute** arquivos JavaScript no SQL Editor
2. **Execute apenas** o arquivo `scripts/corrigir-banco.sql`
3. **Aguarde** a execução terminar
4. **Teste** com o comando JavaScript no terminal

## 🎯 RESULTADO ESPERADO

Após executar o script SQL:
- ✅ Erro de constraint desaparecerá
- ✅ Todas as queries funcionarão
- ✅ Sistema de reações funcionará
- ✅ Erros 400 desaparecerão

## ⚠️ IMPORTANTE

- **SQL Editor** = apenas comandos SQL
- **Terminal** = comandos JavaScript
- **NÃO misture** os dois!
