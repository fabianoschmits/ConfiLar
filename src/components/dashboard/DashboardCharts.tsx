'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Gráficos serão implementados em breve</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
