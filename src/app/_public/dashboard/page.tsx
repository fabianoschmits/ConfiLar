'use client'

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotificationService } from '@/hooks/useNotificationService';
import { Bell, Users, Star, MessageCircle, TrendingUp, Calendar, Settings, Search } from 'lucide-react';
import { PageTransition } from '@/components/animations/PageTransition';
import { FadeIn } from '@/components/animations/FadeIn';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo ao seu painel de controle do ConfiLar
          </p>
        </div>

        <DashboardContent />
      </div>
    </MainLayout>
  );
}

function DashboardContent() {
  const { profile } = useAuthContext();
  const { simulateNotifications } = useNotificationService();

  const isProfessional = profile?.user_type === 'professional';

  const stats = isProfessional ? [
    {
      title: 'Serviços Realizados',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: 'Avaliação Média',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive',
      icon: <Star className="h-6 w-6" />
    },
    {
      title: 'Clientes Ativos',
      value: '18',
      change: '+3',
      changeType: 'positive',
      icon: <Users className="h-6 w-6" />
    },
    {
      title: 'Mensagens',
      value: '7',
      change: '2 novas',
      changeType: 'neutral',
      icon: <MessageCircle className="h-6 w-6" />
    }
  ] : [
    {
      title: 'Serviços Contratados',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      title: 'Profissionais Favoritos',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: <Users className="h-6 w-6" />
    },
    {
      title: 'Avaliações Feitas',
      value: '9',
      change: '+1',
      changeType: 'positive',
      icon: <Star className="h-6 w-6" />
    },
    {
      title: 'Mensagens',
      value: '5',
      change: '1 nova',
      changeType: 'neutral',
      icon: <MessageCircle className="h-6 w-6" />
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Seção de Demonstração de Notificações */}
        <FadeIn delay={0.1}>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Bell className="h-5 w-5" />
            Sistema de Notificações
          </CardTitle>
          <CardDescription className="text-blue-700">
            Teste o sistema de notificações push e in-app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={simulateNotifications}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              🚀 Simular Notificações
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/notificacoes'}>
              ⚙️ Configurações
            </Button>
          </div>
                       <p className="text-sm text-blue-600 mt-3">
               Clique em &quot;Simular Notificações&quot; para ver o sistema funcionando.
               As notificações aparecerão automaticamente nos próximos segundos.
             </p>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge
                  variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                  className={`
                    ${stat.changeType === 'positive' ? 'bg-green-100 text-green-800' :
                      stat.changeType === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}
                  `}
                >
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Buscar Profissionais</h3>
                <p className="text-sm text-gray-600">Encontre profissionais qualificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mensagens</h3>
                <p className="text-sm text-gray-600">Veja suas conversas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Avaliações</h3>
                <p className="text-sm text-gray-600">Gerencie suas avaliações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Dados Básicos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{profile?.full_name || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <Badge variant="outline">
                    {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Localização:</span>
                  <span className="font-medium">
                    {profile?.location_city && profile?.location_state
                      ? `${profile.location_city}, ${profile.location_state}`
                      : 'Não informado'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Perfil Completo:</span>
                  <Badge variant={profile?.profile_completed ? 'default' : 'secondary'}>
                    {profile?.profile_completed ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verificado:</span>
                  <Badge variant="outline" className="text-yellow-600">
                    Pendente
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membro desde:</span>
                  <span className="font-medium">2024</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </FadeIn>
      </div>
    </PageTransition>
  );
 }
