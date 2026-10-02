# Melhorias de desempenho e confiabilidade no celular

## Entregas

- Chat flutuante, edição de perfil, formulários premium, detalhes e compartilhamento de anúncios, criação/visualização de stories e tutorial carregados sob demanda. reCAPTCHA restrito à autenticação, sem download em todas as telas.
- Feed com cursor estável por destaque, data e ID, inclusive empates e registros antigos com destaque nulo. Publicações e atividades têm cursores independentes, sem descartar itens de uma fonte ao combinar páginas. O feed de publicações deixa de consultar atividades desnecessariamente.
- Virtualização acima de 60 itens, altura variável medida, margem de rolagem e overscan. Listas menores usam `content-visibility` sem remover conteúdo acessível.
- Realtime do feed pausado em segundo plano e sem conexão; eventos estruturais agrupados, contadores atualizados no cache e exclusões removidas imediatamente.
- Corrigido o hook de invalidação que criava um QueryClient separado. Persistência só regrava cache alterado; ranking não dispara uma consulta de visualizações por publicação e usa candidatos recentes e da localidade selecionada.
- Aviso de conexão e compras/transferências sem fila offline. A sincronização legada é carregada somente quando existem ações pendentes.
- Idempotência em compras premium, renovações, curtidas premium, pacotes de pontos, transferências e loja. Chave vinculada ao usuário autenticado e fingerprint; trava transacional, resultado persistido e rejeição de reaproveitamento para outro pedido. Notificações posteriores não são repetidas no replay. O cliente mantém a chave durante uma resposta perdida na mesma sessão e agrupa toques repetidos.
- Loja corrigida: removida a inserção direta pelo cliente, usada a compra atômica e corrigida a coluna `purchased_at`. Loja e transferência passam a validar o mesmo saldo usado pelo débito (`profiles.points_balance`). Saldos e históricos anteriores não foram alterados.
- Métricas LCP, INP, CLS e contagens de erros em produção, por rota normalizada e categoria celular/desktop. Sem mensagens, stack, URLs completas, query strings, identificadores de conta, credenciais ou documentos. Consentimento analítico obrigatório, respeito a Do Not Track, lotes pequenos, limite de requisições, limite de corpo e tabelas sem acesso direto do cliente. Retenção de 30 dias, com tarefa diária quando `pg_cron` está disponível.
- Next.js atualizado de 15.4.8 para 15.5.27 e dependência `tar` da ferramenta Supabase corrigida para 7.5.22. A auditoria de dependências deixou de indicar vulnerabilidades críticas; ainda há alertas de outras dependências.

## JavaScript: comparação reproduzível

Soma gzip dos arquivos únicos da rota em `.next/app-build-manifest.json`, usando build de produção. Mesmo método antes e depois; não representa medição de tráfego ou memória em aparelho real.

| Rota              |         Antes |        Depois | Redução |
| ----------------- | ------------: | ------------: | ------: |
| Inicial (`/home`) | 441.459 bytes | 314.110 bytes |   28,8% |
| Classificados     | 490.759 bytes | 401.809 bytes |   18,1% |
| Feed              | 523.165 bytes | 447.343 bytes |   14,5% |

## Validação

- 42 testes locais de lógica, segurança e componentes.
- Testes Playwright com viewport de Pixel 7 e serviços externos simulados: preço completo, filtros, detalhes e fechamento do modal, reconexão, feed vazio e feed de 100 publicações com DOM limitado. Nenhuma credencial real ou cobrança é usada nesses testes.
- Pipeline de testes mobile em push e pull request, com variáveis fictícias, sem credenciais de produção e sem aplicação automática de SQL.
- Testes SQL de papéis, isolamento, compra, reação, transferência, crédito e idempotência terminam em `ROLLBACK`. Novos testes verificam sete grupos de cenários, incluindo reenvio do mesmo anúncio premium e recusa de acesso direto aos recibos e métricas.
- Auditoria do catálogo: 91 tabelas com RLS; nenhuma escrita irrestrita para clientes; oito views com `security_invoker`; nenhuma função definer sem `search_path` definido.
- `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run test:database` e `npm run test:e2e` constituem a validação de entrega.

## Medição de laboratório e aparelho real

O benchmark opcional usa Chromium isolado, viewport de 412 px, CPU reduzida 4 vezes, latência de 150 ms, download de 200.000 bytes/s e upload de 93.750 bytes/s. Usa dados simulados e build de produção. LCP/INP são obtidos pela biblioteca oficial `web-vitals`, não por uma aproximação baseada no maior evento.

- Linha de base: LCP 5.784 ms e INP 64 ms.
- Build intermediário: LCP 5.352 ms e INP 56 ms.
- Build final: LCP 4.640 ms e INP 48 ms. Comparação das amostras: LCP cerca de 19,8% menor; INP cerca de 25% menor. Não se trata de p75 ou teste em hardware físico.
- Valores individuais são amostras de laboratório, não percentis nem garantia de fluidez. LCP ainda exige otimização e verificação em aparelhos reais.

Para repetir no PowerShell: definir `RUN_MOBILE_LAB=1` no ambiente e executar `npx playwright test mobile-lab`. Remover a variável após a execução. Para consultar os agregados anônimos após o deploy: `npm run metrics:mobile`.

Validar em Android intermediário e iPhone, com Wi-Fi e rede móvel: abrir app a frio, navegar entre telas, rolar feed longo, abrir/fechar anúncios, alternar conexão e repetir uma operação financeira em ambiente de teste. Avaliar p75 de LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 com uma amostra representativa; não houve acesso a aparelho físico nesta execução. A medição de vitais representa o documento inicial, não cada navegação SPA.

## Limites e pendências explícitas

- Migrações foram aplicadas ao Supabase configurado no `.env`; publicação do frontend em produção depende do deploy. Reabrir/atualizar o app após o deploy para carregar o cliente com as novas chaves de compra.
- A configuração VAPID existente continua inválida. Não gerei ou substituí chaves de produção; push precisa dessa correção de configuração.
- Foram identificadas duas divergências históricas entre o saldo principal e a tabela legada de saldos. As operações agora validam a carteira correta, mas a conciliação de históricos deve usar as transações reais; não foi feito ajuste silencioso de valores.
- `npm audit` ainda informa 30 alertas (3 baixos, 10 moderados, 17 altos), sem críticos. Atualizações incompatíveis exigem uma etapa própria de migração e testes.
- Não executei pagamento real em gateways nem medi desempenho em celular físico. As telas de classificados já paginam a apresentação; com o volume atual, não foram convertidas integralmente para busca paginada no servidor. O cursor e a virtualização desta entrega se aplicam ao feed.

Referências técnicas: [lazy loading do Next.js](https://nextjs.org/docs/app/guides/lazy-loading), [virtualização de janela do TanStack](https://tanstack.com/virtual/latest/docs/framework/react/examples/window), [web-vitals oficial](https://github.com/GoogleChrome/web-vitals) e [release de segurança do Next.js 15.5.27](https://github.com/vercel/next.js/releases/tag/v15.5.27).
