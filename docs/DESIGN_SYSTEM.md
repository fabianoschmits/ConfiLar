# ConfiLar Design System — Plano de Padronização

> **Regra de ouro:** mudar **apenas o frontend visual**. Nenhuma lógica, hook, API, formulário, permissão ou fluxo pode ser alterado. Modais e popups mantêm o mesmo comportamento — só aparência.

**Brief (skill frontend-design):** marketplace local de confiança (ConfiLar). Referência visual = mock de Classificados.  
**Fonte:** Gilroy. **Evitar:** purple genérico, cream/terracotta, SaaS-card kit idêntico, blue-600 como CTA principal.

---

## 1. Tokens canônicos

| Token | Claro | Escuro | Uso |
|-------|-------|--------|-----|
| `--cl-ink` | `#1A202C` | `#F7FAFC` | Títulos, nomes, CTAs |
| `--cl-ink-secondary` | `#4A5568` | `#CBD5E0` | Subtítulos, categorias |
| `--cl-ink-muted` | `#718096` | `#94A3B8` | Meta, placeholders |
| `--cl-paper` | `#F5F7F9` | `#0F172A` | Fundo da tela |
| `--cl-surface` | `#FFFFFF` | `#1E293B` | Cards / modais |
| `--cl-mist` | `#F0F2F5` | `#334155` | Busca, chips idle |
| `--cl-teal` | `#00B0B0` | `#00B0B0` | Brand / premium / ativo nav |
| `--cl-service` / bg | verde | verde soft | Badge Serviço |
| `--cl-request` / bg | azul | azul soft | Badge Pedido |
| `--cl-shadow` | soft navy 6% | soft black 35% | Cards |

### Raios (hierarquia)

| Elemento | Raio |
|----------|------|
| Chips / busca / CTA pill | `9999px` (cápsula alongada) |
| Botão filtro / controles | `16px` |
| Cards / imagens | `18px` |
| Modais desktop | `24px` |
| Bottom sheet mobile | `24px` topo |

---

## 2. Estratégia de rollout (sem quebrar features)

1. **Fundação:** tokens em `:root` / `.dark` + Tailwind aliases.
2. **Shell:** `MainLayout`, header, sidebar — fundo paper/surface.
3. **UI base:** Button, Input, Textarea, Card, Badge.
4. **Overlays:** Dialog, AlertDialog, ResponsiveModal, Popover, Dropdown, Sheet.
5. **Páginas:** só trocar classes de fundo/borda/raio; zero mudança de handlers.
6. **QA visual:** claro + escuro em cada rota da checklist.

---

## 3. Checklist — páginas consumer

- [ ] `/` landing
- [ ] `/home`
- [ ] `/auth` (+ recuperar/nova-senha, alterar-email, verificacao, reautenticacao, logout)
- [ ] `/feed`
- [ ] `/buscar`
- [ ] `/classificados` *(referência — já alinhado)*
- [ ] `/favoritos`
- [ ] `/perfil/[id]`
- [ ] `/profissionais/[service]`
- [ ] `/avaliacoes` `/reputacao` `/portfolio`
- [ ] `/indicacoes` `/notificacoes` `/ajuda`
- [ ] `/minhas-denuncias` `/acordo/[id]`
- [ ] `/confipoints` (+ dashboard, comprar, compras, transferir, ranking)
- [ ] `/configuracoes-privacidade` `/privacidade` `/termos` `/sobre` `/offline`

## 4. Checklist — admin gestao-confi

- [ ] shell `dashboard/layout`
- [ ] dashboard home, users, posts, reports, tickets, bans
- [ ] verifications, notifications, purchases, analytics, stats, system, cron, atendimento
- [ ] confipoints admin

## 5. Checklist — overlays (só visual)

- [ ] `ResponsiveModal`
- [ ] `Dialog` / `AlertDialog`
- [ ] `Popover` / `DropdownMenu` / `Sheet`
- [ ] modais de domínio (ShareAd, CreateAd, Report, Checkout, etc.) — herdam UI base

## 6. O que NÃO fazer

- Não remover props, estados, rotas, queries Supabase
- Não alterar textos de negócio / i18n keys sem necessidade
- Não trocar fluxo de auth, chat, premium, denúncia
- Não “simplificar” formulários ao padronizar estilo

## 7. Status

| Fase | Status |
|------|--------|
| Documento + tokens | em andamento |
| Shell + UI base + overlays | pendente |
| Pages batch fundos | pendente |
| Commit/push | pendente |
