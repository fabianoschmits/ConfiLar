import { Suspense } from 'react'
import { LightModeLayout } from '@/components/layout/LightModeLayout'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LightModeLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Suspense fallback={<div>Carregando...</div>}>
          {children}
        </Suspense>
      </div>
    </LightModeLayout>
  )
}

