'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

interface PostsChartProps {
  timeRange: string
}

interface PostData {
  date: string
  created: number
  premium: number
  classifieds: number
}

export function PostsChart({ timeRange }: PostsChartProps) {
  const [data, setData] = useState<PostData[]>([])
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
        .select('created_at, is_premium')
        .gte('created_at', startDate.toISOString())

      // Buscar classificados
      let classifieds: any[] = []
      try {
        const { data: classifiedsData } = await supabase
          .from('classified_ads')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
        classifieds = classifiedsData || []
      } catch (e) {
        // Tabela pode não existir
      }

      // Agrupar por data
      const grouped: Record<string, { created: number; premium: number; classifieds: number }> = {}
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        grouped[dateStr] = { created: 0, premium: 0, classifieds: 0 }
      }

      posts?.forEach((post) => {
        const date = new Date(post.created_at).toISOString().split('T')[0]
        if (grouped[date]) {
          grouped[date].created++
          if (post.is_premium) {
            grouped[date].premium++
          }
        }
      })

      classifieds?.forEach((classified) => {
        const date = new Date(classified.created_at).toISOString().split('T')[0]
        if (grouped[date]) {
          grouped[date].classifieds++
        }
      })

      const chartData = Object.entries(grouped)
        .map(([date, values]) => ({
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          ...values
        }))
        .slice(-days)

      setData(chartData)
    } catch (error) {
      console.error('Erro ao buscar dados de posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartConfig = {
    created: {
      label: 'Posts Criados',
      color: 'hsl(var(--chart-1))'
    },
    premium: {
      label: 'Posts Premium',
      color: 'hsl(var(--chart-2))'
    },
    classifieds: {
      label: 'Anúncios',
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
    <div className="space-y-4">
      <div className="w-full overflow-x-auto">
        <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] min-w-[600px]">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
            <Bar 
              dataKey="created" 
              fill="hsl(221.2 83.2% 53.3%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="premium" 
              fill="hsl(47.9 95.8% 53.1%)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="classifieds" 
              fill="hsl(142.1 76.2% 36.3%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total de Posts</p>
          <p className="text-xl font-bold">{data.reduce((sum, d) => sum + d.created, 0)}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Posts Premium</p>
          <p className="text-xl font-bold">{data.reduce((sum, d) => sum + d.premium, 0)}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Anúncios</p>
          <p className="text-xl font-bold">{data.reduce((sum, d) => sum + d.classifieds, 0)}</p>
        </div>
      </div>
    </div>
  )
}

