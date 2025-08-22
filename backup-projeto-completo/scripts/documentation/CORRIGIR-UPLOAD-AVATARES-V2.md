# 🔒 CORRIGIR ERRO RLS NO UPLOAD DE AVATARES (VERSÃO 2)

## ❌ **PROBLEMA IDENTIFICADO:**
```
Erro no upload: new row violates row-level security policy
```

**E também:**
```
ERROR: 42P01: relation "storage.policies" does not exist
```

## 🔍 **CAUSA:**
- **RLS mal configurado** na tabela `profiles`
- **Versão do Supabase** pode não ter a tabela `storage.policies`
- **Políticas conflitantes** impedindo operações

## 🛠️ **SOLUÇÃO (VERSÃO 2):**

### **1. Acessar o Supabase Dashboard:**
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto
4. Clique em **"SQL Editor"** no menu lateral

### **2. Executar o Script Corrigido:**
1. Clique em **"New Query"**
2. Cole todo o conteúdo do arquivo `fix-avatar-upload-rls-v2.sql`
3. Clique em **"Run"** para executar

### **3. Verificar o Resultado:**
O script deve mostrar:
- ✅ **RLS Status: ENABLED**
- ✅ **Policies Count: 4**
- ✅ **Storage Bucket: EXISTS**

## 🔧 **O QUE O SCRIPT V2 FAZ:**

#### **1. Corrige Políticas RLS:**
- ✅ Remove políticas antigas e conflitantes
- ✅ Cria políticas corretas para usuários autenticados
- ✅ Permite SELECT, INSERT, UPDATE, DELETE do próprio perfil

#### **2. Verifica Storage:**
- ✅ Verifica se o bucket 'avatars' existe
- ✅ Detecta automaticamente se `storage.policies` existe
- ✅ Funciona com todas as versões do Supabase

#### **3. Políticas Criadas:**
- **SELECT:** Usuários podem ver seu próprio perfil
- **INSERT:** Usuários podem criar seu próprio perfil
- **UPDATE:** Usuários podem atualizar seu próprio perfil
- **DELETE:** Usuários podem deletar seu próprio perfil

## 🧪 **TESTE APÓS CORREÇÃO:**

### **1. Tentar Upload Novamente:**
1. Vá para a página de perfil (`/perfil`)
2. Clique em "Selecionar Nova Foto"
3. Escolha uma imagem
4. Clique em "Salvar Avatar"

### **2. Verificar Console:**
Deve aparecer:
```
📸 Tentando fazer upload de avatar...
📁 Nome do arquivo: user-id-timestamp.jpg
✅ Upload realizado com sucesso: {...}
✅ Perfil atualizado com avatar: {...}
```

### **3. Verificar Resultado:**
- ✅ Avatar aparece na página de perfil
- ✅ Avatar aparece no menu flutuante
- ✅ Sem erros de RLS

## 🚨 **SE O ERRO PERSISTIR:**

### **1. Verificar Logs do Supabase:**
1. Vá para **"Logs"** no menu lateral
2. Procure por erros relacionados a `profiles` ou `storage`

### **2. Verificar Políticas:**
Execute no SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### **3. Verificar Bucket:**
Execute no SQL Editor:
```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

### **4. Verificar Status RLS:**
Execute no SQL Editor:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

## 📋 **COMANDOS DE VERIFICAÇÃO:**

### **Verificar Status RLS:**
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

### **Verificar Políticas:**
```sql
SELECT policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### **Verificar Bucket:**
```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

### **Verificar se storage.policies existe:**
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'storage' 
    AND table_name = 'policies'
);
```

## 🎯 **RESULTADO ESPERADO:**

Após executar o script V2, você deve conseguir:
1. ✅ **Fazer upload** de avatares sem erros
2. ✅ **Ver a foto** no perfil
3. ✅ **Ver a foto** no menu flutuante
4. ✅ **Sem erros** de RLS no console
5. ✅ **Sem erros** de tabelas inexistentes

## 🔄 **DIFERENÇAS DA VERSÃO 2:**

- ✅ **Compatível** com todas as versões do Supabase
- ✅ **Detecta automaticamente** se `storage.policies` existe
- ✅ **Não falha** se tabelas não existirem
- ✅ **Mais robusto** e adaptável

---

## 🚀 **EXECUTE O SCRIPT V2 E TESTE NOVAMENTE!**

**Esta versão deve funcionar independentemente da versão do seu Supabase!** 🎯

**Se ainda houver problemas, me informe os logs exatos que aparecem no console!** 🔍
