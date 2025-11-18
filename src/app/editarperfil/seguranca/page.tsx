'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Edit3 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { DeleteAccountForm } from '@/components/forms/DeleteAccountForm'
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm'

export default function SegurancaPage() {
  const { user } = useAuthContext()
  const router = useRouter()

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Segurança</h1>
                  <p className="text-gray-600">Gerencie a segurança da sua conta</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Alterar Senha */}
              <ChangePasswordForm />

              {/* Deletar Conta */}
              <div className="pt-4">
                <DeleteAccountForm userEmail={user?.email || ''} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

