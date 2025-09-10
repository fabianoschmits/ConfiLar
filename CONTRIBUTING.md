# 🤝 Guia de Contribuição - ConfiLar

Obrigado por considerar contribuir com o ConfiLar! Este documento fornece diretrizes para contribuições.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Funcionalidades](#sugerindo-funcionalidades)

## 🚀 Como Contribuir

### 1. Fork e Clone
```bash
# Fork o repositório no GitHub
# Depois clone seu fork
git clone https://github.com/SEU_USUARIO/ConfiLar-v5.git
cd ConfiLar-v5
```

### 2. Configure o Ambiente
```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### 3. Crie uma Branch
```bash
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
```

### 4. Faça suas Alterações
- Siga os [padrões de código](#padrões-de-código)
- Escreva testes quando possível
- Documente mudanças importantes

### 5. Commit e Push
```bash
git add .
git commit -m "feat: adicionar nova funcionalidade X"
git push origin feature/nova-funcionalidade
```

### 6. Abra um Pull Request
- Descreva claramente as mudanças
- Referencie issues relacionadas
- Aguarde revisão e feedback

## 🛠️ Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Git

### Configuração do Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL na ordem:
   ```sql
   -- 1. Estrutura básica
   backup-projeto-completo/scripts/database/conflar_database_complete.sql
   
   -- 2. Storage
   backup-projeto-completo/scripts/storage/supabase-storage-setup.sql
   
   -- 3. Correções (se necessário)
   fix-supabase-errors.sql
   ```

### Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 📝 Padrões de Código

### TypeScript
- Use tipagem explícita
- Evite `any`
- Documente interfaces complexas

### React/Next.js
- Use componentes funcionais
- Prefira hooks customizados
- Siga as convenções do Next.js 13+

### Estilização
- Use Tailwind CSS
- Prefira componentes do shadcn/ui
- Mantenha consistência visual

### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
style: formatação de código
refactor: refatorar código
test: adicionar testes
chore: tarefas de manutenção
```

## 📁 Estrutura do Projeto

```
src/
├── app/                 # App Router (Next.js 13+)
├── components/         # Componentes React
│   ├── ui/            # Componentes base
│   ├── layout/        # Layouts
│   ├── forms/         # Formulários
│   └── ...
├── hooks/             # Custom Hooks
├── contexts/          # Context Providers
├── lib/               # Utilitários
└── types/             # Definições TypeScript
```

### Convenções de Nomenclatura
- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.ts`)
- **Utilitários**: camelCase (`utils.ts`)
- **Tipos**: PascalCase (`Profile.ts`)

## 🔄 Processo de Pull Request

### Antes de Abrir um PR
- [ ] Código segue os padrões estabelecidos
- [ ] Testes passam (quando aplicável)
- [ ] Documentação atualizada
- [ ] Commit messages seguem convenção

### Template de PR
```markdown
## 📝 Descrição
Descreva brevemente as mudanças.

## 🔗 Issues Relacionadas
Closes #123

## 🧪 Como Testar
1. Passo 1
2. Passo 2
3. Passo 3

## 📸 Screenshots (se aplicável)
Adicione screenshots das mudanças visuais.

## ✅ Checklist
- [ ] Código testado
- [ ] Documentação atualizada
- [ ] Sem breaking changes
```

## 🐛 Reportando Bugs

### Template de Bug Report
```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: v1.0.0]

**Informações Adicionais**
Qualquer contexto adicional.
```

## 💡 Sugerindo Funcionalidades

### Template de Feature Request
```markdown
**Funcionalidade Sugerida**
Descrição clara da funcionalidade desejada.

**Problema que Resolve**
Qual problema esta funcionalidade resolveria?

**Solução Proposta**
Como você imagina que deveria funcionar?

**Alternativas Consideradas**
Outras soluções que você considerou.

**Contexto Adicional**
Qualquer contexto adicional.
```

## 🏷️ Tipos de Contribuição

### 🐛 Bug Fixes
- Corrigir bugs existentes
- Melhorar tratamento de erros
- Otimizar performance

### ✨ Novas Funcionalidades
- Adicionar recursos solicitados
- Melhorar UX/UI
- Integrações com APIs externas

### 📚 Documentação
- Melhorar README
- Adicionar comentários no código
- Criar guias de uso

### 🧪 Testes
- Adicionar testes unitários
- Testes de integração
- Testes E2E

## 🎯 Áreas Prioritárias

### Alta Prioridade
- [ ] Sistema de pagamentos
- [ ] Notificações push
- [ ] Testes automatizados
- [ ] Performance mobile

### Média Prioridade
- [ ] Modo escuro
- [ ] Internacionalização
- [ ] Analytics avançado
- [ ] SEO otimizado

### Baixa Prioridade
- [ ] Temas customizáveis
- [ ] Integração com redes sociais
- [ ] Sistema de badges
- [ ] Gamificação

## 📞 Suporte

### Canais de Comunicação
- **GitHub Issues**: Para bugs e features
- **Discussions**: Para dúvidas e discussões
- **Email**: contato@conflar.com.br

### Tempo de Resposta
- **Bugs críticos**: 24-48h
- **Features**: 1-2 semanas
- **Dúvidas**: 2-3 dias

## 🙏 Reconhecimento

Contribuidores serão reconhecidos:
- No README do projeto
- Nos releases notes
- No hall da fama do projeto

---

**Obrigado por contribuir com o ConfiLar! 🚀**
