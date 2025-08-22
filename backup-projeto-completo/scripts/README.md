# 📁 Scripts do Projeto ConfiLar v3.0

Organização completa de todos os scripts, configurações e documentação do projeto.

## 📂 Estrutura de Pastas

```
scripts/
├── 📁 database/           # Scripts SQL do banco de dados
├── 📁 notifications/      # Scripts específicos de notificações
├── 📁 storage/           # Scripts de configuração de storage
├── 📁 uploads/           # Scripts de upload de arquivos
├── 📁 migrations/        # Scripts de migração de dados
├── 📁 setup/            # Scripts de configuração inicial
├── 📁 documentation/    # Documentação e guias
└── 📄 README.md         # Este arquivo
```

## 🗄️ Database (`/database/`)
Scripts principais do banco de dados Supabase:

### 📊 Scripts Gerais
- `DATABASE_SCHEMA_COMPLETO.sql` - Schema completo do projeto
- `supabase-agenda-complete.sql` - Configuração completa da agenda
- `supabase-storage-setup.sql` - Setup de storage buckets
- `criar-todas-tabelas-novas.sql` - Criação de todas as tabelas
- `supabase-migration-complete.sql` - Migração completa

### 🔍 Scripts de Diagnóstico
- `check-profiles-table.sql` - Verificação da tabela profiles
- `check-table-structure.sql` - Estrutura de tabelas
- `check-tables-structure.sql` - Estrutura completa
- `check-user-avatars.sql` - Verificação de avatares
- `diagnose-database.sql` - Diagnóstico geral
- `quick-check-tables.sql` - Verificação rápida

### 🔧 Scripts de Correção
- `fix-rls-simple.sql` - Correção simples de RLS
- `fix-profiles-rls.sql` - Correção RLS profiles
- `fix-duplicate-policies.sql` - Correção políticas duplicadas
- `fix-policies-conservative.sql` - Correção conservadora
- `fix-conversations-simple.sql` - Correção conversas
- `fix-conversations-direct.sql` - Correção direta conversas
- `fix-conversations-rls.sql` - Correção RLS conversas
- `fix-conversations-rls-v2.sql` - Versão 2 RLS conversas
- `simple-rls-fix.sql` - Fix simples RLS
- `simple-rls-fix-v2.sql` - Versão 2 fix RLS
- `corrigir-rls-100-limpo.sql` - Correção RLS limpa
- `limpar-politicas-completamente.sql` - Limpeza completa
- `investigar-todas-tabelas-rls.sql` - Investigação RLS

### 🗂️ Scripts de Tabelas Específicas
- `create-classified-ads-table.sql` - Tabela de classificados
- `create-user-recommendations-table.sql` - Tabela de recomendações
- `fix-classified-ads-likes.sql` - Correção likes
- `fix-classified-ads-structure.sql` - Estrutura classificados
- `fix-appointments-structure.sql` - Estrutura agendamentos
- `clean-and-recreate-agenda.sql` - Limpeza e recriação agenda
- `force-clean-agenda.sql` - Limpeza forçada agenda

## 🔔 Notifications (`/notifications/`)
Scripts específicos do sistema de notificações:

- `check_notifications_table.sql` - Verificação tabela notificações
- `create_notification_preferences.sql` - Criação preferências
- `fix_notifications_system.sql` - Correção sistema notificações
- `fix_notifications_table.sql` - Correção tabela notificações
- `test_notifications_system.sql` - Teste sistema notificações

## 💾 Storage (`/storage/`)
Configurações e correções de storage:

- `check_storage.sql` - Verificação storage
- `corrigir-storage-antigo.sql` - Correção storage antigo
- `corrigir-storage-rls.sql` - Correção RLS storage
- `corrigir-storage-simples.sql` - Correção simples storage
- `corrigir-storage-ultra-simples.sql` - Correção ultra simples
- `fix_storage_issues.sql` - Correção problemas storage
- `fix_storage_policies.sql` - Correção políticas storage
- `supabase-storage-setup.sql` - Setup completo storage

## 📤 Uploads (`/uploads/`)
Scripts relacionados a upload de arquivos:

- `fix-avatar-upload-rls.sql` - Correção RLS avatar
- `fix-avatar-upload-rls-v2.sql` - Versão 2 correção avatar
- `fix-avatar-upload-rls-v3.sql` - Versão 3 correção avatar

## 🔄 Migrations (`/migrations/`)
Scripts de migração de dados:

- `supabase-migration-complete.sql` - Migração completa

## ⚙️ Setup (`/setup/`)
Configurações iniciais e utilitários:

- `setup-supabase.js` - Script setup Supabase
- `components.json` - Configuração componentes UI

## 📚 Documentation (`/documentation/`)
Documentação e guias do projeto:

- `README.md` - Documentação principal
- `CHANGES-SUMMARY.md` - Resumo de mudanças
- `CONSOLIDACAO-COMPLETA-SUPABASE.md` - Consolidação Supabase
- `CORREÇÃO_NOTIFICAÇÕES.md` - Correção notificações
- `CORRIGIR-AVATARES-USUARIOS.md` - Correção avatares
- `CORRIGIR-RLS-PROFILES.md` - Correção RLS profiles
- `CORRIGIR-RLS-SIMPLES.md` - Correção RLS simples
- `CORRIGIR-UPLOAD-AVATARES-V2.md` - Upload avatares v2
- `CORRIGIR-UPLOAD-AVATARES.md` - Upload avatares
- `CIDADE_CADASTRO_CORRIGIDA.md` - Correção cadastro cidades
- `DATABASE_SCHEMA_COMPLETO.sql` - Schema completo (duplicado)
- `EXECUTAR-SCRIPT-SQL.md` - Guia execução SQL
- `FEED_IMAGE_UPLOAD_SETUP.md` - Setup upload feed
- `FEED_SYSTEM_SETUP.md` - Setup sistema feed
- `FUNCTIONALITY_SUMMARY.md` - Resumo funcionalidades
- `IMPROVEMENTS-SUMMARY.md` - Resumo melhorias
- `MIGRATION_INSTRUCTIONS.md` - Instruções migração
- `MOBILE_OPTIMIZATION.md` - Otimização mobile
- `PERFIL_PROFISSIONAL_CORRIGIDO.md` - Correção perfil profissional
- `PWA_GUIDE.md` - Guia PWA
- `README-location-system.md` - Sistema localização
- `RECUPERACAO-SENHA.md` - Recuperação senha
- `SERVICE_IMAGES_BUCKET_SETUP.md` - Setup bucket imagens
- `SISTEMA-CONFIANCA-REPUTACAO.md` - Sistema confiança
- `SISTEMA_CADASTRO_SIMPLIFICADO.md` - Cadastro simplificado
- `SISTEMA_COMPLETAR_PERFIL.md` - Completar perfil
- `SUPABASE_SETUP.md` - Setup Supabase
- `AVATAR_UPLOAD_SETUP.md` - Setup upload avatar
- `test-account-creation.md` - Teste criação conta
- `test-signup.md` - Teste signup

## 🚀 Como Usar

### 1. **Configuração Inicial**
```bash
# Execute na ordem:
1. scripts/setup/setup-supabase.js
2. scripts/database/supabase-agenda-complete.sql
3. scripts/database/criar-todas-tabelas-novas.sql
4. scripts/storage/supabase-storage-setup.sql
```

### 2. **Sistema de Notificações**
```bash
# Execute na ordem:
1. scripts/notifications/fix_notifications_system.sql
2. scripts/notifications/create_notification_preferences.sql
3. scripts/notifications/test_notifications_system.sql
```

### 3. **Upload de Arquivos**
```bash
# Execute:
1. scripts/uploads/fix-avatar-upload-rls-v3.sql
2. scripts/storage/fix_storage_policies.sql
```

### 4. **Correções Gerais**
```bash
# Execute na ordem recomendada:
1. scripts/database/fix-rls-simple.sql
2. scripts/database/fix-profiles-rls.sql
3. scripts/database/simple-rls-fix-v2.sql
```

## ⚠️ IMPORTANTE

### **Ordem de Execução Recomendada:**
1. **Sempre execute primeiro** os scripts de diagnóstico
2. **Execute as correções** na ordem numérica (v1, v2, v3)
3. **Teste cada mudança** antes de prosseguir
4. **Faça backup** antes de executar scripts de correção

### **Scripts de Emergência:**
- `force-clean-agenda.sql` - Use apenas em último caso
- `limpar-politicas-completamente.sql` - Limpa tudo, use com cuidado
- `corrigir-rls-100-limpo.sql` - Correção nuclear, último recurso

## 📞 Suporte

Se encontrar problemas:
1. Execute primeiro `diagnose-database.sql`
2. Verifique os logs de erro
3. Use os scripts de correção apropriados
4. Consulte a documentação específica

## 🏷️ Versões

- **v3.0** - Versão atual com todas as correções
- Scripts organizados por categoria
- Documentação completa incluída
- Sistema de notificações funcional
- Upload de arquivos corrigido
