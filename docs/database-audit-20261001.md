# Auditoria do banco e integrações — 01/10/2026

## Resultado

O token de gerenciamento funcionou. Foram aplicadas no Supabase real as duas migrações de engajamento antes pendentes e treze novas migrações de correção/proteção. A aplicação SQL foi repetida em uma transação para conferir a possibilidade de reaplicação.

Estado verificado: 89 tabelas públicas com RLS habilitada; oito views públicas com `security_invoker=true`; nenhuma função pública SECURITY DEFINER sem `search_path` configurado. A busca por políticas literalmente irrestritas de escrita não encontrou permissões desse tipo para clientes; as permissões amplas restantes são exclusivas do servidor. Esse levantamento não prova, sozinho, que toda política é segura.

O levantamento estático encontrou 65 tabelas e 32 RPCs referenciadas, sem tabelas, RPCs ou colunas selecionadas ausentes, sem destinos literais internos sem rota e sem hooks não referenciados. Não é uma prova de que todos os caminhos dinâmicos foram executados.

## Correções aplicadas

- Classificados: tabelas de curtidas, comentários e compartilhamentos instaladas; relacionamentos com autores, unicidade, contadores no servidor e permissões de criação/edição/exclusão próprias. A busca agora consulta o contador de comentários.
- Conversas: removida a consulta recursiva da política de participantes. Só integrantes reais da conversa podem aderir ou escrever, com destinatário correto. Só o remetente altera o conteúdo; só o destinatário altera a leitura. Identidade e conversa não podem ser trocadas por UPDATE.
- Notificações: removidas permissões globais de leitura e edição. Produtores sociais são validados contra o evento real; ator e horário vêm do servidor, destinos externos são rejeitados e existe limite por ator. O cliente não tenta ler de volta a notificação privada de outra pessoa depois de enviá-la.
- Triggers de notificação: leitura de preferências e fila de e-mail sob contexto confiável, respeitando preferências habilitadas. O link do anúncio agora usa `/classificados?ad=ID`, que corresponde ao modal existente.
- Feed: posts privados e respectivos comentários deixam de aparecer a outras pessoas; autoria e vínculo de comentários não são editáveis pelo cliente.
- Perfis: saldo, créditos, assinatura Pro e verificação não podem ser forjados por edição de perfil. CPF/CNPJ, nascimento e referências documentais foram preservados em `profile_private_details`, com leitura restrita ao dono/admin e acesso do servidor. As colunas públicas correspondentes ficam vazias. Autenticação, edição, onboarding, consulta de perfil e exportação LGPD incorporam os dados privados autorizados.
- Cadastro: consulta de CPF retorna somente existência, não perfis/documentos. O banco impede novas colisões de CPF nas alterações. Colisões históricas foram preservadas para revisão, sem mesclar pessoas automaticamente.
- Premium: preços, durações e correspondência de créditos são validados no servidor. Publicação/renovação, débito e notificação são transacionais. Falha na gravação não consome pontos/créditos. Dono da publicação é validado antes do débito e novamente sob bloqueio de linha.
- Curtidas premium: débito, recompensa ao autor, registro da curtida e notificação passam a ocorrer na mesma transação. Carteiras são bloqueadas em ordem consistente. Curtida em conteúdo indisponível ou do próprio autor é rejeitada. Campos pagos não podem ser ativados diretamente pelo cliente.
- Créditos e pagamentos: consumo condicional de créditos impede saldo negativo e repetição após esgotamento; aprovação de pagamento e estorno bloqueiam a compra antes de modificar valores.
- Administração: RPCs de banimento/desbanimento/aprovação/rejeição agora exigem administração dentro da função. Estatísticas de pontos deixam de depender de um UUID fixo e passam a somar ganhos/gastos pelo sinal do valor.
- Logs: leitura restrita à administração; clientes não podem se passar por outro autor nem produzir logs administrativos confiáveis. Logs de cliente são identificados e limitados.
- Storage: removida política que permitia mutações públicas de avatares; uploads/alterações exigem propriedade. Imagens do feed incluem ID do usuário no caminho; pastas de stories/classificados também respeitam a propriedade. URLs públicas de imagens continuam funcionando; buckets documentais seguem privados.
- Stories: visualizações passam a atualizar contadores no banco, sem tentar editar o story de outra pessoa pelo navegador.
- Limpeza: removido o hook que executava manutenção global de premium no navegador, duplicações de pagamento das APIs e caminho legado de transferência financeira offline. A manutenção permanece restrita ao servidor; transferências exigem confirmação online.

## Testes executados

### Banco real, com ROLLBACK

As escritas de teste usam transações com reversão e limites de tempo/bloqueio. Não houve compras reais, mensagens reais enviadas, publicação persistente de comentários/posts ou perda de saldo. Notificações e filas de e-mail criadas nesses testes também foram revertidas.

- Consultas sob `anon` e `authenticated` nas 89 tabelas: nenhuma falha inesperada. Visitantes foram corretamente impedidos de consultar notificações e detalhes privados; usuários autenticados tiveram consultas válidas, sujeitas aos filtros de RLS.
- Curtir/descurtir, duplicação de curtida, comentário/edição/exclusão próprios, contadores, autor relacionado, visitante, anúncio inativo e tentativa de falsificar usuário.
- Chat entre participantes, envio/edição, leitura, notificação, destinatário indevido, invasão de conversa e edição por terceiro.
- Criar/editar/excluir anúncio e criar/editar post/comentário; privacidade do post e comentários.
- Comprar premium com crédito; falha de gravação reverte consumo; crédito esgotado/negativo é rejeitado; campos premium não podem ser adulterados.
- Curtida premium em post e story, débito de 100 e recompensa de 75; saldo insuficiente não gera recompensa; contador de visualização de story atualiza por visitante autenticado.
- Usuário comum não pode aprovar pagamentos, conceder bônus, banir/desbanir usuários ou consultar dados administrativos do banco.
- Dados privados: atualização/leitura pelo dono; colunas públicas vazias; outro usuário não lê por tabela ou RPC; visitante não executa a RPC privada.

### API real do Supabase

Login com a conta fornecida; consultas públicas de anúncios, relação comentário/autor, notificações próprias, feed, participantes e RPC privada passaram. Uploads reais e temporários de avatar e imagem de feed passaram, uploads em pasta de outro dono e sobrescrita anônima foram bloqueados. Ambas as imagens temporárias foram removidas pela API ao final.

### Código

37 testes locais passaram. `npm run type-check`, `npm run lint` e `npm run build` também concluíram. A suíte inclui validação de preços adulterados antes de qualquer chamada de pagamento. O build reporta configuração VAPID inválida e bases de compatibilidade de navegadores antigas.

Comandos reproduzíveis:

```text
npm run db:apply-audit
npm run audit:database
npm run audit:system
npm run test:database
npm run test:data-api
```

Os comandos de banco usam `SUPABASE_ACCESS_TOKEN` do ambiente, sem imprimir credenciais. `test:data-api` requer `AUDIT_EMAIL` e `AUDIT_PASSWORD` temporários, não salvos no repositório. Os testes não são agendados e não executam automaticamente durante o build.

## Pendências e limites importantes

1. Push externo não está validado/operacional com a configuração atual: a chave pública VAPID não tem o tamanho exigido. Não foi rotacionada silenciosamente porque isso exige configurar o mesmo par no ambiente de hospedagem e tratar inscrições existentes. Notificações internas do banco foram testadas separadamente.
2. Não foi confirmado um agendador de produção para os endpoints de manutenção premium, limpeza e envio de e-mail. Não existem jobs cadastrados em `cron.job` no banco consultado. Isso não descarta agendamento externo na hospedagem.
3. Foi encontrado um grupo de CPF/CNPJ duplicado em dados históricos. Dados preservados; novas colisões são impedidas, mas a identidade das contas existentes precisa ser conferida antes de consolidar/alterar cadastros. Nenhum CPF é divulgado neste relatório.
4. E-mail e contatos continuam sujeitos ao desenho público atual dos perfis/anúncios; não foram ocultados automaticamente para evitar retirar o contato de profissionais. Os campos documentais citados acima foram separados.
5. Gateway de pagamento real, entrega de e-mail/push, exclusão definitiva de conta e todas as ações administrativas não foram executados ponta a ponta. Não foram feitos testes de carga, concorrência entre conexões simultâneas ou medição de fluidez em dispositivo físico. O teste de esgotamento de crédito é sequencial; bloqueios financeiros foram conferidos pela definição instalada e por transações funcionais.
6. Funções e tabelas antigas sem referências no frontend não foram apagadas indiscriminadamente: podem servir a triggers, integrações ou histórico. Operações financeiras legadas perigosas tiveram execução retirada de visitantes/clientes. Não houve DROP de tabelas com dados de usuários.
7. As migrações já estão no banco; o código correspondente precisa ser publicado na hospedagem. Em especial, a versão antiga da aplicação não incorpora os novos dados privados e RPCs transacionais. Commit/push não comprovam a conclusão do deploy.

## Próximas melhorias para celular

- Reduzir JavaScript inicial: o build indica cerca de 440 kB em páginas centrais. Carregar modais pesados, ferramentas administrativas e bibliotecas opcionais apenas quando necessários.
- Medir LCP/INP e navegação em aparelho real/rede móvel antes de prometer ausência de engasgos.
- Usar paginação por cursor e listas virtualizadas onde o volume justificar; evitar consultas repetidas e subscriptions sem necessidade.
- Testar recuperação após perda de conexão e toques repetidos, com indicação de envio e repetição segura. Operações financeiras devem continuar online.
- Adicionar chaves de idempotência às requisições de compra: transação evita cobrança parcial, mas não substitui a proteção contra duas requisições completas repetidas.
- Automatizar testes de interface dos fluxos principais e métricas de erros de produção, sem registrar credenciais ou documentos.

Referência de segurança: [RLS e permissões no Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security). RLS, grants e autorização das funções foram tratados separadamente; habilitar RLS isoladamente não protege RPCs SECURITY DEFINER.
