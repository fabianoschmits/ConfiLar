# 🗂️ Configuração do Bucket service-images - ConfiLar

## ✅ **Status: Arquivo de Migração Criado!**

Criei um arquivo de migração completo para configurar o bucket `service-images` no Supabase, que será usado para armazenar as fotos dos trabalhos no feed social.

## 📁 **Arquivo Criado:**

- **`supabase/migrations/006_service_images_bucket.sql`** - Migração completa para o bucket

## 🚀 **O que a Migração Faz:**

### **1. 🗂️ Criação do Bucket:**
- **Nome:** `service-images`
- **Visibilidade:** Público (para visualização)
- **Tamanho máximo:** 5MB por arquivo
- **Formatos aceitos:** JPG, PNG, WebP

### **2. 🔒 Políticas RLS (Row Level Security):**
- **Upload:** Apenas usuários autenticados
- **Atualização:** Apenas o proprietário do arquivo
- **Exclusão:** Apenas o proprietário do arquivo
- **Visualização:** Público (todos podem ver)

### **3. 🧹 Função de Limpeza:**
- **Limpeza automática** de arquivos órfãos
- **Remove arquivos** não referenciados em posts
- **Execução diária** recomendada

## 📋 **Como Aplicar a Migração:**

### **Opção 1: SQL Editor do Supabase (Recomendado)**
1. **Acesse** o painel do Supabase
2. **Vá para** SQL Editor
3. **Copie e cole** o conteúdo de `006_service_images_bucket.sql`
4. **Execute** o script
5. **Verifique** as mensagens de sucesso

### **Opção 2: Via CLI do Supabase**
```bash
# Se você tiver o CLI configurado
supabase db push
```

## 🔍 **Verificação da Configuração:**

### **1. Verificar Bucket:**
- **Vá para** Storage > Buckets no Supabase
- **Confirme** que `service-images` foi criado
- **Verifique** se está marcado como público

### **2. Verificar Políticas:**
- **Vá para** Storage > Policies
- **Confirme** que as 4 políticas foram criadas:
  - Allow authenticated uploads
  - Allow owner updates
  - Allow owner deletes
  - Allow public viewing

### **3. Testar Upload:**
- **Acesse** a página `/feed`
- **Clique** em "Novo Post"
- **Teste** o upload de uma imagem
- **Verifique** se aparece no preview

## 🚨 **Solução Alternativa (Temporária):**

Se você preferir usar o bucket `avatars` existente temporariamente, altere estas linhas no arquivo `ImageUploadFeed.tsx`:

```typescript
// Linha 67: Alterar de 'service-images' para 'avatars'
.from('avatars')

// Linha 75: Alterar de 'service-images' para 'avatars'
.from('avatars')
```

## 🎯 **Configurações do Bucket:**

### **Especificações Técnicas:**
- **ID:** `service-images`
- **Nome:** `service-images`
- **Público:** ✅ Sim
- **Tamanho máximo:** 5MB (5.242.880 bytes)
- **Formatos aceitos:** JPG, PNG, WebP
- **RLS:** ✅ Ativo
- **Políticas:** 4 políticas de segurança

### **Segurança:**
- **Upload:** Apenas usuários logados
- **Modificação:** Apenas proprietário
- **Visualização:** Público
- **Exclusão:** Apenas proprietário

## 🔧 **Função de Limpeza Automática:**

### **Como Funciona:**
- **Remove arquivos** não referenciados em posts
- **Executa** após 24 horas de inatividade
- **Mantém** apenas arquivos em uso

### **Para Execução Automática:**
- **Configure** um cron job no seu servidor
- **Ou use** ferramentas como pg_cron
- **Execute** diariamente para manutenção

## 📱 **Teste da Funcionalidade:**

### **1. Teste Básico:**
- [ ] Bucket foi criado
- [ ] Políticas RLS estão ativas
- [ ] Upload de imagem funciona
- [ ] Preview da imagem aparece

### **2. Teste de Segurança:**
- [ ] Usuário não logado não pode fazer upload
- [ ] Usuário logado pode fazer upload
- [ ] Imagens são visíveis publicamente
- [ ] Apenas proprietário pode deletar

### **3. Teste de Validação:**
- [ ] Apenas imagens são aceitas
- [ ] Tamanho máximo é respeitado
- [ ] Formatos corretos são aceitos
- [ ] Mensagens de erro são claras

## 🎉 **Resultado Esperado:**

Após aplicar a migração, você terá:
- ✅ **Bucket configurado** para fotos dos trabalhos
- ✅ **Segurança RLS** ativa e funcionando
- ✅ **Upload de imagens** funcionando no feed
- ✅ **Sistema completo** de armazenamento de fotos

## 🚨 **Próximos Passos:**

1. **Aplique** a migração no Supabase
2. **Verifique** se o bucket foi criado
3. **Teste** o upload de imagens no feed
4. **Confirme** que tudo está funcionando

## 💡 **Dicas Importantes:**

- **Execute** a migração apenas uma vez
- **Verifique** as mensagens de sucesso
- **Teste** a funcionalidade antes de usar em produção
- **Monitore** o uso do storage para otimizar custos

O bucket `service-images` está pronto para ser configurado e funcionará perfeitamente com o sistema de upload de imagens do feed social! 🚀✨










