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
  AlertCircle,
  Trash2,
  CheckSquare,
  Square,
  Check,
  UserX
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

// Interfaces para tipagem
interface Report {
  id: string
  report_type: 'user' | 'post' | 'message' | 'review' | 'classified' | 'other'
  reason: string
  description: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reporter_id: string
  reported_user_id?: string
  reported_post_id?: string
  reported_message_id?: string
  reported_classified_id?: string
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
  classified_ad?: {
    id: string
    title: string
    description: string
    user_name: string
    user_id: string
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
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [banForm, setBanForm] = useState({
    reason: '',
    ban_type: 'temporary' as 'temporary' | 'permanent',
    duration_days: 7,
    admin_notes: ''
  })

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

          // Buscar informações do anúncio classificado denunciado
          let classifiedAd = null
          if (report.reported_classified_id) {
            const { data: classifiedAdData } = await supabase
              .from('classified_ads')
              .select('id, title, description, user_name, user_id')
              .eq('id', report.reported_classified_id)
              .single()
            classifiedAd = classifiedAdData
          }

          return {
            ...report,
            reporter,
            reported_user: reportedUser,
            reported_post: reportedPost,
            classified_ad: classifiedAd
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

      // Se a denúncia foi marcada como "reviewing", criar banimento pendente
      if (status === 'reviewing') {
        try {
          const { error: banError } = await supabase.rpc('create_pending_ban_from_report', {
            report_id: reportId
          })

          if (banError) {
            console.error('Erro ao criar banimento pendente:', banError)
            // Não mostrar erro para o usuário, apenas log
          } else {
            toast.success('Banimento pendente criado automaticamente!')
          }
        } catch (banError) {
          console.error('Erro ao criar banimento pendente:', banError)
          // Não mostrar erro para o usuário, apenas log
        }
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

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) {
        console.error('Erro ao deletar denúncia:', error)
        toast.error('Erro ao deletar denúncia')
        return
      }

      toast.success('Denúncia deletada com sucesso!')
      fetchReports()
      fetchReportStats()
    } catch (error) {
      console.error('Erro ao deletar denúncia:', error)
      toast.error('Erro ao deletar denúncia')
    }
  }

  const deleteSelectedReports = async () => {
    if (selectedReports.length === 0) return

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .in('id', selectedReports)

      if (error) {
        console.error('Erro ao deletar denúncias:', error)
        toast.error('Erro ao deletar denúncias selecionadas')
        return
      }

      toast.success(`${selectedReports.length} denúncias deletadas com sucesso!`)
      setSelectedReports([])
      setIsSelectMode(false)
      fetchReports()
      fetchReportStats()
    } catch (error) {
      console.error('Erro ao deletar denúncias:', error)
      toast.error('Erro ao deletar denúncias selecionadas')
    }
  }

  const banUser = async (userId: string) => {
    if (!banForm.reason.trim()) {
      toast.error('Preencha o motivo do banimento')
      return
    }

    try {
      const { data, error } = await supabase.rpc('ban_user', {
        target_user_id: userId,
        ban_reason: banForm.reason,
        ban_type: banForm.ban_type,
        duration_days: banForm.ban_type === 'temporary' ? banForm.duration_days : null,
        admin_notes: banForm.admin_notes || null,
        related_report_id: selectedReport?.id || null
      })

      if (error) {
        console.error('Erro ao banir usuário:', error)
        toast.error('Erro ao banir usuário')
        return
      }

      toast.success('Usuário banido com sucesso!')
      setShowBanModal(false)
      setBanForm({
        reason: '',
        ban_type: 'temporary',
        duration_days: 7,
        admin_notes: ''
      })
      fetchReports()
      fetchReportStats()
    } catch (error) {
      console.error('Erro ao banir usuário:', error)
      toast.error('Erro ao banir usuário')
    }
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    setSelectedReports([])
  }

  const toggleReportSelection = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    )
  }

  const selectAllReports = () => {
    const allReportIds = filteredReports.map(report => report.id)
    setSelectedReports(allReportIds)
  }

  const clearSelection = () => {
    setSelectedReports([])
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
      case 'delete':
        if (confirm('Tem certeza que deseja deletar esta denúncia? Esta ação não pode ser desfeita.')) {
          await deleteReport(reportId)
        }
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
      case 'classified': return <FileText className="h-4 w-4" />
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
                  <SelectItem value="classified">Classificado</SelectItem>
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
          <div className="flex items-center justify-between">
            <CardTitle>Denúncias ({filteredReports.length})</CardTitle>
            <div className="flex items-center gap-2">
              {isSelectMode && (
                <>
                  <Button 
                    onClick={selectAllReports}
                    variant="outline"
                    size="sm"
                    disabled={selectedReports.length === filteredReports.length}
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Selecionar Todas
                  </Button>
                  <Button 
                    onClick={clearSelection}
                    variant="outline"
                    size="sm"
                    disabled={selectedReports.length === 0}
                  >
                    <Square className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                  <Button 
                    onClick={deleteSelectedReports}
                    variant="destructive"
                    size="sm"
                    disabled={selectedReports.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Deletar ({selectedReports.length})
                  </Button>
                </>
              )}
              <Button 
                onClick={toggleSelectMode}
                variant={isSelectMode ? "default" : "outline"}
                size="sm"
              >
                {isSelectMode ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Sair da Seleção
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Selecionar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredReports.map((report) => (
              <div key={report.id} className={`border rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all duration-200 bg-white ${isSelectMode ? 'border-blue-300' : ''} ${selectedReports.includes(report.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                {/* Checkbox de Seleção */}
                {isSelectMode && (
                  <div className="flex items-center mb-3">
                    <button
                      onClick={() => toggleReportSelection(report.id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {selectedReports.includes(report.id) ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                      <span>Selecionar</span>
                    </button>
                  </div>
                )}
                
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(report.report_type)}
                    <div>
                      <div className="font-medium text-sm">
                        {report.report_type === 'user' ? 'Usuário' : 
                         report.report_type === 'post' ? 'Post' :
                         report.report_type === 'message' ? 'Mensagem' :
                         report.report_type === 'review' ? 'Avaliação' :
                         report.report_type === 'classified' ? 'Classificado' : 'Outros'}
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
                              <p><strong>Motivo:</strong> {selectedReport.reason}</p>
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

                          {selectedReport.classified_ad && (
                            <div>
                              <h4 className="font-medium">Anúncio Classificado Denunciado</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <p><strong>Título:</strong> {selectedReport.classified_ad.title}</p>
                                <p><strong>Descrição:</strong> {selectedReport.classified_ad.description.substring(0, 200)}...</p>
                                <p><strong>Usuário:</strong> {selectedReport.classified_ad.user_name}</p>
                              </div>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium">Ações Administrativas</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Use os botões abaixo para alterar o status da denúncia.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
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
                            {/* Botão de banir usuário - só aparece se houver usuário reportado */}
                            {selectedReport.reported_user_id && (
                              <Button 
                                onClick={() => setShowBanModal(true)}
                                variant="destructive"
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Banir Usuário
                              </Button>
                            )}
                            {selectedReport.status === 'resolved' && (
                              <Button 
                                onClick={() => handleReportAction(selectedReport.id, 'delete')}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Deletar
                              </Button>
                            )}
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

      {/* Modal para Banir Usuário */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-red-500" />
              Banir Usuário
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedReport?.reported_user && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Usuário a ser banido:</h4>
                <p className="text-sm text-gray-600">
                  <strong>Nome:</strong> {selectedReport.reported_user.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedReport.reported_user.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tipo:</strong> {selectedReport.reported_user.user_type}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="ban_reason" className="text-sm font-medium">
                Motivo do Banimento *
              </Label>
              <Textarea
                id="ban_reason"
                placeholder="Descreva o motivo do banimento..."
                value={banForm.reason}
                onChange={(e) => setBanForm({...banForm, reason: e.target.value})}
                className="mt-1"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="ban_type" className="text-sm font-medium">
                Tipo de Banimento
              </Label>
              <Select 
                value={banForm.ban_type} 
                onValueChange={(value: 'temporary' | 'permanent') => setBanForm({...banForm, ban_type: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporário</SelectItem>
                  <SelectItem value="permanent">Permanente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {banForm.ban_type === 'temporary' && (
              <div>
                <Label htmlFor="duration_days" className="text-sm font-medium">
                  Duração (dias)
                </Label>
                <Input
                  id="duration_days"
                  type="number"
                  min="1"
                  max="365"
                  value={banForm.duration_days}
                  onChange={(e) => setBanForm({...banForm, duration_days: parseInt(e.target.value) || 7})}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="admin_notes" className="text-sm font-medium">
                Notas do Administrador
              </Label>
              <Textarea
                id="admin_notes"
                placeholder="Notas adicionais (opcional)..."
                value={banForm.admin_notes}
                onChange={(e) => setBanForm({...banForm, admin_notes: e.target.value})}
                className="mt-1"
                rows={2}
              />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Atenção:</strong> Esta ação é irreversível. O usuário será banido imediatamente e não poderá acessar a plataforma.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBanModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => selectedReport?.reported_user_id && banUser(selectedReport.reported_user_id)}
                disabled={!banForm.reason.trim() || !selectedReport?.reported_user_id}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <UserX className="h-4 w-4 mr-1" />
                Banir Usuário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
