# Sistema de Cadastro Simplificado - ConfiLar

## Visão Geral

O sistema de cadastro foi completamente simplificado para oferecer uma experiência mais direta e menos polida para os usuários. Agora, tanto clientes quanto profissionais podem criar suas contas em uma única tela, com campos organizados logicamente.

## Principais Mudanças

### 1. Formulário Único (`SimpleRegistrationForm.tsx`)

- **Uma tela só**: Todos os dados são coletados em um único formulário
- **Campos organizados por seções**:
  - Dados Básicos (nome, email, senha, telefone, CPF/CNPJ, data de nascimento, tipo de usuário)
  - Localização (estado, cidade, bairro)
  - Dados Profissionais (apenas para profissionais)

### 2. Campos Obrigatórios vs. Opcionais

#### Campos Obrigatórios para Todos:
- Nome completo
- Email
- Senha
- Telefone
- CPF/CNPJ
- Data de nascimento
- Tipo de usuário (cliente/profissional)
- Estado
- Cidade
- Bairro

#### Campos Opcionais para Profissionais:
- Biografia
- Anos de experiência
- Serviços oferecidos (seleção múltipla)
- Serviço de emergência 24h
- Seguro de responsabilidade civil

### 3. Documentação e Fotos

- **Não são obrigatórios** no cadastro inicial
- **Serão solicitados depois** no perfil do usuário
- **Melhoram a classificação** do usuário no site

## Estrutura dos Arquivos

### Arquivos Criados/Modificados:

1. **`src/components/forms/SimpleRegistrationForm.tsx`** - Novo formulário simplificado
2. **`src/app/(public)/cadastro/page.tsx`** - Página de cadastro pública
3. **`src/app/(auth)/auth/page.tsx`** - Página de auth atualizada
4. **`src/hooks/useAuth.ts`** - Hook de autenticação atualizado
5. **`src/app/(public)/perfil/page.tsx`** - Página de perfil com cards de status

### Funcionalidades do Perfil:

#### Para Clientes:
- Card laranja: "Quer se tornar um Profissional?"
- Botão para completar cadastro profissional
- Redireciona para modo de edição

#### Para Profissionais:
- Card azul: "Status Profissional"
- Exibe informações profissionais
- Botão para editar dados profissionais

## Fluxo de Cadastro

### 1. Cadastro Inicial
```
Usuário preenche formulário → Dados são salvos no perfil → Redirecionado para /perfil
```

### 2. Completar Perfil
```
No perfil → Usuário pode editar/adicionar informações → Melhora classificação
```

### 3. Tornar-se Profissional (para clientes)
```
Cliente → Clica em "Completar Cadastro Profissional" → Modo de edição ativado
```

## Vantagens do Novo Sistema

### Para Usuários:
- ✅ **Mais simples**: Uma tela só
- ✅ **Menos polido**: Interface mais direta
- ✅ **Flexível**: Documentos opcionais
- ✅ **Progressivo**: Pode completar perfil depois

### Para Desenvolvedores:
- ✅ **Código mais limpo**: Menos complexidade
- ✅ **Manutenção fácil**: Um componente só
- ✅ **Validação centralizada**: Schema único
- ✅ **UX consistente**: Mesma experiência para todos

## Campos de Dados

### Dados Salvos Automaticamente:
- Informações básicas de registro
- Localização
- Dados profissionais (se aplicável)

### Dados para Completar Depois:
- Foto de perfil
- Documentos (selfie, comprovante de residência)
- Informações adicionais
- Serviços específicos

## Testes Recomendados

### 1. Cadastro de Cliente:
- [ ] Preencher dados básicos
- [ ] Verificar se redireciona para perfil
- [ ] Verificar se aparece card "Quer se tornar Profissional?"

### 2. Cadastro de Profissional:
- [ ] Preencher dados básicos + profissionais
- [ ] Verificar se redireciona para perfil
- [ ] Verificar se aparece card "Status Profissional"

### 3. Completar Perfil:
- [ ] Editar informações existentes
- [ ] Adicionar foto de perfil
- [ ] Verificar se dados são salvos

### 4. Tornar-se Profissional:
- [ ] Cliente clica em "Completar Cadastro Profissional"
- [ ] Verificar se modo de edição é ativado
- [ ] Verificar se pode adicionar dados profissionais

## Próximos Passos

1. **Testar o sistema** com diferentes tipos de usuários
2. **Ajustar validações** se necessário
3. **Implementar upload de documentos** no perfil
4. **Criar sistema de pontuação** baseado na completude do perfil
5. **Adicionar notificações** para perfis incompletos

## Notas Técnicas

- O sistema usa `react-hook-form` com validação Zod
- Dados são salvos via `useAuth` hook
- Mock mode está configurado para desenvolvimento
- Redirecionamento automático para `/perfil` após cadastro
- Interface responsiva com Tailwind CSS










