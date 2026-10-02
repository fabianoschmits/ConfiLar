# Padrão visual mobile ConfiLar

O feed e os classificados são a referência para as demais telas: Gilroy, superfícies sólidas, bordas discretas, texto de alto contraste e turquesa nas ações. As cores usam `--cl-*` em ambos os temas. Cores de alerta continuam semânticas, não decorativas.

## Componentes e composição

- `MainLayout`: cabeçalho, navegação e espaço reservado para as áreas seguras do dispositivo. Não aninhar outro `MainLayout` ou elemento `main`.
- `PageHeader`: título único, descrição, ícone opcional, retorno e ações. As ações se reorganizam no celular.
- `.app-page`: margens de 16 px no celular e largura máxima de 1120 px. `.app-page--narrow` limita formulários e leitura a 760 px.
- `Button`: ação principal escura no modo claro, áreas de toque de pelo menos 44 px, ações secundárias delineadas e ícones nomeados.
- `Input`, `Textarea`, `PasswordInput` e `Select`: bordas e superfícies do tema; texto de 16 px no celular para evitar zoom automático nos campos.
- `ResponsiveModal`: painel inferior no celular, modal central no desktop, conteúdo rolável e ações separadas do conteúdo.
- `QuickActionMenu` / `AdminBottomNav`: cinco destinos, estado ativo acessível e área segura inferior. Menus administrativos fecham ao navegar.
- `Card`: superfície, raio e espaçamento compartilhados; ações e conteúdo não dependem de posicionamento absoluto sobre textos.

Prefira estes componentes em novas telas. Evite alturas de tela duplicadas, avatares com margens negativas, barras flutuantes sobre a navegação e botões posicionados por coordenadas fixas. Grupos longos de filtros podem rolar horizontalmente; a página inteira não deve rolar nessa direção.

## Navegação e início do usuário

`src/lib/app-navigation.ts` é a lista compartilhada de destinos da barra inferior, da home e do dropdown. Ao trocar um atalho da barra, mantenha seu destino em `getShortcutGroups` e valide os testes de cobertura do menu.

- Conta conectada: Início, Feed, Buscar, Classificados e Mensagens. Visitantes mantêm Entrar no último lugar.
- Até 360 px, Classificados mostra o rótulo curto “Anúncios”, preservando o nome acessível e a rota. A barra tem áreas de toque de 64 px.
- Meu perfil fica diretamente na seção Minha conta do dropdown, aberta por padrão. Favoritos, avaliações, indicações, ConfiPoints e ferramentas profissionais continuam acessíveis por grupos. Suporte, preferências, disponibilidade e administração são preservados.
- Mensagens abre o chat existente; não é um link de rota fictícia. O dropdown fecha antes de abrir o chat e mantém o contador de mensagens não lidas.
- `/home` apresenta os dados reais do perfil e atalhos por tipo de conta. Clientes priorizam buscar profissionais; profissionais priorizam os classificados e seu trabalho. A home não inventa saldos, atividades ou métricas.
- O login comum, o retorno OAuth sem destino explícito e a entrada de usuários conectados pela landing levam à home. Destinos explícitos de retorno continuam respeitados.

O dropdown usa uma coluna nas telas menores que 380 px para preservar a leitura. Seu conteúdo rola dentro da altura disponível, sem sobrepor a barra inferior. Escape fecha o menu e devolve o foco ao botão da conta.

## Verificação

### Cards da busca de usuários

`ProfessionalCard` usa o modo compacto dos botões de favorito, indicação e avaliação somente dentro da busca. O cabeçalho reúne avatar de 56 px, nome completo, tipo de conta, disponibilidade e cidade; não há uma linha vazia reservada para serviços no topo. Biografia, nota, avaliações e visualizações vêm em seguida, com acesso à lista completa de serviços.

As três ações sociais ficam numa faixa única, sem bordas, com contadores em fluxo normal ao lado dos ícones. Estados ativos usam preenchimento, rótulo e cores discretas; favorito também expõe `aria-pressed`. Perfil e Contato ficam juntos no rodapé. As áreas de toque permanecem com pelo menos 44 px e o foco por teclado deve continuar visível.

Use as cores de superfície/texto do tema; disponibilidade tem apenas um ponto verde suave, estrelas usam dourado dessaturado e favoritos usam rosa discreto. Não adicionar pulsação automática, contadores flutuantes ou badges coloridos decorativos. No tema escuro, a ação de contato usa contraste neutro em vez de turquesa saturado.

`node --test tests/native-ui.test.cjs` verifica contratos dos componentes, atributos de formulário, acessibilidade básica, destinos da navegação administrativa, cobertura dos atalhos no dropdown, ações do chat, personalização da home e retornos de login. Execute também `npm run type-check`, ESLint e `npm run build`.

A revisão visual deve incluir 320 e 390 px, desktop, ambos os temas, texto longo, rodapés, campos, filtros e modais. Nenhum teste deve publicar conteúdo, transferir pontos ou alterar configurações reais apenas para conferir o visual.
