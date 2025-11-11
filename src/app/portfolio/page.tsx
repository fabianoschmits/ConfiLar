'use client'

// Desabilitar SSG para esta página
export const dynamic = 'force-dynamic'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  CheckCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { ClientOnly } from '@/components/ClientOnly'
import Link from 'next/link'

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-12 w-12 text-orange-600" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Portfólio
                  </h1>
                  <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                    Em Construção
                  </div>
                </div>
                
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg">
                    Estamos trabalhando em uma nova versão do portfólio
                  </p>
                  <p className="text-sm">
                    Em breve você poderá adicionar e gerenciar seus trabalhos de forma mais intuitiva
                  </p>
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Funcionalidades planejadas:</h3>
                  <ul className="text-sm text-gray-600 space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Upload de imagens dos trabalhos
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Categorização por tipo de trabalho
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Sistema de avaliações
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Compartilhamento público
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/feed">
                      Voltar ao Feed
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ClientOnly>
  )
}