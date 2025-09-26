'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthContext } from '@/contexts/AuthContext'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import {
  Users,
  MessageCircle,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Award,
  ChevronRight,
  Plus,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Activity,
  Target,
  Zap,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile } = useAuthContext()
  const { metrics, loading, error, refreshMetrics } = useDashboardMetrics()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <Card className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refreshMetrics} variant="outline">
                Tentar novamente
              </Button>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return `${Math.floor(diffInMinutes / 1440)}d atrás`
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Header da Página */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  Dashboard
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Bem-vindo de volta, {profile?.full_name || 'Usuário'}!
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-sm sm:text-base">
                    {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Badge variant={profile?.user_type === 'professional' ? 'default' : 'secondary'} className="text-xs">
                  {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Estatísticas Principais - Cards Pequenos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-700 mb-1">Visualizações</p>
                    <p className="text-xl font-bold text-blue-900">
                      {formatNumber(metrics?.totalViews || 0)}
                    </p>
                    {metrics?.viewsGrowth !== undefined && (
                      <div className="flex items-center mt-1">
                        {getGrowthIcon(metrics.viewsGrowth)}
                        <span className={`text-xs ml-1 font-medium ${getGrowthColor(metrics.viewsGrowth)}`}>
                          {Math.abs(metrics.viewsGrowth)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-blue-200 rounded-full">
                    <Eye className="h-4 w-4 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-700 mb-1">Contatos</p>
                    <p className="text-xl font-bold text-green-900">
                      {formatNumber(metrics?.totalContacts || 0)}
                    </p>
                    {metrics?.contactsGrowth !== undefined && (
                      <div className="flex items-center mt-1">
                        {getGrowthIcon(metrics.contactsGrowth)}
                        <span className={`text-xs ml-1 font-medium ${getGrowthColor(metrics.contactsGrowth)}`}>
                          {Math.abs(metrics.contactsGrowth)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-green-200 rounded-full">
                    <MessageCircle className="h-4 w-4 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Avaliações</p>
                    <p className="text-xl font-bold text-yellow-900">
                      {metrics?.averageRating || 0}
                    </p>
                    <p className="text-xs text-yellow-600 font-medium">
                      {metrics?.totalReviews || 0} avaliações
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-200 rounded-full">
                    <Star className="h-4 w-4 text-yellow-700" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-700 mb-1">
                      {profile?.user_type === 'professional' ? 'Serviços' : 'Acordos'}
                    </p>
                    <p className="text-xl font-bold text-purple-900">
                      {profile?.user_type === 'professional'
                        ? (metrics?.professionalMetrics?.totalServices || 0)
                        : (metrics?.clientMetrics?.totalAgreements || 0)
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-full">
                    <Briefcase className="h-4 w-4 text-purple-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Específicas por Tipo de Usuário */}
          {profile?.user_type === 'professional' && metrics?.professionalMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-700 mb-1">Acordos Ativos</p>
                      <p className="text-lg font-bold text-blue-900">
                        {metrics.professionalMetrics.activeAgreements}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-full">
                      <Activity className="h-4 w-4 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-700 mb-1">Concluídos</p>
                      <p className="text-lg font-bold text-green-900">
                        {metrics.professionalMetrics.completedAgreements}
                      </p>
                    </div>
                    <div className="p-2 bg-green-200 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-purple-700 mb-1">Total</p>
                      <p className="text-lg font-bold text-purple-900">
                        {metrics.professionalMetrics.totalAgreements}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-200 rounded-full">
                      <Target className="h-4 w-4 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {profile?.user_type === 'client' && metrics?.clientMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-700 mb-1">Acordos Ativos</p>
                      <p className="text-lg font-bold text-blue-900">
                        {metrics.clientMetrics.activeAgreements}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-full">
                      <Activity className="h-4 w-4 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-700 mb-1">Concluídos</p>
                      <p className="text-lg font-bold text-green-900">
                        {metrics.clientMetrics.completedAgreements}
                      </p>
                    </div>
                    <div className="p-2 bg-green-200 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200 h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-red-700 mb-1">Profissionais</p>
                      <p className="text-lg font-bold text-red-900">
                        {metrics.clientMetrics.favoriteProfessionals}
                      </p>
                    </div>
                    <div className="p-2 bg-red-200 rounded-full">
                      <Heart className="h-4 w-4 text-red-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/editarperfil">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-green-200 rounded-full">
                        <User className="h-4 w-4 text-green-700" />
                      </div>
                      <ChevronRight className="h-3 w-3 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900 text-sm">Editar Perfil</h3>
                    <p className="text-xs text-green-600 font-medium">Atualizar dados</p>
                  </CardContent>
                </Card>
              </Link>

              {profile?.user_type === 'professional' && (
                <Link href="/portfolio">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 h-full">
                  <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-purple-200 rounded-full">
                          <Briefcase className="h-4 w-4 text-purple-700" />
                        </div>
                        <ChevronRight className="h-3 w-3 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-purple-900 text-sm">Portfólio</h3>
                      <p className="text-xs text-purple-600 font-medium">Meus trabalhos</p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              <Link href="/avaliacoes">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-yellow-200 rounded-full">
                        <Star className="h-4 w-4 text-yellow-700" />
                      </div>
                      <ChevronRight className="h-3 w-3 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-yellow-900 text-sm">Avaliações</h3>
                    <p className="text-xs text-yellow-600 font-medium">Ver feedback</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/buscar">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-blue-200 rounded-full">
                        <Zap className="h-4 w-4 text-blue-700" />
                      </div>
                      <ChevronRight className="h-3 w-3 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-900 text-sm">
                      {profile?.user_type === 'professional' ? 'Buscar Clientes' : 'Buscar Profissionais'}
                    </h3>
                    <p className="text-xs text-blue-600 font-medium">Encontrar serviços</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Atividade Recente */}
          {metrics?.recentActivity && metrics.recentActivity.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {metrics.recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        <div className="text-lg">{activity.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Ver todas as atividades
                      <ChevronRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Informações do Perfil */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Informações do Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 h-full">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-gray-200 rounded-full">
                        <Mail className="h-3 w-3 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-xs font-semibold text-gray-800 truncate">{profile?.email}</p>
                      </div>
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-gray-200 rounded-full">
                          <Phone className="h-3 w-3 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Telefone</p>
                          <p className="text-xs font-semibold text-gray-800">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                    {profile?.location_city && (
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-gray-200 rounded-full">
                          <MapPin className="h-3 w-3 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">Localização</p>
                          <p className="text-xs font-semibold text-gray-800">
                            {profile.location_city}, {profile.location_state}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 h-full">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-600 font-medium">Badge</span>
                      <Badge variant="secondary" className="text-xs bg-indigo-200 text-indigo-800">
                        {profile?.badge || 'Bronze'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-600 font-medium">Verificado</span>
                      <Badge variant={profile?.is_verified ? 'default' : 'secondary'} className="text-xs">
                        {profile?.is_verified ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-600 font-medium">Perfil Completo</span>
                      <Badge variant={profile?.profile_completed ? 'default' : 'secondary'} className="text-xs">
                        {profile?.profile_completed ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}