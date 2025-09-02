'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/MainLayout'
import { Separator } from '@/components/ui/separator'
import { 
  AlertTriangle, 
  Flag, 
  Shield, 
  CheckCircle, 
  Clock, 
  Ban, 
  UserCheck, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  Image, 
  Ban as BanIcon, 
  UserCheck as UserCheckIcon, 
  TrendingUp as TrendingUpIcon, 
  AlertCircle as AlertCircleIcon 
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reported_user_name: string
  reason: string
  description: string
  evidence: string[]
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  updated_at: string
  admin_notes: string
  resolution: string
}

export default function DenunciasPage() {
  const { user, profile } = useAuthContext()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')

  const loadReports = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      // Simular carregamento de denúncias
      const mockReports: Report[] = [
        {
          id: '1',
          reporter_id: user.id,
          reported_user_id: 'user2',
          reported_user_name: 'João Silva',
          reason: 'Comportamento inadequado',
          description: 'Usuário enviou mensagens ofensivas',
          evidence: ['screenshot1.jpg'],
          status: 'pending',
          severity: 'medium',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          admin_notes: '',
          resolution: ''
        }
      ]
      
      setReports(mockReports)
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error)
      toast.error('Erro ao carregar denúncias')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'investigating': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'investigating': return <AlertCircle className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'dismissed': return <BanIcon className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus
    const matchesSeverity = selectedSeverity === 'all' || report.severity === selectedSeverity
    return matchesStatus && matchesSeverity
  })

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Denúncias</h1>
            <p className="text-gray-600 mb-4">
              Faça login para acessar o sistema de denúncias.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🚨 Sistema de Denúncias</h1>
          <p className="text-gray-600">
            Gerencie e acompanhe denúncias de comportamento inadequado na plataforma
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="investigating">Em investigação</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="dismissed">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severidade
                </label>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as severidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as severidades</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedStatus('all')
                    setSelectedSeverity('all')
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Denúncias */}
        {loading ? (
          <div className="text-center py-8">
            <p>Carregando denúncias...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Flag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma denúncia encontrada
              </h3>
              <p className="text-gray-500">
                {selectedStatus !== 'all' || selectedSeverity !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há denúncias para exibir no momento'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          Denúncia contra {report.reported_user_name}
                        </h3>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">
                            {report.status === 'pending' && 'Pendente'}
                            {report.status === 'investigating' && 'Em investigação'}
                            {report.status === 'resolved' && 'Resolvido'}
                            {report.status === 'dismissed' && 'Descartado'}
                          </span>
                        </Badge>
                        <Badge className={getSeverityColor(report.severity)}>
                          <span className="capitalize">
                            {report.severity === 'low' && 'Baixa'}
                            {report.severity === 'medium' && 'Média'}
                            {report.severity === 'high' && 'Alta'}
                            {report.severity === 'critical' && 'Crítica'}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Motivo:</h4>
                          <p className="text-gray-600">{report.reason}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Descrição:</h4>
                          <p className="text-gray-600">{report.description}</p>
                        </div>
                        
                        {report.evidence.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">Evidências:</h4>
                            <div className="flex gap-2">
                              {report.evidence.map((evidence, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                  <Image className="h-4 w-4" />
                                  <span>{evidence}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-6 text-right text-sm text-gray-500">
                      <div>Criada em:</div>
                      <div>{new Date(report.created_at).toLocaleDateString('pt-BR')}</div>
                      {report.updated_at !== report.created_at && (
                        <>
                          <div className="mt-2">Atualizada em:</div>
                          <div>{new Date(report.updated_at).toLocaleDateString('pt-BR')}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      ID da denúncia: {report.id}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                      {report.status === 'pending' && (
                        <Button variant="outline" size="sm">
                          Atualizar Status
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  )
}
