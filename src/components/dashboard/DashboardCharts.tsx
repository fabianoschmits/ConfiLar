'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { TrendingUp, Eye, MessageSquare, Star } from 'lucide-react'

export default function DashboardCharts() {
  const { metrics, loading } = useDashboardMetrics()

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Nenhum dado disponível para gráficos</p>
        </CardContent>
      </Card>
    )
  }

  // Componente de gráfico simples usando CSS
  const SimpleChart = ({ 
    data, 
    title, 
    color = 'blue',
    icon: Icon,
    maxValue 
  }: { 
    data: Array<{ date: string; value: number }>
    title: string
    color?: string
    icon: any
    maxValue: number
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500'
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1 px-2">
            {data.slice(-14).map((item, index) => {
              const height = (item.value / maxValue) * 100
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-6 ${colorClasses[color]} rounded-t transition-all duration-300 hover:opacity-80`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${item.date}: ${item.value}`}
                  />
                  {index % 3 === 0 && (
                    <span className="text-xs text-gray-500 transform -rotate-45 origin-left">
                      {new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Últimos 14 dias</span>
            <span>Máximo: {maxValue}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calcular valores máximos para normalização
  const maxViews = Math.max(...metrics.chartData.viewsOverTime.map(d => d.views))
  const maxContacts = Math.max(...metrics.chartData.contactsOverTime.map(d => d.contacts))
  const maxRating = Math.max(...metrics.chartData.ratingsOverTime.map(d => d.rating))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SimpleChart
        data={metrics.chartData.viewsOverTime}
        title="Visualizações do Perfil"
        color="blue"
        icon={Eye}
        maxValue={maxViews}
      />
      
      <SimpleChart
        data={metrics.chartData.contactsOverTime}
        title="Contatos Recebidos"
        color="green"
        icon={MessageSquare}
        maxValue={maxContacts}
      />
      
      <SimpleChart
        data={metrics.chartData.ratingsOverTime}
        title="Avaliações Recebidas"
        color="yellow"
        icon={Star}
        maxValue={maxRating}
      />
      
      {/* Gráfico de resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Visualizações</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.totalViews / Math.max(maxViews, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{metrics.totalViews}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Contatos</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.totalContacts / Math.max(maxContacts, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{metrics.totalContacts}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avaliações</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.totalReviews / Math.max(maxRating, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{metrics.totalReviews}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nota Média</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(metrics.averageRating / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{metrics.averageRating.toFixed(1)}/5</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Crescimento Mensal</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Visualizações</span>
                <span className={`font-medium ${metrics.viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.viewsGrowth > 0 ? '+' : ''}{metrics.viewsGrowth}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contatos</span>
                <span className={`font-medium ${metrics.contactsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.contactsGrowth > 0 ? '+' : ''}{metrics.contactsGrowth}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avaliações</span>
                <span className={`font-medium ${metrics.reviewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.reviewsGrowth > 0 ? '+' : ''}{metrics.reviewsGrowth}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
