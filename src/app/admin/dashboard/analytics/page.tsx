'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/admin/shared/PageHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UsersChart } from '@/components/admin/analytics/UsersChart'
import { TrafficChart } from '@/components/admin/analytics/TrafficChart'
import { ConfiPointsChart } from '@/components/admin/analytics/ConfiPointsChart'
import { PostsChart } from '@/components/admin/analytics/PostsChart'
import { StatesChart } from '@/components/admin/analytics/StatesChart'
import { ActivityChart } from '@/components/admin/analytics/ActivityChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('30d')
  const [loading, setLoading] = useState(false)

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Análises e Gráficos
        </h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="1y">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Gráficos de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários e Crescimento</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersChart timeRange={timeRange} />
          </CardContent>
        </Card>

        {/* Gráfico de Estados */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Estados</CardTitle>
          </CardHeader>
          <CardContent>
            <StatesChart />
          </CardContent>
        </Card>

        {/* Gráficos de Tráfego */}
        <Card>
          <CardHeader>
            <CardTitle>Tráfego e Atividade no Site</CardTitle>
          </CardHeader>
          <CardContent>
            <TrafficChart timeRange={timeRange} />
          </CardContent>
        </Card>

        {/* Gráfico de ConfiPoints */}
        <Card>
          <CardHeader>
            <CardTitle>Circulação de ConfiPoints</CardTitle>
          </CardHeader>
          <CardContent>
            <ConfiPointsChart timeRange={timeRange} />
          </CardContent>
        </Card>

        {/* Gráficos de Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Posts e Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <PostsChart timeRange={timeRange} />
          </CardContent>
        </Card>

        {/* Gráfico de Atividade */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Geral do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityChart timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

