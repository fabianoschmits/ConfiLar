'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  Users,
  MessageCircle,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  Briefcase,
  Heart,
  Eye,
  Award,
  ChevronRight,
  Plus,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import dynamicImport from 'next/dynamic'

// Dynamic imports para componentes pesados do dashboard
const DashboardCharts = dynamicImport(() => import('@/components/dashboard/DashboardCharts'), {
  ssr: false,
  loading: () => <Card className="h-64 animate-pulse"><CardContent className="p-6"><div className="h-52 bg-gray-200 rounded" /></CardContent></Card>
})

const RecentActivity = dynamicImport(() => import('@/components/dashboard/RecentActivity'), {
  ssr: false,
  loading: () => <Card className="h-48 animate-pulse"><CardContent className="p-6"><div className="h-36 bg-gray-200 rounded" /></CardContent></Card>
})

export default function DashboardPage() {
  const { user, profile } = useAuthContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Dados mockados para demonstração
  const stats = {
    totalViews: 1234,
    totalMessages: 45,
    averageRating: 4.8,
    completedJobs: 23,
    pendingMessages: 3,
    favoriteCount: 67,
    profileViews: 234,
    responseRate: 95
  }

  const quickActions = [
    {
      title: 'Ver Mensagens',
      description: `${stats.pendingMessages} novas mensagens`,
      icon: MessageCircle,
      href: '/mensagens',
      color: 'blue',
      urgent: stats.pendingMessages > 0
    },
    {
      title: 'Editar Perfil',
      description: 'Atualize suas informações',
      icon: Users,
      href: '/editarperfil',
      color: 'green'
    },
    {
      title: 'Ver Portfólio',
      description: 'Gerencie seus trabalhos',
      icon: Briefcase,
      href: '/portfolio',
      color: 'purple'
    },
    {
      title: 'Avaliações',
      description: 'Veja feedback dos clientes',
      icon: Star,
      href: '/avaliacoes',
      color: 'yellow'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'message',
      title: 'Nova mensagem de Maria Silva',
      description: 'Interessada em seus serviços de pintura',
      time: '2 min atrás',
      urgent: true
    },
    {
      id: 2,
      type: 'view',
      title: 'Seu perfil foi visualizado',
      description: 'João Santos visualizou seu perfil',
      time: '15 min atrás'
    },
    {
      id: 3,
      type: 'rating',
      title: 'Nova avaliação recebida',
      description: 'Ana Costa avaliou seu trabalho com 5 estrelas',
      time: '1 hora atrás'
    },
    {
      id: 4,
      type: 'favorite',
      title: 'Adicionado aos favoritos',
      description: 'Carlos Pereira salvou seu perfil',
      time: '3 horas atrás'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageCircle
      case 'view': return Eye
      case 'rating': return Star
      case 'favorite': return Heart
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600'
      case 'view': return 'bg-green-100 text-green-600'
      case 'rating': return 'bg-yellow-100 text-yellow-600'
      case 'favorite': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header da Página */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600">
                  Bem-vindo de volta, {profile?.full_name || 'Usuário'}!
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <Badge variant={profile?.user_type === 'professional' ? 'default' : 'secondary'}>
                    {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Visualizações</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Mensagens</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
                    {stats.pendingMessages > 0 && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        {stats.pendingMessages} novas
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avaliação</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Trabalhos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                        <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                      </div>
                      {action.urgent && (
                        <Badge variant="destructive" className="text-xs">Urgente</Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Gráficos e Atividade Recente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Gráficos */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas</h2>
              <Suspense fallback={
                <Card className="h-64 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-52 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              }>
                <DashboardCharts />
              </Suspense>
            </div>

            {/* Atividade Recente */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const IconComponent = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              {activity.urgent && (
                                <Badge variant="destructive" className="text-xs">
                                  Nova
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver todas as atividades
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Componente de Atividade Recente do Sistema */}
          <div className="mb-8">
            <Suspense fallback={
              <Card className="h-48 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-36 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            }>
              <RecentActivity />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}