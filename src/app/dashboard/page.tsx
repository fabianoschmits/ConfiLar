'use client'

import { Suspense } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import dynamic from 'next/dynamic'

// Dynamic imports para componentes pesados do dashboard
const DashboardCharts = dynamic(() => import('@/components/dashboard/DashboardCharts'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded animate-pulse" />
})

const RecentActivity = dynamic(() => import('@/components/dashboard/RecentActivity'), {
  ssr: false,
  loading: () => <div className="h-48 bg-gray-200 rounded animate-pulse" />
})

const StatsCards = dynamic(() => import('@/components/dashboard/StatsCards'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  )
})

export default function DashboardPage() {
  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Visão geral da sua atividade na plataforma
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            }>
              <StatsCards />
            </Suspense>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse" />}>
              <DashboardCharts />
            </Suspense>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <Suspense fallback={<div className="h-48 bg-gray-200 rounded animate-pulse" />}>
              <RecentActivity />
            </Suspense>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
