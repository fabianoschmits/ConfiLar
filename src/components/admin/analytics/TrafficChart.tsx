'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

interface TrafficChartProps {
  timeRange: string
}

interface TrafficData {
  date: string
  posts: number
  messages: number
  views: number
  logins: number
}

export function TrafficChart({ timeRange }: TrafficChartProps) {
  const [data, setData] = useState<TrafficData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // Buscar posts
      const { data: posts } = await supabase
        .from('feed_posts')
        .select('created_at')
        .gte('created_at', startDate.toISOString())

      // Buscar mensagens (se a tabela existir)
      let messages: any[] = []
      try {
        const { data: msgs } = await supabase
          .from('messages')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
        messages = msgs || []
      } catch (e) {
        // Tabela pode não existir
      }

      // Buscar views de posts (se a tabela existir)
      let views: any[] = []
      try {
        const { data: postViews } = await supabase
          .from('post_views')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
        views = postViews || []
      } catch (e) {
        // Tabela pode não existir
      }

      // Agrupar por data
      const grouped: Record<string, { posts: number; messages: number; views: number; logins: number }> = {}
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        grouped[dateStr] = { posts: 0, messages: 0, views: 0, logins: 0 }
      }

      posts?.forEach((post) => {
        const date = new Date(post.created_at).toISOString().split('T')[0]
        if (grouped[date]) grouped[date].posts++
      })

      messages?.forEach((msg) => {
        const date = new Date(msg.created_at).toISOString().split('T')[0]
        if (grouped[date]) grouped[date].messages++
      })

      views?.forEach((view) => {
        const date = new Date(view.created_at).toISOString().split('T')[0]
        if (grouped[date]) grouped[date].views++
      })

      const chartData = Object.entries(grouped)
        .map(([date, values]) => ({
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          ...values
        }))
        .slice(-days)

      setData(chartData)
    } catch (error) {
      console.error('Erro ao buscar dados de tráfego:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartConfig = {
    posts: {
      label: 'Posts',
      color: 'hsl(var(--chart-1))'
    },
    messages: {
      label: 'Mensagens',
      color: 'hsl(var(--chart-2))'
    },
    views: {
      label: 'Visualizações',
      color: 'hsl(var(--chart-3))'
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando dados...</div>
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-gray-500">Nenhum dado disponível</div>
  }

  return (
    <div className="w-full overflow-x-auto">
      <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] min-w-[600px]">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
          <XAxis 
            dataKey="date" 
            className="text-[10px] sm:text-xs"
            tick={{ fill: 'currentColor', fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            className="text-[10px] sm:text-xs"
            tick={{ fill: 'currentColor', fontSize: 10 }}
            width={50}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area 
            type="monotone" 
            dataKey="posts" 
            stackId="1"
            stroke="hsl(221.2 83.2% 53.3%)" 
            fill="hsl(221.2 83.2% 53.3%)"
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="messages" 
            stackId="1"
            stroke="hsl(142.1 76.2% 36.3%)" 
            fill="hsl(142.1 76.2% 36.3%)"
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="views" 
            stackId="1"
            stroke="hsl(47.9 95.8% 53.1%)" 
            fill="hsl(47.9 95.8% 53.1%)"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

