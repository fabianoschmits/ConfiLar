'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  User, 
  MessageCircle, 
  FileText, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  Filter,
  Search,
  RefreshCw,
  Ban,
  Shield,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Interfaces para tipagem
interface Report {
  id: string
  report_type: 'user' | 'post' | 'message' | 'review' | 'other'
  description: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reporter_id: string
  reported_user_id?: string
  reported_post_id?: string
  reported_message_id?: string
  created_at: string
  updated_at: string
  admin_notes?: string
  resolution?: string
  reporter?: {
    id: string
    full_name: string
    email: string
    user_type: string
  }
  reported_user?: {
    id: string
    full_name: string
    email: string
    user_type: string
  }
  reported_post?: {
    id: string
    title: string
    content: string
    professional_id: string
  }
}

interface ReportStats {
  total_reports: number
  pending_reports: number
  resolved_reports: number
  dismissed_reports: number
  reports_by_type: Array<{ type: string; count: number }>
  reports_by_priority: Array<{ priority: string; count: number }>
  reports_last_24h: number
}

export function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([])
  const [reportStats, setReportStats] = useState<ReportStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: ''
  })
  const [adminNotes, setAdminNotes] = useState('')
  const [resolution, setResolution] = useState('')

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      // Buscar denúncias sem foreign keys complexas
      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar denúncias:', error)
        toast.error('Erro ao carregar denúncias')
        return
      }

      // Buscar informações dos usuários separadamente
      const enrichedReports = await Promise.all(
        (reportsData || []).map(async (report) => {
          let reporter = null
          let reportedUser = null
          let reportedPost = null

          // Buscar informações do denunciante
          if (report.reporter_id) {
            const { data: reporterData } = await supabase
              .from('profiles')
              .select('id, full_name, email, user_type')
              .eq('id', report.reporter_id)
              .single()
            reporter = reporterData
          }

          // Buscar informações do usuário denunciado
          if (report.reported_user_id) {
            const { data: reportedUserData } = await supabase
              .from('profiles')
              .select('id, full_name, email, user_type')
              .eq('id', report.reported_user_id)
              .single()
            reportedUser = reportedUserData
          }

          // Buscar informações do post denunciado
          if (report.reported_post_id) {
            const { data: reportedPostData } = await supabase
              .from('feed_posts')
              .select('id, title, content, professional_id')
              .eq('id', report.reported_post_id)
              .single()
            reportedPost = reportedPostData
          }

          return {
            ...report,
            reporter,
            reported_user: reportedUser,
            reported_post: reportedPost
          }
        })
      )

      setReports(enrichedReports)
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error)
      toast.error('Erro ao carregar denúncias')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReportStats = async () => {
    try {
      // Total de denúncias
      const { count: totalReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })

      // Denúncias pendentes
      const { count: pendingReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')

      // Denúncias resolvidas
      const { count: resolvedReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('status', 'resolved')

      // Denúncias dispensadas
      const { count: dismissedReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .eq('status', 'dismissed')

      // Denúncias das últimas 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: reportsLast24h } = await supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .gte('created_at', yesterday)

      // Denúncias por tipo
      const { data: reportsByType } = await supabase
        .from('reports')
        .select('report_type')

      const typeCounts = reportsByType?.reduce((acc: any, report: any) => {
        acc[report.report_type] = (acc[report.report_type] || 0) + 1
        return acc
      }, {}) || {}

      const reportsByTypeArray = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count: count as number }))

      // Denúncias por prioridade
      const { data: reportsByPriority } = await supabase
        .from('reports')
        .select('priority')

      const priorityCounts = reportsByPriority?.reduce((acc: any, report: any) => {
        acc[report.priority] = (acc[report.priority] || 0) + 1
        return acc
      }, {}) || {}

      const reportsByPriorityArray = Object.entries(priorityCounts)
        .map(([priority, count]) => ({ priority, count: count as number }))

      setReportStats({
        total_reports: totalReports || 0,
        pending_reports: pendingReports || 0,
        resolved_reports: resolvedReports || 0,
        dismissed_reports: dismissedReports || 0,
        reports_by_type: reportsByTypeArray,
        reports_by_priority: reportsByPriorityArray,
        reports_last_24h: reportsLast24h || 0
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas de denúncias:', error)
    }
  }

  const updateReportStatus = async (reportId: string, status: string, notes?: string, resolution?: string) => {
    try {
      console.log('Atualizando denúncia:', { reportId, status })
      
      // Atualização apenas com status - mais simples e confiável
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)

      if (error) {
        console.error('Erro ao atualizar denúncia:', error)
        toast.error(`Erro ao atualizar denúncia: ${error.message}`)
        return
      }

      toast.success('Status da denúncia atualizado com sucesso!')
      fetchReports()
      fetchReportStats()
      setShowReportModal(false)
    } catch (error) {
      console.error('Erro ao atualizar denúncia:', error)
      toast.error('Erro ao atualizar denúncia')
    }
  }

  const handleReportAction = async (reportId: string, action: string) => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return

    console.log('Ação solicitada:', action, 'para denúncia:', reportId)

    switch (action) {
      case 'resolve':
        await updateReportStatus(reportId, 'resolved')
        break
      case 'dismiss':
        await updateReportStatus(reportId, 'dismissed')
        break
      case 'review':
        await updateReportStatus(reportId, 'reviewing')
        break
      case 'ban_user':
        if (report.reported_user_id) {
          // Implementar suspensão de usuário
          toast.info('Funcionalidade de suspensão será implementada')
        }
        break
      case 'delete_content':
        if (report.reported_post_id) {
          // Implementar exclusão de conteúdo
          toast.info('Funcionalidade de exclusão será implementada')
        }
        break
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewing': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'dismissed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const getTypeIcon = (report_type: string) => {
    switch (report_type) {
      case 'user': return <User className="h-4 w-4" />
      case 'post': return <FileText className="h-4 w-4" />
      case 'message': return <MessageCircle className="h-4 w-4" />
      case 'review': return <Flag className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredReports = reports.filter(report => {
    if (filters.status !== 'all' && report.status !== filters.status) return false
    if (filters.type !== 'all' && report.report_type !== filters.type) return false
    if (filters.priority !== 'all' && report.priority !== filters.priority) return false
    if (filters.search && !report.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  useEffect(() => {
    fetchReports()
    fetchReportStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Denúncias</h2>
          <p className="text-sm text-gray-600">
            Gerencie denúncias de usuários, posts e mensagens
          </p>
        </div>
        <Button onClick={() => { fetchReports(); fetchReportStats(); }} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      {reportStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Denúncias</p>
                  <p className="text-3xl font-bold text-gray-900">{reportStats.total_reports}</p>
                </div>
                <Flag className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-blue-600">
                  +{reportStats.reports_last_24h} hoje
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">{reportStats.pending_reports}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-yellow-600">
                  Aguardando revisão
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolvidas</p>
                  <p className="text-3xl font-bold text-green-600">{reportStats.resolved_reports}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-green-600">
                  {Math.round((reportStats.resolved_reports / reportStats.total_reports) * 100)}% resolvidas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dispensadas</p>
                  <p className="text-3xl font-bold text-gray-600">{reportStats.dismissed_reports}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-500" />
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-gray-600">
                  Sem fundamento
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="reviewing">Em Revisão</SelectItem>
                  <SelectItem value="resolved">Resolvidas</SelectItem>
                  <SelectItem value="dismissed">Dispensadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="message">Mensagem</SelectItem>
                  <SelectItem value="review">Avaliação</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Prioridade</label>
              <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar denúncias..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de denúncias */}
      <Card>
        <CardHeader>
          <CardTitle>Denúncias ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all duration-200 bg-white">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(report.report_type)}
                    <div>
                      <div className="font-medium text-sm">
                        {report.report_type === 'user' ? 'Usuário' : 
                         report.report_type === 'post' ? 'Post' :
                         report.report_type === 'message' ? 'Mensagem' :
                         report.report_type === 'review' ? 'Avaliação' : 'Outros'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.reporter?.full_name || 'Anônimo'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                      {report.status === 'pending' ? 'Pendente' :
                       report.status === 'reviewing' ? 'Revisão' :
                       report.status === 'resolved' ? 'Resolvida' : 'Dispensada'}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(report.priority)}`}>
                      {report.priority === 'urgent' ? 'Urgente' :
                       report.priority === 'high' ? 'Alta' :
                       report.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </div>

                {/* Descrição */}
                <div className="mb-3">
                  <p className="text-sm text-gray-700 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {report.description}
                  </p>
                </div>

                {/* Data */}
                <div className="text-xs text-gray-500 mb-3">
                  {new Date(report.created_at).toLocaleDateString('pt-BR')}
                </div>

                {/* Ações */}
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes da Denúncia</DialogTitle>
                      </DialogHeader>
                      {selectedReport && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Informações da Denúncia</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              <p><strong>Tipo:</strong> {selectedReport.report_type}</p>
                              <p><strong>Descrição:</strong> {selectedReport.description}</p>
                              <p><strong>Status:</strong> {selectedReport.status}</p>
                              <p><strong>Prioridade:</strong> {selectedReport.priority}</p>
                            </div>
                          </div>

                          {selectedReport.reported_user && (
                            <div>
                              <h4 className="font-medium">Usuário Denunciado</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <p><strong>Nome:</strong> {selectedReport.reported_user.full_name}</p>
                                <p><strong>Email:</strong> {selectedReport.reported_user.email}</p>
                                <p><strong>Tipo:</strong> {selectedReport.reported_user.user_type}</p>
                              </div>
                            </div>
                          )}

                          {selectedReport.reported_post && (
                            <div>
                              <h4 className="font-medium">Post Denunciado</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <p><strong>Título:</strong> {selectedReport.reported_post.title}</p>
                                <p><strong>Conteúdo:</strong> {selectedReport.reported_post.content.substring(0, 200)}...</p>
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium">Ações Administrativas</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Use os botões abaixo para alterar o status da denúncia.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleReportAction(selectedReport.id, 'resolve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolver
                            </Button>
                            <Button 
                              onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                              variant="outline"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Dispensar
                            </Button>
                            <Button 
                              onClick={() => handleReportAction(selectedReport.id, 'review')}
                              variant="outline"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Em Revisão
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {report.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleReportAction(report.id, 'review')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Revisar
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="col-span-full text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma denúncia encontrada com os filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
