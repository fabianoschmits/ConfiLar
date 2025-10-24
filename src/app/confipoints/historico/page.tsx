'use client'

import React from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { PointsHistory } from '@/components/points/PointsHistory'

export default function ConfiPointsHistoricoPage() {
  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Histórico de ConfiPoints
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Todas as suas transações de pontos
                  </p>
                </div>
              </div>
            </div>

            {/* Histórico */}
            <PointsHistory limit={50} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
