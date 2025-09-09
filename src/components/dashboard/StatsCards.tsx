'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/contexts/AuthContext'
import { Users, MessageSquare, Star, TrendingUp } from 'lucide-react'

export default function StatsCards() {
  const { profile } = useAuthContext()

  const stats = [
    {
      title: 'Avaliações',
      value: profile?.total_reviews || 0,
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      title: 'Recomendações',
      value: 0, // TODO: Implementar contagem de recomendações
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Mensagens',
      value: 0, // TODO: Implementar contagem de mensagens
      icon: MessageSquare,
      color: 'text-green-500'
    },
    {
      title: 'Visualizações',
      value: 0, // TODO: Implementar contagem de visualizações
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
