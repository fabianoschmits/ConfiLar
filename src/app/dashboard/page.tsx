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
      <div className="min-h-screen bg-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Brutalista */}
          <div className="mb-8">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-slide-in-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-poetsen-one text-black uppercase animate-fade-in" style={{textShadow: 'none'}}>DASHBOARD</h1>
              <p className="mt-2 text-black font-bold animate-fade-in">
                Visão geral da sua atividade na plataforma
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse" />
                ))}
              </div>
            }>
              <StatsCards />
            </Suspense>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Suspense fallback={<div className="h-64 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse" />}>
              <DashboardCharts />
            </Suspense>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <Suspense fallback={<div className="h-48 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse" />}>
              <RecentActivity />
            </Suspense>
          </div>
        </div>
        
        {/* Animações CSS Brutalistas */}
        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-in-up {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }
          
          .animate-slide-in-up {
            animation: slide-in-up 0.8s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    </MainLayout>
  )
}
