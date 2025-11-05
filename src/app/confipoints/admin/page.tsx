'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { ConfiPointsAdminDashboard } from '@/components/admin/ConfiPointsAdminDashboard'
import { AdminGuard } from '@/components/admin/AdminGuard'

export default function ConfiPointsAdminPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <MainLayout requireAuth={true}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto py-8 px-4">
            <ConfiPointsAdminDashboard />
          </div>
        </div>
      </AdminGuard>
    </MainLayout>
  )
}

