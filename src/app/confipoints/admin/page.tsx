'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { ConfiPointsAdminDashboard } from '@/components/admin/ConfiPointsAdminDashboard'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

const ADMIN_USER_ID = 'f7444305-a3bd-4d71-874a-bb95fd27f96a'

export default function ConfiPointsAdminPage() {
  const [mounted, setMounted] = useState(false)
  const { user, profile, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const isAdmin = user?.id === ADMIN_USER_ID

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || authLoading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  if (!isAdmin) {
    return (
      <MainLayout requireAuth={true}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Acesso Negado</h2>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você precisa ser um administrador para acessar esta página.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => router.push('/')} className="flex-1">
                  Ir para Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto py-8 px-4">
          <ConfiPointsAdminDashboard />
        </div>
      </div>
    </MainLayout>
  )
}

