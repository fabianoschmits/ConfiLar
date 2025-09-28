'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎛️ Painel de Administração
          </h1>
          <p className="text-gray-600">
            Visão completa do sistema ConfiLar - Usuários, Métricas e Monitoramento
          </p>
        </div>
        
        <AdminDashboard />
      </div>
    </div>
  )
}
