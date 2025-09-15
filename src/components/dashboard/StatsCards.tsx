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
  Handshake,
  Calendar,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function StatsCards() {
  const { profile } = useAuthContext()
  const { metrics, loading } = useDashboardMetrics()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 animate-pulse">
            <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-center">
        <p className="text-black font-black uppercase">NENHUMA MÉTRICA DISPONÍVEL</p>
      </div>
    )
  }

  // Métricas básicas para todos os usuários
  const basicStats = [
    {
      title: 'VISUALIZAÇÕES',
      value: metrics.totalViews,
      growth: metrics.viewsGrowth,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500'
    },
    {
      title: 'CONTATOS',
      value: metrics.totalContacts,
      growth: metrics.contactsGrowth,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500'
    },
    {
      title: 'AVALIAÇÕES',
      value: metrics.totalReviews,
      growth: metrics.reviewsGrowth,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-500'
    },
    {
      title: 'NOTA MÉDIA',
      value: metrics.averageRating.toFixed(1),
      growth: 0, // Não calculamos crescimento para nota média
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      borderColor: 'border-purple-500',
      isRating: true
    }
  ]

  // Métricas específicas por tipo de usuário
  const specificStats = profile?.user_type === 'professional' && metrics.professionalMetrics ? [
    {
      title: 'SERVIÇOS',
      value: metrics.professionalMetrics.totalServices,
      growth: 0,
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      borderColor: 'border-indigo-500'
    },
    {
      title: 'ACORDOS ATIVOS',
      value: metrics.professionalMetrics.activeAgreements,
      growth: 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-500'
    },
    {
      title: 'ACORDOS CONCLUÍDOS',
      value: metrics.professionalMetrics.completedAgreements,
      growth: 0,
      icon: CheckCircle,
      color: 'text-teal-600',
      bgColor: 'bg-teal-500',
      borderColor: 'border-teal-500'
    },
    {
      title: 'TOTAL ACORDOS',
      value: metrics.professionalMetrics.totalAgreements,
      growth: 0,
      icon: Handshake,
      color: 'text-pink-600',
      bgColor: 'bg-pink-500',
      borderColor: 'border-pink-500'
    }
  ] : profile?.user_type === 'client' && metrics.clientMetrics ? [
    {
      title: 'TOTAL ACORDOS',
      value: metrics.clientMetrics.totalAgreements,
      growth: 0,
      icon: Handshake,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500'
    },
    {
      title: 'ACORDOS ATIVOS',
      value: metrics.clientMetrics.activeAgreements,
      growth: 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-500'
    },
    {
      title: 'ACORDOS CONCLUÍDOS',
      value: metrics.clientMetrics.completedAgreements,
      growth: 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500'
    },
    {
      title: 'PROFISSIONAIS',
      value: metrics.clientMetrics.favoriteProfessionals,
      growth: 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
      borderColor: 'border-purple-500'
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
          <div 
            key={index} 
            className={cn(
              "bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200",
              stat.borderColor
            )}
          >
            {/* Header Brutalista */}
            <div className={cn("p-4 border-b-4 border-black", stat.bgColor)}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase">
                  {stat.title}
                </h3>
                <div className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="p-4">
              <div className="text-3xl font-black text-black mb-2">
                {stat.value}
                {'isRating' in stat && stat.isRating && <span className="text-lg text-gray-600 ml-1">/5</span>}
              </div>
              
              {stat.growth !== 0 && (
                <div className="flex items-center text-sm">
                  {isPositiveGrowth ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  ) : isNegativeGrowth ? (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  ) : null}
                  <span className={cn(
                    "font-black",
                    isPositiveGrowth ? "text-green-600" : 
                    isNegativeGrowth ? "text-red-600" : "text-gray-600"
                  )}>
                    {stat.growth > 0 ? '+' : ''}{stat.growth}%
                  </span>
                  <span className="text-gray-600 font-bold ml-1">vs mês anterior</span>
                </div>
              )}
              
              {stat.growth === 0 && (
                <div className="text-sm text-gray-600 font-bold">
                  SEM CRESCIMENTO
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
