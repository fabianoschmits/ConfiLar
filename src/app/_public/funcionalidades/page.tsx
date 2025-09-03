'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  Plus,
  Settings,
  Bell,
  Heart,
  Star,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Users,
  Briefcase,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Info
} from 'lucide-react'

export default function FuncionalidadesPage() {
  const funcionalidades = [
    {
      categoria: 'Navegação Principal',
      icon: <Home className="h-6 w-6 text-blue-600" />,
      items: [
        { nome: 'Home', descricao: 'Página principal com informações sobre o ConfiLar', rota: '/home' },
        { nome: 'Feed Social', descricao: 'Timeline de trabalhos dos profissionais', rota: '/feed' },
        { nome: 'Buscar Profissionais', descricao: 'Sistema de busca inteligente', rota: '/buscar' },
      ]
    },
    {
      categoria: 'Meu Perfil',
      icon: <User className="h-6 w-6 text-green-600" />,
      items: [
        { nome: 'Editar Perfil', descricao: 'Gerenciar informações pessoais e profissionais', rota: '/perfil' },
        { nome: 'Dashboard', descricao: 'Visão geral das atividades e estatísticas', rota: '/dashboard' },
        { nome: 'Favoritos', descricao: 'Profissionais e serviços salvos', rota: '/favoritos' },
        { nome: 'Minhas Avaliações', descricao: 'Histórico de avaliações feitas', rota: '/avaliacoes' },
      ]
    },
    {
      categoria: 'Comunicação',
      icon: <MessageSquare className="h-6 w-6 text-purple-600" />,
      items: [
        { nome: 'Mensagens', descricao: 'Chat direto com profissionais', rota: '/mensagens', badge: '3' },
        { nome: 'Notificações', descricao: 'Alertas e atualizações importantes', rota: '/notificacoes', badge: '5' },
      ]
    },
    {
      categoria: 'Localização',
      icon: <MapPin className="h-6 w-6 text-red-600" />,
      items: [
        { nome: 'Profissionais Próximos', descricao: 'Encontrar profissionais na sua região', rota: '/proximos' },
        { nome: 'Áreas de Atuação', descricao: 'Explorar diferentes regiões de serviço', rota: '/areas' },
      ]
    },
    {
      categoria: 'Agendamento',
      icon: <Calendar className="h-6 w-6 text-orange-600" />,
      items: [
        { nome: 'Meus Agendamentos', descricao: 'Gerenciar horários e compromissos', rota: '/agendamentos' },
        { nome: 'Histórico', descricao: 'Registro de serviços realizados', rota: '/historico' },
      ]
    },
    {
      categoria: 'Área Profissional',
      icon: <Briefcase className="h-6 w-6 text-indigo-600" />,
      items: [
        { nome: 'Meus Serviços', descricao: 'Gerenciar portfólio de serviços', rota: '/meus-servicos' },
        { nome: 'Portfólio', descricao: 'Mostrar trabalhos realizados', rota: '/portfolio' },
        { nome: 'Analytics', descricao: 'Estatísticas e métricas de performance', rota: '/analytics' },
        { nome: 'Verificação', descricao: 'Processo de verificação de conta', rota: '/verificacao' },
      ]
    },
    {
      categoria: 'Área do Cliente',
      icon: <Users className="h-6 w-6 text-teal-600" />,
      items: [
        { nome: 'Profissionais Contratados', descricao: 'Lista de profissionais com quem trabalhou', rota: '/contratados' },
        { nome: 'Solicitações', descricao: 'Pedidos de serviço enviados', rota: '/solicitacoes' },
      ]
    },
    {
      categoria: 'Suporte',
      icon: <HelpCircle className="h-6 w-6 text-yellow-600" />,
      items: [
        { nome: 'Central de Ajuda', descricao: 'FAQ e guias de uso', rota: '/ajuda' },
        { nome: 'Contato', descricao: 'Canais de atendimento', rota: '/contato' },
        { nome: 'Sobre o ConfiLar', descricao: 'Informações sobre a plataforma', rota: '/sobre' },
      ]
    },
    {
      categoria: 'Configurações',
      icon: <Settings className="h-6 w-6 text-gray-600" />,
      items: [
        { nome: 'Conta', descricao: 'Configurações de perfil e segurança', rota: '/configuracoes/conta' },
        { nome: 'Privacidade', descricao: 'Controle de dados e privacidade', rota: '/configuracoes/privacidade' },
        { nome: 'Notificações', descricao: 'Preferências de alertas', rota: '/configuracoes/notificacoes' },
      ]
    }
  ]

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Todas as Funcionalidades
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore todas as funcionalidades disponíveis no ConfiLar, organizadas por categoria para facilitar sua navegação
          </p>
        </div>

        {/* Grid de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funcionalidades.map((categoria, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  {categoria.icon}
                  <div>
                    <CardTitle className="text-lg">{categoria.categoria}</CardTitle>
                    <CardDescription>
                      {categoria.items.length} funcionalidade{categoria.items.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoria.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{item.nome}</h4>
                          {'badge' in item && item.badge && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informações Adicionais */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Como Navegar</CardTitle>
              <CardDescription>
                Use a barra lateral esquerda para acessar rapidamente todas essas funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Clique nos itens para expandir/colapsar categorias</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Use o botão de colapsar para economizar espaço</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Badges indicam notificações e itens novos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
