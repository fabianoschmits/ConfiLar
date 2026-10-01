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

## Verificação

`node --test tests/native-ui.test.cjs` verifica contratos dos componentes, atributos de formulário, acessibilidade básica e destinos da navegação administrativa. Execute também `npm run type-check`, ESLint e `npm run build`.

A revisão visual deve incluir 320 e 390 px, desktop, ambos os temas, texto longo, rodapés, campos, filtros e modais. Nenhum teste deve publicar conteúdo, transferir pontos ou alterar configurações reais apenas para conferir o visual.
