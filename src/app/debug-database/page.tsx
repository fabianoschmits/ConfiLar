'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { DatabaseChecker } from '@/components/debug/DatabaseChecker'

export default function DebugDatabasePage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Debug - Banco de Dados</h1>
          <p className="text-gray-600">
            Verificação das tabelas relacionadas aos classificados
          </p>
        </div>
        
        <DatabaseChecker />
      </div>
    </MainLayout>
  )
}
