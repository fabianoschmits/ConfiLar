'use client'

import { DuplicateCheckDemo } from '@/components/forms/DuplicateCheckDemo'
import { SimpleRegistrationForm } from '@/components/forms/SimpleRegistrationForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, UserPlus, TestTube } from 'lucide-react'

export default function TesteDuplicatasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <AlertCircle className="w-4 h-4" />
              Sistema de Verificação de Duplicatas
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teste do Sistema Anti-Duplicação
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Teste o sistema que impede cadastros com email ou CPF duplicados, 
              direcionando usuários para recuperação de conta.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="formulario" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formulario" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Formulário de Cadastro
              </TabsTrigger>
              <TabsTrigger value="teste" className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Teste da API
              </TabsTrigger>
            </TabsList>

            {/* Formulário de Cadastro */}
            <TabsContent value="formulario">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" />
                    Formulário de Cadastro com Validação em Tempo Real
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Digite um email ou CPF que já existe no sistema para ver a validação funcionando.
                    O sistema irá avisar sobre duplicatas e direcionar para recuperação de conta.
                  </p>
                </CardHeader>
                <CardContent>
                  <SimpleRegistrationForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teste da API */}
            <TabsContent value="teste">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-green-500" />
                    Teste da API de Verificação
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Teste diretamente a API de verificação de duplicatas. 
                    Digite emails ou CPFs para verificar se já existem no sistema.
                  </p>
                </CardHeader>
                <CardContent>
                  <DuplicateCheckDemo />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Informações sobre o Sistema */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Validação em Tempo Real</h3>
                  <p className="text-sm text-gray-600">
                    Verifica duplicatas enquanto o usuário digita, com debounce para otimizar performance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UserPlus className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Redirecionamento Inteligente</h3>
                  <p className="text-sm text-gray-600">
                    Quando encontra duplicatas, direciona o usuário para recuperação de senha ou login.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TestTube className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">API Reutilizável</h3>
                  <p className="text-sm text-gray-600">
                    API e hooks personalizados que podem ser usados em qualquer parte da aplicação.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
