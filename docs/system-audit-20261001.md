# Auditoria do sistema — 01/10/2026

## Resultado e limites

Foram revisados os fluxos de navegação, autenticação, classificados, reações do feed, compartilhamento, mensagens, pontos, pagamentos, administração e exclusão de conta. A inspeção automatizada percorreu 556 arquivos de código e identificou referências a 65 tabelas e 30 RPCs. Isso não substitui uma auditoria completa de segurança ou testes de todos os fluxos em produção.

O código foi corrigido e as migrações foram preparadas, mas **a estrutura de engajamento dos classificados ainda não foi criada no banco remoto**. Não foram publicadas mensagens, curtidas ou comentários reais, nem realizadas compras ou exclusões de contas durante a validação.

## Correções implementadas

- Navegação mobile: início personalizado, barra com Início, Feed, Buscar, Classificados e Mensagens; destinos retirados da barra continuam no menu da conta, agrupados por finalidade. Fechar o tutorial não troca mais a página atual.
- Rotas: `/perfil` encaminha para o perfil autenticado; `/mensagens` abre as conversas; notificações de mensagens, stories e verificação passaram a apontar para destinos existentes. O levantamento estático final não encontrou destinos literais internos sem rota correspondente.
- Autenticação: redirecionamentos externos ou malformados são rejeitados; cookies atualizados são preservados; proteção de rotas acontece antes do retorno da internacionalização. Callback de autenticação e webhook de pagamento não são interceptados pelo fluxo de login.
- Administração e pagamentos: autorização administrativa também é verificada nos handlers de compras; consulta de pagamento fica restrita ao comprador autenticado; paginação administrativa tem limites; consultas deixaram de pedir campos inexistentes.
- Classificados: bloqueio imediato de toques repetidos, escrita idempotente de curtidas, recuperação do estado anterior em falhas e atualização dos contadores após confirmação. Cache de curtidas acompanha a conta autenticada. Anúncios fixados precisam estar ativos; carregamento dos autores não fica limitado aos primeiros 20 perfis.
- Comentários dos classificados: consultas paginadas e isoladas por anúncio/usuário; bloqueio de publicação duplicada; erro mantém o texto digitado; exclusão filtra pelo autor e só altera o contador se uma linha foi realmente removida. Migração corrige o vínculo com `profiles` usado para exibir autor/avatar.
- Banco dos classificados: migrações com tabelas, índices, unicidade, políticas RLS, permissões por operação e triggers para contadores. Atualização de comentário fica restrita ao conteúdo, sem permitir alterar o autor ou o anúncio.
- Feed: contagem de comentários não escreve mais no post durante uma leitura; reações distinguem inclusão, remoção e troca de emoji sem duplicar totais; interface aguarda resultado real e impede ações simultâneas.
- Compartilhamento: removido sucesso simulado; erros de persistência são retornados; destinatários são validados e deduplicados; compartilhamento usa a folha nativa quando disponível e cópia do link como alternativa. Cancelamento não registra compartilhamento.
- Mensagens: envio simultâneo da mesma conversa é bloqueado e participantes são conferidos; falha de notificação não transforma uma mensagem já gravada em falso erro, evitando tentativas duplicadas.
- Exclusão de conta: confirmação textual e reautenticação são verificadas no servidor; um booleano enviado pelo navegador não prova confirmação por e-mail. Exclusões de dependências são sequenciais e falhas interrompem o fluxo; referências antigas a tabelas foram corrigidas.
- Pontos: respostas de falha de negócio das RPCs são consideradas; curtida premium nova é removida quando o débito falha; resposta não declara recompensa creditada quando houve erro. Gráfico consulta a tabela real de transações e mantém saldo acumulado entre dias.
- Push: endpoint não permite que um usuário comum envie notificações arbitrárias para outra conta; configuração VAPID inválida gera indisponibilidade explícita em vez de sucesso aparente.
- React Query: mutações não são repetidas automaticamente, reduzindo risco de duplicar operações não idempotentes; inicialização respeita execução no servidor.

## Remoção de código morto

Foram removidos **37 hooks sem consumidores identificados**, incluindo versões antigas, mocks, caches e fluxos de notificação duplicados. Também foram removidas 3 APIs sem consumidores identificados: `example-with-rate-limit`, `check-duplicates` e `points/premium-comment`. Foi retirada a chamada para `/api/analytics/web-vitals`, que não tinha implementação.

Não foram removidos webhooks, endpoints cron ou outros handlers apenas por não terem chamadas no frontend: eles podem ser utilizados externamente. Os arquivos removidos podem ser recuperados pelo histórico do Git.

## Pendência no Supabase

A consulta de metadados e os testes de leitura confirmaram a ausência de:

- `classified_ad_likes`;
- `classified_ad_comments`;
- `classified_shares`;
- coluna `classified_ads.comments_count`.

As chaves do `.env` permitem acessar a Data API, mas não executar essas migrações SQL pela Management API. O acesso atual da CLI não inclui o projeto ConfiLar, e o dashboard exige autenticação. Nenhuma migração foi aplicada remotamente. A [Management API do Supabase](https://supabase.com/docs/reference/api/introduction) utiliza um token de acesso da plataforma, não a chave service-role da Data API.

Arquivos preparados:

- `supabase/migrations/20261001_add_classified_engagement.sql`;
- `supabase/migrations/20261001120000_classified_shares.sql`.

Com um `SUPABASE_ACCESS_TOKEN` autorizado para o projeto, o comando `npm run db:apply-audit` aplica os dois arquivos em uma transação. Alternativamente, um administrador do projeto pode executar os SQLs no editor do Supabase. Antes de aplicar, revisar e ter um backup atualizado. O script não imprime credenciais nem tenta usar outros projetos.

Enquanto essa estrutura estiver ausente, classificados mostra aviso e bloqueia curtidas indisponíveis; listagem, detalhes e acesso ao anunciante continuam disponíveis. **Curtidas/comentários reais ainda precisam de validação após a aplicação**: dois usuários distintos, visitante, inclusão/remoção de curtidas, contadores, paginação, autoria e permissões de comentários.

## Validação realizada

- `npm test`: 32 testes passaram, incluindo cenários comportamentais com dependências de rede simuladas.
- `npm run lint`: passou.
- `npm run type-check`: passou.
- `npm run build`: passou; 58 páginas estáticas geradas.
- `git diff --check`: sem erros de whitespace.
- `npm run audit:system`: nenhuma RPC literal ausente, nenhum caminho literal interno não resolvido e nenhum hook sem referência restante; diferenças de schema restantes são as pendências dos classificados descritas acima.
- Navegador autenticado, build de produção: classificados testados em 390 × 844 e 320 × 760, sem largura horizontal excedendo a viewport. Modal abriu com fotos, preço completo e erro explícito de comentários indisponíveis. Página inicial personalizada e menu da conta conferidos.

Os testes de permissões de API usam mocks e não representam uma validação completa das políticas do banco em produção. A experiência foi em viewport de celular no navegador, não em aparelho físico com rede e hardware limitados.

## Próximas prioridades para o celular

1. **Concluir o banco dos classificados** e validar as políticas/contadores em contas diferentes. É o bloqueio funcional imediato.
2. **Corrigir a configuração VAPID**: a chave pública atual não tem o tamanho esperado. Não houve rotação automática, pois mudar as chaves afeta inscrições existentes. Notificações para terceiros devem ser disparadas por eventos confiáveis do servidor/outbox, não por chamadas arbitrárias do navegador. Notificações internas e push são mecanismos distintos.
3. **Tornar pontos e recompensas transacionais**: os fluxos premium ainda têm múltiplas chamadas REST para registro, débito e recompensa. Uma RPC atômica com chave de idempotência evita estados parciais e disputas de saldo. A exclusão de conta também deve evoluir para uma operação transacional; a sequência atual detecta erros, mas não desfaz exclusões anteriores.
4. **Reduzir JavaScript inicial**: o build reportou aproximadamente 522 kB no feed, 490 kB em classificados e 440 kB no início. Carregar modais, chat e componentes secundários sob demanda; medir impacto antes de afirmar ganho.
5. **Paginação e filtros no servidor**: classificados ainda carrega anúncios para filtrar/paginar no cliente; migrar para consultas paginadas preservando ordenação, destaques e fixados. No feed, consolidar consultas por post de contagem/reações para reduzir requisições.
6. **Listas e mídia**: virtualização de feeds longos, imagens dimensionadas para o celular e proporção reservada evitam memória excessiva e saltos de layout.
7. **Continuidade de uso**: preservar rascunhos, filtros e posição de rolagem ao voltar; feedback imediato de ações, sem anunciar sucesso antes da gravação; falhas com opção clara de tentar novamente.
8. **Medir em aparelhos reais**: registrar LCP e INP por rota e testar rede lenta, modo offline e celulares básicos. Não há medição suficiente nesta entrega para garantir ausência de engasgos em todo dispositivo.

Não se afirma que todos os possíveis bugs foram eliminados. Esta entrega corrige os problemas identificados e documenta os bloqueios e riscos que precisam de infraestrutura ou validação adicional.
