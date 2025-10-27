'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Flag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import { ClientOnly } from '@/components/ClientOnly'

interface UserReport {
  id: string
  type: 'user' | 'post' | 'message' | 'review' | 'classified' | 'other'
  reason: string
  description: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  admin_notes?: string
  resolution?: string
}

export default function MinhasDenunciasPage() {
  const [reports, setReports] = useState<UserReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthContext()

  const fetchUserReports = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar denúncias:', error)
        toast.error('Erro ao carregar suas denúncias')
        return
      }

      setReports(data || [])
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error)
      toast.error('Erro ao carregar suas denúncias')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchUserReports()
    }
  }, [user?.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewing': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'reviewing': return 'Em Revisão'
      case 'resolved': return 'Resolvida'
      case 'dismissed': return 'Dispensada'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'reviewing': return <Eye className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'dismissed': return <XCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user': return 'Usuário'
      case 'post': return 'Post'
      case 'message': return 'Mensagem'
      case 'review': return 'Avaliação'
      case 'classified': return 'Anúncio Classificado'
      default: return 'Outros'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente'
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return priority
    }
  }

  if (!user) {
    return (
      <ClientOnly>
        <MainLayout requireAuth={true}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você precisa estar logado para ver suas denúncias.
              </AlertDescription>
            </Alert>
          </div>
        </MainLayout>
      </ClientOnly>
    )
  }

  return (
    <ClientOnly>
      <MainLayout requireAuth={true}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Flag className="h-8 w-8 text-blue-500" />
                  Minhas Denúncias
                </h1>
                <p className="text-gray-600 mt-2">
                  Acompanhe o status de suas denúncias enviadas
                </p>
              </div>
              <Button 
                onClick={fetchUserReports} 
                disabled={isLoading}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</p>
                    </div>
                    <Flag className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {reports.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolvidas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reports.filter(r => r.status === 'resolved').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dispensadas</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {reports.filter(r => r.status === 'dismissed').length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Denúncias */}
            <div className="space-y-4">
              {reports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma denúncia encontrada
                    </h3>
                    <p className="text-gray-500">
                      Você ainda não enviou nenhuma denúncia.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              Denúncia de {getTypeLabel(report.type)}
                            </h3>
                            <Badge className={`${getStatusColor(report.status)} flex items-center gap-1`}>
                              {getStatusIcon(report.status)}
                              {getStatusLabel(report.status)}
                            </Badge>
                            <Badge className={`${getPriorityColor(report.priority)}`}>
                              {getPriorityLabel(report.priority)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">
                            <strong>Motivo:</strong> {report.reason}
                          </p>
                          <p className="text-gray-700 mb-3">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              <strong>Criada:</strong> {new Date(report.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            <span>
                              <strong>Atualizada:</strong> {new Date(report.updated_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notas do Admin */}
                      {report.admin_notes && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Nota do Administrador:</h4>
                          <p className="text-blue-800 text-sm">{report.admin_notes}</p>
                        </div>
                      )}

                      {/* Resolução */}
                      {report.resolution && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-1">Resolução:</h4>
                          <p className="text-green-800 text-sm">{report.resolution}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </ClientOnly>
  )
}
