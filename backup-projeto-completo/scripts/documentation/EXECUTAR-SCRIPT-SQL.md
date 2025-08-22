# 🚀 EXECUTAR SCRIPT SQL PARA CORRIGIR UPLOAD DE AVATARES

## 📋 **PASSO A PASSO:**

### **1. Acessar Supabase:**
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### **2. Abrir SQL Editor:**
- Clique em **"SQL Editor"** no menu lateral esquerdo
- Clique em **"New Query"**

### **3. Executar Script:**
- Cole todo o conteúdo do arquivo `fix-avatar-upload-rls-v3.sql`
- Clique em **"Run"** (botão azul)

## ✅ **RESULTADO ESPERADO:**

Após executar, você deve ver:

```
schemaname | tablename | rowsecurity
-----------+-----------+-------------
public     | profiles  | false       (durante execução)
public     | profiles  | true        (após execução)

policyname              | cmd    | qual
-----------------------+--------+------------------
profiles_select_policy  | SELECT | (auth.uid() = id)
profiles_insert_policy  | INSERT | (auth.uid() = id)
profiles_update_policy  | UPDATE | (auth.uid() = id)
profiles_delete_policy  | DELETE | (auth.uid() = id)

info            | status
----------------+--------
RLS Status      | ENABLED
Policies Count  | 4
Storage Bucket  | EXISTS
```

## 🧪 **TESTE APÓS EXECUTAR:**

1. **Vá para** `/perfil`
2. **Clique** em "Selecionar Nova Foto"
3. **Escolha** uma imagem
4. **Clique** em "Salvar Avatar"

## 🎯 **SE FUNCIONAR:**
- ✅ Avatar aparece no perfil
- ✅ Avatar aparece no menu flutuante
- ✅ Sem erros de RLS

## 🚨 **SE NÃO FUNCIONAR:**
- Me envie os logs exatos do console
- Me envie o resultado do script SQL

---

## 🚀 **EXECUTE AGORA E TESTE!**
