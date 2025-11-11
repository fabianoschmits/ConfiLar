'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Shield, Edit3, Lock
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { DeleteAccountForm } from '@/components/forms/DeleteAccountForm'

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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    Alterar Senha
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Para alterar sua senha, use a opção de recuperação de senha na página de login.
                  </p>
                  <a 
                    href="/recuperar-senha" 
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    Recuperar/Alterar Senha →
                  </a>
                </CardContent>
              </Card>

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

