'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

interface UsersChartProps {
  timeRange: string
}

interface UserData {
  date: string
  total: number
  new: number
  active: number
}

export function UsersChart({ timeRange }: UsersChartProps) {
  const [data, setData] = useState<UserData[]>([])
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

      // Buscar usuários criados
      const { data: users } = await supabase
        .from('profiles')
        .select('created_at, updated_at')
        .gte('created_at', startDate.toISOString())

      // Agrupar por data
      const grouped: Record<string, { total: number; new: number; active: number }> = {}
      
      // Inicializar todos os dias
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        grouped[dateStr] = { total: 0, new: 0, active: 0 }
      }

      // Processar usuários
      users?.forEach((user) => {
        const createdDate = new Date(user.created_at).toISOString().split('T')[0]
        
        // Contar novos usuários no dia de criação
        if (grouped[createdDate]) {
          grouped[createdDate].new++
        }
      })

      // Calcular total acumulado e ativos
      let runningTotal = 0
      Object.keys(grouped).forEach((date) => {
        runningTotal += grouped[date].new
        grouped[date].total = runningTotal
        
        // Contar ativos (atualizados nos últimos 7 dias)
        const checkDate = new Date(date)
        const sevenDaysAgo = new Date(checkDate)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        users?.forEach((user) => {
          const updatedDate = new Date(user.updated_at)
          if (updatedDate >= sevenDaysAgo && updatedDate <= checkDate) {
            grouped[date].active++
          }
        })
      })

      const chartData = Object.entries(grouped)
        .map(([date, values]) => ({
          date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          ...values
        }))
        .slice(-days)

      setData(chartData)
    } catch (error) {
      console.error('Erro ao buscar dados de usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartConfig = {
    total: {
      label: 'Total de Usuários',
      color: 'hsl(var(--chart-1))'
    },
    new: {
      label: 'Novos Usuários',
      color: 'hsl(var(--chart-2))'
    },
    active: {
      label: 'Usuários Ativos',
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
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(221.2 83.2% 53.3%)" 
              strokeWidth={2}
              name="Total de Usuários"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="new" 
              stroke="hsl(142.1 76.2% 36.3%)" 
              strokeWidth={2}
              name="Novos Usuários"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="active" 
              stroke="hsl(47.9 95.8% 53.1%)" 
              strokeWidth={2}
              name="Usuários Ativos"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-xl font-bold">{data[data.length - 1]?.total || 0}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Novos (período)</p>
          <p className="text-xl font-bold">{data.reduce((sum, d) => sum + d.new, 0)}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Ativos (últimos 7 dias)</p>
          <p className="text-xl font-bold">{data[data.length - 1]?.active || 0}</p>
        </div>
      </div>
    </div>
  )
}

