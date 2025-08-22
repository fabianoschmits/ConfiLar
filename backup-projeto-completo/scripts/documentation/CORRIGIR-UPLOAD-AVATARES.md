# 🔒 CORRIGIR ERRO RLS NO UPLOAD DE AVATARES

## ❌ **PROBLEMA IDENTIFICADO:**
```
Erro no upload: new row violates row-level security policy
```

Este erro indica que as políticas de segurança (RLS) do Supabase estão impedindo o upload de avatares.

## 🛠️ **SOLUÇÃO:**

### **1. Acessar o Supabase Dashboard:**
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto
4. Clique em **"SQL Editor"** no menu lateral

### **2. Executar o Script de Correção:**
1. Clique em **"New Query"**
2. Cole todo o conteúdo do arquivo `fix-avatar-upload-rls.sql`
3. Clique em **"Run"** para executar

### **3. Verificar o Resultado:**
O script deve mostrar:
- ✅ **RLS Status: ENABLED**
- ✅ **Policies Count: 4** (ou mais)
- ✅ **Storage Bucket: EXISTS**

## 🔍 **O QUE O SCRIPT FAZ:**

#### **1. Corrige Políticas RLS:**
- ✅ Remove políticas antigas e conflitantes
- ✅ Cria políticas corretas para usuários autenticados
- ✅ Permite SELECT, INSERT, UPDATE, DELETE do próprio perfil

#### **2. Configura Storage:**
- ✅ Verifica se o bucket 'avatars' existe
- ✅ Cria políticas para upload de arquivos
- ✅ Permite acesso público para visualização

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

## 🎯 **RESULTADO ESPERADO:**

Após executar o script, você deve conseguir:
1. ✅ **Fazer upload** de avatares sem erros
2. ✅ **Ver a foto** no perfil
3. ✅ **Ver a foto** no menu flutuante
4. ✅ **Sem erros** de RLS no console

---

## 🚀 **EXECUTE O SCRIPT E TESTE NOVAMENTE!**

**Se ainda houver problemas, me informe os logs exatos que aparecem no console!** 🔍
