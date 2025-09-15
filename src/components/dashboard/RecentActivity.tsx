'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { MessageSquare, Star, Calendar, Eye, Clock, Handshake } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RecentActivity() {
  const { metrics, loading } = useDashboardMetrics()

  if (loading) {
    return (
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-black text-yellow-400 border-b-4 border-black p-4">
          <h3 className="text-lg font-black uppercase">ATIVIDADE RECENTE</h3>
        </div>
        <div className="p-4 space-y-4">
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
      </div>
    )
  }

  if (!metrics || metrics.recentActivity.length === 0) {
    return (
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-black text-yellow-400 border-b-4 border-black p-4">
          <h3 className="text-lg font-black uppercase">ATIVIDADE RECENTE</h3>
        </div>
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-black font-black uppercase mb-2">NENHUMA ATIVIDADE RECENTE</p>
          <p className="text-gray-600 font-bold">
            Suas atividades aparecerão aqui conforme você usa a plataforma
          </p>
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'review':
        return <Star className="h-4 w-4" />
      case 'agreement':
        return <Handshake className="h-4 w-4" />
      case 'view':
        return <Eye className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-500 text-white'
      case 'review':
        return 'bg-yellow-500 text-black'
      case 'agreement':
        return 'bg-green-500 text-white'
      case 'view':
        return 'bg-purple-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'AGORA MESMO'
    if (diffInMinutes < 60) return `${diffInMinutes}MIN ATRÁS`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}H ATRÁS`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}D ATRÁS`
    return activityTime.toLocaleDateString('pt-BR').toUpperCase()
  }

  return (
    <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Header Brutalista */}
      <div className="bg-black text-yellow-400 border-b-4 border-black p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase">ATIVIDADE RECENTE</h3>
          <div className="bg-yellow-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-1">
            <span className="text-sm font-black">{metrics.recentActivity.length} ATIVIDADES</span>
          </div>
        </div>
      </div>
      
      {/* Conteúdo */}
      <div className="p-4">
        <div className="space-y-3">
          {metrics.recentActivity.slice(0, 10).map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-4 p-3 bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center",
                getActivityColor(activity.type)
              )}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-black truncate uppercase">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-gray-600 ml-2 flex-shrink-0 font-bold">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2 font-bold">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {metrics.recentActivity.length > 10 && (
          <div className="mt-4 pt-4 border-t-4 border-black">
            <button className="w-full bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black py-2">
              VER TODAS AS ATIVIDADES ({metrics.recentActivity.length})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
