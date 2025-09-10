'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/contexts/AuthContext'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { 
  Users, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Eye,
  DollarSign,
  Calendar,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StatsCards() {
  const { profile } = useAuthContext()
  const { metrics, loading } = useDashboardMetrics()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhuma métrica disponível</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Métricas básicas para todos os usuários
  const basicStats = [
    {
      title: 'Visualizações',
      value: metrics.totalViews,
      growth: metrics.viewsGrowth,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Contatos',
      value: metrics.totalContacts,
      growth: metrics.contactsGrowth,
      icon: MessageSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avaliações',
      value: metrics.totalReviews,
      growth: metrics.reviewsGrowth,
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Nota Média',
      value: metrics.averageRating.toFixed(1),
      growth: 0, // Não calculamos crescimento para nota média
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      isRating: true
    }
  ]

  // Métricas específicas por tipo de usuário
  const specificStats = profile?.user_type === 'professional' && metrics.professionalMetrics ? [
    {
      title: 'Serviços Oferecidos',
      value: metrics.professionalMetrics.totalServices,
      growth: 0,
      icon: Briefcase,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Ganhos Totais',
      value: `R$ ${metrics.professionalMetrics.totalEarnings.toLocaleString()}`,
      growth: metrics.professionalMetrics.earningsGrowth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      isCurrency: true
    },
    {
      title: 'Agendamentos Ativos',
      value: metrics.professionalMetrics.activeBookings,
      growth: 0,
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Trabalhos Concluídos',
      value: metrics.professionalMetrics.completedJobs,
      growth: 0,
      icon: Users,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50'
    }
  ] : profile?.user_type === 'client' && metrics.clientMetrics ? [
    {
      title: 'Agendamentos',
      value: metrics.clientMetrics.totalBookings,
      growth: metrics.clientMetrics.bookingsGrowth,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Gasto',
      value: `R$ ${metrics.clientMetrics.totalSpent.toLocaleString()}`,
      growth: 0,
      icon: DollarSign,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      isCurrency: true
    },
    {
      title: 'Profissionais Favoritos',
      value: metrics.clientMetrics.favoriteProfessionals,
      growth: 0,
      icon: Users,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    }
  ] : []

  // Combinar métricas básicas com específicas
  const allStats = [...basicStats, ...specificStats].slice(0, 8) // Máximo 8 cards

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {allStats.map((stat, index) => {
        const Icon = stat.icon
        const isPositiveGrowth = stat.growth > 0
        const isNegativeGrowth = stat.growth < 0
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
                {stat.isRating && <span className="text-sm text-gray-500 ml-1">/5</span>}
              </div>
              {stat.growth !== 0 && (
                <div className="flex items-center text-xs">
                  {isPositiveGrowth ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : isNegativeGrowth ? (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  ) : null}
                  <span className={cn(
                    "font-medium",
                    isPositiveGrowth ? "text-green-600" : 
                    isNegativeGrowth ? "text-red-600" : "text-gray-500"
                  )}>
                    {stat.growth > 0 ? '+' : ''}{stat.growth}%
                  </span>
                  <span className="text-gray-500 ml-1">vs mês anterior</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
