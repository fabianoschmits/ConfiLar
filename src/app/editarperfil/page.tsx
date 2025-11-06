'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'

export default function EditarPerfilPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a nova página de dados da conta
    router.replace('/editarperfil/dados-da-conta')
  }, [router])

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecionando...</p>
        </div>
      </div>
    </MainLayout>
  )
}
