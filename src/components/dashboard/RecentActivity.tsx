'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { MessageSquare, Star, Calendar, Eye, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RecentActivity() {
  const { metrics, loading } = useDashboardMetrics()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics || metrics.recentActivity.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500">Nenhuma atividade recente</p>
            <p className="text-sm text-gray-400 mt-2">
              Suas atividades aparecerão aqui conforme você usa a plataforma
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'review':
        return <Star className="h-4 w-4" />
      case 'booking':
        return <Calendar className="h-4 w-4" />
      case 'view':
        return <Eye className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-600'
      case 'review':
        return 'bg-yellow-100 text-yellow-600'
      case 'booking':
        return 'bg-green-100 text-green-600'
      case 'view':
        return 'bg-purple-100 text-purple-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d atrás`
    return activityTime.toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Atividade Recente</span>
          <span className="text-sm font-normal text-gray-500">
            {metrics.recentActivity.length} atividades
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.recentActivity.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                getActivityColor(activity.type)
              )}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {metrics.recentActivity.length > 10 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todas as atividades ({metrics.recentActivity.length})
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
