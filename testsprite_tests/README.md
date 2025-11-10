# TestSprite - Configuração e Uso

## Status Atual

✅ **Code Summary Criado**: `testsprite_tests/tmp/code_summary.json`
✅ **Configuração Inicial**: `testsprite_tests/tmp/config.json`
✅ **Playwright Chromium**: Instalado

## Próximos Passos para Usar o TestSprite

### 1. Iniciar a Aplicação

O TestSprite precisa que a aplicação esteja rodando na porta 3000:

```bash
npm run dev
```

### 2. Usar o TestSprite MCP

O TestSprite pode ser usado através das seguintes ferramentas MCP:

#### Gerar Plano de Teste Frontend
- Gera um plano de teste baseado no código da aplicação
- Inclui testes de login se necessário

#### Bootstrap de Testes
- Inicializa os testes do TestSprite
- Requer que a aplicação esteja rodando na porta 3000

#### Gerar e Executar Testes
- Gera código de teste automaticamente
- Executa os testes
- Gera relatório em markdown

### 3. Estrutura de Arquivos

```
testsprite_tests/
├── tmp/
│   ├── code_summary.json    # Resumo do código da aplicação
│   ├── config.json          # Configuração do TestSprite
│   └── prd_files/           # Arquivos PRD (Product Requirements Document)
└── README.md                # Este arquivo
```

## Informações da Aplicação

### Tecnologias
- **Framework**: Next.js 15.4.6
- **Linguagem**: TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Testes**: Jest (unit) + Playwright (e2e)

### Funcionalidades Principais
- Sistema de autenticação
- Feed social
- Chat em tempo real
- Sistema de pontos (ConfiPoints)
- Notificações
- PWA
- Sistema de avaliações
- Classificados premium
- Dashboard administrativo

### Porta da Aplicação
- **Porta**: 3000
- **URL**: http://localhost:3000

## Como Executar Testes com TestSprite

1. **Inicie a aplicação**:
   ```bash
   npm run dev
   ```

2. **Use as ferramentas MCP do TestSprite**:
   - `testsprite_bootstrap_tests`: Inicializa os testes
   - `testsprite_generate_frontend_test_plan`: Gera plano de teste
   - `testsprite_generate_code_and_execute`: Gera e executa testes

3. **Verifique os resultados**:
   - Os relatórios serão gerados automaticamente
   - Os resultados serão salvos em markdown

## Problemas Conhecidos

### TestSprite MCP Travando
Se o TestSprite MCP estiver travando:
1. Verifique se a aplicação está rodando na porta 3000
2. Verifique se o servidor MCP está configurado corretamente
3. Tente usar as ferramentas uma de cada vez

### Navegadores do Playwright
Se os testes do Playwright falharem:
```bash
npx playwright install
```

## Alternativa: Playwright Direto

Se o TestSprite não funcionar, você pode usar o Playwright diretamente:

```bash
# Executar todos os testes
npm run test:e2e

# Executar testes em modo UI
npm run test:e2e:ui

# Executar testes em modo headed (com navegador visível)
npm run test:e2e:headed
```

## Documentação Adicional

- [Playwright Docs](https://playwright.dev/)
- [TestSprite Documentation](https://testsprite.ai/)

