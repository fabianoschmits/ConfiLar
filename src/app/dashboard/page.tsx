'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthContext } from '@/contexts/AuthContext'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import {
  Users,
  MessageCircle,
  Star,
  Eye,
  Heart,
  CheckCircle,
  Activity,
  Target,
  User,
  Briefcase,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react'

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
        <div className="min-h-screen bg-gray-50 p-3">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
        <div className="min-h-screen bg-gray-50 p-3">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border-gray-200 p-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar métricas</h2>
              <p className="text-gray-600 mb-4 text-sm">{error}</p>
              <button 
                onClick={refreshMetrics}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Tentar novamente
              </button>
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

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-3 w-3 text-green-400" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-400" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400'
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-3">
          {/* Header Compacto */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  Métricas
                </h1>
                <p className="text-gray-600 text-sm">
                  {profile?.full_name || 'Usuário'}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  profile?.user_type === 'professional' 
                    ? 'bg-blue-100 text-blue-800 border-blue-200' 
                    : 'bg-green-100 text-green-800 border-green-200'
                }`}
              >
                  {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                </Badge>
            </div>
          </div>

          {/* Métricas Principais - Grid 2x2 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Visualizações */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Visualizações</p>
                    <p className="text-lg font-bold text-gray-900">
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
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contatos */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Contatos</p>
                    <p className="text-lg font-bold text-gray-900">
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
                  <div className="p-2 bg-green-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avaliações */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Avaliações</p>
                    <p className="text-lg font-bold text-gray-900">
                      {metrics?.averageRating || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {metrics?.totalReviews || 0} reviews
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Serviços/Favoritos */}
            <Card className="bg-white border-gray-200 hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">
                      {profile?.user_type === 'professional' ? 'Serviços' : 'Favoritos'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {profile?.user_type === 'professional'
                        ? (metrics?.professionalMetrics?.totalServices || 0)
                        : (metrics?.clientMetrics?.favoriteProfessionals || 0)
                      }
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full">
                    {profile?.user_type === 'professional' ? (
                      <Briefcase className="h-4 w-4 text-purple-600" />
                    ) : (
                      <Heart className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Status do Perfil */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Status do Perfil</h2>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Verificado</span>
                    <Badge 
                      variant={profile?.is_verified ? 'default' : 'secondary'} 
                      className={`text-xs ${
                        profile?.is_verified 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {profile?.is_verified ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Completo</span>
                    <Badge 
                      variant={profile?.profile_completed ? 'default' : 'secondary'} 
                      className={`text-xs ${
                        profile?.profile_completed 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {profile?.profile_completed ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Badge</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                    >
                      {profile?.badge || 'Bronze'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Tipo</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        profile?.user_type === 'professional' 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : 'bg-green-100 text-green-800 border-green-200'
                      }`}
                    >
                      {profile?.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                    </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          {/* Atividade Recente - Compacta */}
          {metrics?.recentActivity && metrics.recentActivity.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Atividade Recente</h2>
              <Card className="bg-white border-gray-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {metrics.recentActivity.slice(0, 3).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <div className="text-sm">{activity.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}