-- Seed initial help articles for ConfiLar

-- Password Reset
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Como redefinir minha senha',
  'Conta',
  ARRAY['senha', 'redefinir', 'esqueci', 'recuperar', 'trocar', 'mudar', 'reset', 'password'],
  'Esqueci minha senha, como faço para recuperar?',
  'Para redefinir sua senha, siga estes passos:

1. Clique em "Entrar" no menu
2. Clique em "Esqueci minha senha"
3. Digite seu e-mail cadastrado
4. Você receberá um link de recuperação no seu e-mail
5. Clique no link e defina sua nova senha

💡 Dica: Verifique sua caixa de spam se não receber o e-mail em alguns minutos.',
  'link',
  '/login',
  10
);

-- Payment Issues
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Problemas com pagamento e ConfiPoints',
  'Pagamento',
  ARRAY['pagamento', 'pagar', 'confipoints', 'pontos', 'comprar', 'credito', 'saldo', 'recarregar', 'pix'],
  'Não consigo comprar ConfiPoints',
  'Se você está tendo problemas com pagamento:

✅ Verifique se seus dados de pagamento estão corretos
✅ Confirme se há saldo suficiente em sua conta
✅ Tente usar outro método de pagamento (PIX é instantâneo)

Para comprar ConfiPoints:
1. Acesse "ConfiPoints" no menu
2. Escolha o pacote desejado
3. Selecione a forma de pagamento
4. Confirme a compra

Os pontos são creditados automaticamente após a confirmação do pagamento.',
  'link',
  '/confipoints',
  9
);

-- Account Access
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Não consigo acessar minha conta',
  'Conta',
  ARRAY['acessar', 'entrar', 'login', 'acesso', 'bloqueado', 'conta', 'deslogado', 'sessao'],
  'Não consigo fazer login na minha conta',
  'Se você não consegue acessar sua conta:

🔐 Verifique se está usando o e-mail correto
🔐 Confirme se a senha está correta (atenção a maiúsculas/minúsculas)
🔐 Limpe o cache do navegador e tente novamente
🔐 Tente usar outro navegador ou dispositivo

Se o problema persistir, use a opção "Esqueci minha senha" para redefinir seu acesso.',
  'link',
  '/login',
  10
);

-- Platform Overview
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Como funciona o ConfiLar',
  'Geral',
  ARRAY['funciona', 'sistema', 'plataforma', 'como', 'usar', 'tutorial', 'inicio', 'começar', 'confilar'],
  'Como funciona o sistema do ConfiLar?',
  'O ConfiLar é uma plataforma que conecta você a profissionais confiáveis! 🏡

Como funciona:
📍 Você publica o serviço que precisa
👥 Profissionais qualificados enviam propostas
💬 Você conversa e escolhe o melhor profissional
⭐ Após o serviço, você avalia o profissional

Para profissionais:
🔧 Crie seu perfil profissional
📢 Encontre serviços na sua região
💼 Envie propostas para clientes
🌟 Construa sua reputação com avaliações

É simples, seguro e eficiente!',
  null,
  null,
  8
);

-- Profile Management
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Como editar meu perfil',
  'Perfil',
  ARRAY['perfil', 'editar', 'alterar', 'mudar', 'atualizar', 'foto', 'dados', 'informações'],
  'Como faço para editar meu perfil?',
  'Para editar seu perfil:

1. Clique no seu avatar no canto superior direito
2. Selecione "Perfil"
3. Clique em "Editar Perfil"
4. Atualize suas informações
5. Clique em "Salvar"

Você pode alterar:
📸 Foto de perfil
📝 Nome e biografia
📍 Localização
📞 Informações de contato
🔧 Dados profissionais (para profissionais)',
  'link',
  '/perfil',
  7
);

-- Service Posting
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Como publicar um serviço',
  'Serviços',
  ARRAY['publicar', 'anuncio', 'serviço', 'servico', 'criar', 'postar', 'anunciar', 'divulgar'],
  'Como faço para publicar um serviço que preciso?',
  'Para publicar um serviço:

1. Clique em "Publicar Serviço" no menu
2. Escolha a categoria do serviço
3. Descreva o que você precisa
4. Adicione fotos se necessário
5. Defina sua localização
6. Publique!

Dicas para uma boa publicação:
✨ Seja específico na descrição
📸 Adicione fotos se possível
💰 Informe seu orçamento (opcional)
📅 Indique a urgência do serviço

Profissionais da sua região receberão sua solicitação e enviarão propostas!',
  'link',
  '/anuncios/novo',
  9
);

-- Professional Profile
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Como me tornar um profissional',
  'Profissional',
  ARRAY['profissional', 'prestador', 'trabalhar', 'oferecer', 'servicos', 'cadastro', 'tornar'],
  'Como faço para me cadastrar como profissional?',
  'Para se tornar um profissional no ConfiLar:

1. Acesse "Configurações" no menu
2. Vá em "Tipo de Conta"
3. Selecione "Conta Profissional"
4. Preencha seus dados profissionais:
   - Especialidades
   - Experiência
   - Portfólio
   - Área de atuação

Benefícios:
⭐ Receba solicitações de serviços
💼 Construa sua reputação
📈 Aumente sua visibilidade
💰 Ganhe mais clientes

É gratuito para começar!',
  'link',
  '/configuracoes/tipo-conta',
  8
);

-- Privacy and Security
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Segurança e privacidade',
  'Segurança',
  ARRAY['segurança', 'seguranca', 'privacidade', 'dados', 'protecao', 'proteção', 'seguro'],
  'Meus dados estão seguros?',
  'Sua segurança é nossa prioridade! 🔒

Medidas de segurança:
✅ Criptografia de dados
✅ Autenticação segura
✅ Proteção de informações pessoais
✅ Sistema de avaliações confiável

Dicas de segurança:
🔐 Use senhas fortes
🔐 Não compartilhe sua senha
🔐 Verifique avaliações antes de contratar
🔐 Comunique-se pela plataforma

Você tem controle total sobre suas informações nas configurações de privacidade.',
  'link',
  '/configuracoes/seguranca',
  7
);

-- Notifications
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Gerenciar notificações',
  'Configurações',
  ARRAY['notificação', 'notificacao', 'notificações', 'avisos', 'alertas', 'desativar', 'ativar'],
  'Como desativo as notificações?',
  'Para gerenciar suas notificações:

1. Acesse "Configurações"
2. Vá em "Notificações"
3. Escolha quais notificações deseja receber:
   - Novas mensagens
   - Propostas recebidas
   - Atualizações de serviços
   - Novidades da plataforma

Você pode personalizar:
📧 Notificações por e-mail
🔔 Notificações no site
📱 Notificações push (em breve)

Mantenha ativadas as notificações importantes para não perder oportunidades!',
  'link',
  '/configuracoes',
  6
);

-- Messages and Chat
INSERT INTO public.help_articles (title, category, keywords, question_example, answer, action_type, action_value, priority)
VALUES (
  'Como usar o chat de mensagens',
  'Mensagens',
  ARRAY['mensagem', 'mensagens', 'chat', 'conversar', 'falar', 'contato', 'comunicar'],
  'Como envio mensagens para profissionais?',
  'Para conversar com profissionais ou clientes:

1. Acesse a proposta ou perfil do profissional
2. Clique em "Enviar mensagem"
3. Digite sua mensagem
4. Envie!

Recursos do chat:
💬 Mensagens em tempo real
📎 Envio de arquivos
✅ Confirmação de leitura
🔔 Notificações de novas mensagens

Dicas:
✨ Seja claro e objetivo
✨ Responda rapidamente
✨ Mantenha a comunicação profissional
✨ Use o chat para tirar dúvidas antes de contratar',
  'link',
  '/mensagens',
  7
);
