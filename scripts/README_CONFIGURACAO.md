# 🚀 Configuração do Sistema de Administração - ConfiLar

## 📋 Scripts SQL para Supabase

### **1. SCRIPT PRINCIPAL** ⭐
**Arquivo:** `SQL_FINAL_SUPABASE.sql`
- **O que faz:** Cria todo o sistema de administração e denúncias
- **Quando usar:** Execute PRIMEIRO, antes de qualquer outro script
- **Como usar:** Cole todo o conteúdo no Supabase Dashboard > SQL Editor

### **2. ADICIONAR SEU EMAIL COMO ADMIN** 👤
**Arquivo:** `ADICIONAR_SEU_ADMIN.sql`
- **O que faz:** Adiciona seu email como super administrador
- **Quando usar:** APÓS executar o script principal
- **Como usar:** 
  1. Substitua `SEU_EMAIL_AQUI` pelo seu email
  2. Execute a primeira query para encontrar seu user_id
  3. Copie o user_id retornado
  4. Descomente o INSERT e substitua `SEU_USER_ID_AQUI`
  5. Execute o INSERT
  6. Execute as queries de verificação

### **3. TESTAR O SISTEMA** 🧪
**Arquivo:** `TESTAR_SISTEMA.sql`
- **O que faz:** Verifica se tudo foi criado corretamente
- **Quando usar:** APÓS executar os scripts anteriores
- **Como usar:** Execute todas as queries para verificar o status

## 🔧 Passo a Passo Completo

### **Passo 1: Executar Script Principal**
```sql
-- No Supabase Dashboard > SQL Editor
-- Cole o conteúdo de: scripts/SQL_FINAL_SUPABASE.sql
-- Clique em "Run"
```

### **Passo 2: Adicionar Seu Email como Admin**
```sql
-- 1. Encontrar seu user_id:
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 2. Adicionar como super admin (substitua SEU_USER_ID):
INSERT INTO admins (user_id, role, permissions, is_active) 
VALUES ('SEU_USER_ID', 'super_admin', 
'{"view_reports": true, "manage_reports": true, "view_analytics": true, "manage_users": true, "system_settings": true}', 
true);

-- 3. Verificar se funcionou:
SELECT is_admin() as is_admin, is_super_admin() as is_super_admin;
```

### **Passo 3: Testar na Aplicação**
1. **Acesse** `/admin/dashboard` na sua aplicação
2. **Se não for admin**: Verá tela de "Acesso Negado"
3. **Se for admin**: Verá o painel completo de administração

## 🛡️ Sistema de Segurança

### **Controle de Acesso:**
- ✅ **Apenas administradores** podem acessar `/admin/dashboard`
- ✅ **Apenas super admins** podem gerenciar outros administradores
- ✅ **Usuários comuns** só veem suas próprias denúncias
- ✅ **Administradores** veem todas as denúncias

### **Funcionalidades Admin:**
- ✅ **Gerenciar denúncias** (ver, resolver, dispensar)
- ✅ **Ver estatísticas** do sistema
- ✅ **Adicionar outros admins** (apenas super admins)
- ✅ **Remover administradores** (apenas super admins)

## 📊 Estrutura do Banco

### **Tabela `admins`:**
- `id`: UUID (PK)
- `user_id`: UUID (FK para auth.users)
- `role`: 'admin' ou 'super_admin'
- `permissions`: JSON com permissões específicas
- `is_active`: Boolean (se está ativo)
- `created_at`: Timestamp
- `created_by`: UUID (quem criou)

### **Tabela `reports`:**
- `id`: UUID (PK)
- `type`: Tipo da denúncia ('user', 'post', 'message', 'review', 'other')
- `reason`: Motivo da denúncia
- `description`: Descrição detalhada
- `status`: Status ('pending', 'reviewing', 'resolved', 'dismissed')
- `priority`: Prioridade ('low', 'medium', 'high', 'urgent')
- `reporter_id`: Quem fez a denúncia
- `reported_user_id`: Usuário denunciado
- `reported_post_id`: Post denunciado
- `reported_message_id`: Mensagem denunciada
- `admin_notes`: Notas do administrador
- `resolution`: Resolução aplicada
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## 🔍 Troubleshooting

### **Erro: "Acesso Negado"**
- ✅ Verifique se executou o script principal
- ✅ Verifique se adicionou seu email como admin
- ✅ Verifique se o email está correto
- ✅ Execute: `SELECT is_admin()` para verificar

### **Erro: "Tabela não existe"**
- ✅ Execute o script principal primeiro
- ✅ Verifique se não há erros no SQL
- ✅ Execute o script de teste

### **Erro: "Política RLS"**
- ✅ Verifique se as políticas foram criadas
- ✅ Execute o script de teste para verificar
- ✅ Verifique se o usuário está autenticado

## 📞 Suporte

Se houver problemas:
1. **Execute o script de teste** para diagnosticar
2. **Verifique os logs** do Supabase
3. **Confirme se todas as tabelas** foram criadas
4. **Teste as funções** `is_admin()` e `is_super_admin()`

## 🎉 Resultado Final

Após executar todos os scripts:
- ✅ **Sistema de denúncias** funcionando
- ✅ **Controle de acesso** ativo
- ✅ **Página de admin** protegida
- ✅ **Seu email** como super administrador
- ✅ **Sistema completo** de administração
