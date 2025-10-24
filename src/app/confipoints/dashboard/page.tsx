'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { PointsDashboard } from '@/components/points/PointsDashboard'

export default function ConfiPointsDashboardPage() {
  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Meus ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Dashboard completo do seu sistema de pontos
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <PointsDashboard />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
