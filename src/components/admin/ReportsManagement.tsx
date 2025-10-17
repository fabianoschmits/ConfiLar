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
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

// Interfaces para tipagem
interface Report {
  id: string
  type: 'user' | 'post' | 'message' | 'review' | 'classified' | 'other'
  reason: string
  description: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  reporter_id: string
  reported_user_id?: string
  reported_post_id?: string
  reported_message_id?: string
  reported_classified_id?: string
  admin_notes?: string
  resolution?: string
  created_at: string
  updated_at: string
  reporter?: {
    id: string
    full_name: string
    email: string
    user_type: string
    avatar_url?: string
  }
  reported_user?: {
    id: string
    full_name: string
    email: string
    user_type: string
    avatar_url?: string
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
  conversation_messages?: Array<{
    id: string
    content: string
    created_at: string
    updated_at: string
    sender_id: string
    conversation_id: string
    profiles: {
      full_name: string
      avatar_url?: string
    }
  }>
  review_details?: {
    id: string
    rating_person: number
    comment: string
    created_at: string
    reviewer_id: string
    reviewed_id: string
    profiles: {
      full_name: string
      avatar_url?: string
    }
  }
}

interface ReportStats {
  total: number
  pending: number
  resolved: number
  dismissed: number
  last24h: number
  byType: any[]
  byPriority: any[]
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
      const response = await fetch('/api/admin/reports')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar denúncias')
      }

      const { reports } = await response.json()
      setReports(reports)
    } catch (error) {
      console.error('Erro ao buscar denúncias:', error)
      toast.error('Erro ao carregar denúncias')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReportStats = async () => {
    try {
      const response = await fetch('/api/admin/reports/stats')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas')
      }

      const { stats } = await response.json()
      setReportStats(stats)
    } catch (error) {
      console.error('Erro ao buscar estatísticas de denúncias:', error)
    }
  }

  const updateReportStatus = async (reportId: string, status: string, notes?: string, resolution?: string) => {
    try {
      console.log('Atualizando denúncia:', { reportId, status })
      
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          status,
          notes,
          resolution
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar denúncia')
      }

      toast.success('Denúncia atualizada com sucesso')
      fetchReports()
      fetchReportStats()
    } catch (error) {
      console.error('Erro ao atualizar denúncia:', error)
      toast.error('Erro ao atualizar denúncia')
    }
  }

  const deleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/reports?id=${reportId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar denúncia')
      }

      toast.success('Denúncia deletada com sucesso')
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
      // Deletar uma por uma
      for (const reportId of selectedReports) {
        await deleteReport(reportId)
      }
      
      setSelectedReports([])
      setIsSelectMode(false)
      toast.success(`${selectedReports.length} denúncias deletadas`)
    } catch (error) {
      console.error('Erro ao deletar denúncias selecionadas:', error)
      toast.error('Erro ao deletar denúncias selecionadas')
    }
  }

  const banUser = async (userId: string) => {
    if (!banForm.reason.trim()) {
      toast.error('Preencha o motivo do banimento')
      return
    }

    try {
      // Implementar banimento via API
      toast.success('Usuário banido com sucesso')
      setShowBanModal(false)
      setBanForm({
        reason: '',
        ban_type: 'temporary',
        duration_days: 7,
        admin_notes: ''
      })
    } catch (error) {
      console.error('Erro ao banir usuário:', error)
      toast.error('Erro ao banir usuário')
    }
  }

  const clearSelection = () => {
    setSelectedReports([])
  }

  const handleReportAction = async (reportId: string, action: string) => {
    const report = reports.find(r => r.id === reportId)
    if (!report) return

    console.log('Ação solicitada:', action, 'para denúncia:', reportId)

    switch (action) {
      case 'review':
        await updateReportStatus(reportId, 'reviewing')
        break
      case 'resolve':
        await updateReportStatus(reportId, 'resolved')
        break
      case 'dismiss':
        await updateReportStatus(reportId, 'dismissed')
        break
      case 'delete':
        await deleteReport(reportId)
        break
      case 'ban':
        if (report.reported_user_id) {
          setShowBanModal(true)
        } else {
          toast.error('Não é possível banir: usuário não identificado')
        }
        break
      default:
        console.log('Ação não reconhecida:', action)
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />
      case 'post': return <FileText className="h-4 w-4" />
      case 'message': return <MessageCircle className="h-4 w-4" />
      case 'review': return <Flag className="h-4 w-4" />
      case 'classified': return <FileText className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user': return 'Usuário'
      case 'post': return 'Post'
      case 'message': return 'Mensagem'
      case 'review': return 'Avaliação'
      case 'classified': return 'Classificado'
      default: return 'Outro'
    }
  }

  const filteredReports = reports.filter(report => {
    if (filters.status !== 'all' && report.status !== filters.status) return false
    if (filters.type !== 'all' && report.type !== filters.type) return false
    if (filters.priority !== 'all' && report.priority !== filters.priority) return false
    if (filters.search && !report.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  useEffect(() => {
    fetchReports()
    fetchReportStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {reportStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{reportStats.total}</p>
                </div>
                <Flag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{reportStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolvidas</p>
                  <p className="text-2xl font-bold text-green-600">{reportStats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Últimas 24h</p>
                  <p className="text-2xl font-bold text-blue-600">{reportStats.last24h}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
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
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
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
              <Label htmlFor="type-filter">Tipo</Label>
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
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority-filter">Prioridade</Label>
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
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="search"
                  placeholder="Buscar por descrição..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações em lote */}
      {isSelectMode && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedReports.length} denúncia(s) selecionada(s)
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteSelectedReports}
                  disabled={selectedReports.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar Selecionadas
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSelectMode(false)
                  setSelectedReports([])
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de denúncias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Denúncias ({filteredReports.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSelectMode(!isSelectMode)
                  if (isSelectMode) {
                    setSelectedReports([])
                  }
                }}
              >
                {isSelectMode ? 'Cancelar Seleção' : 'Selecionar Múltiplas'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchReports()
                  fetchReportStats()
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma denúncia encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(report.type)}
                          <span className="font-medium">{getTypeLabel(report.type)}</span>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        
                        {/* Contexto específico baseado no tipo */}
                        {report.type === 'other' && report.conversation_messages && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-2">
                            <p className="text-xs font-medium text-blue-800 mb-1">💬 Conversa Denunciada:</p>
                            <div className="text-xs text-blue-700 max-h-20 overflow-y-auto">
                              {report.conversation_messages.slice(-3).map((msg, idx) => (
                                <div key={idx} className="mb-1">
                                  <strong>{msg.profiles.full_name}:</strong> {msg.content.substring(0, 100)}...
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {report.type === 'review' && report.review_details && (
                          <div className="bg-yellow-50 p-3 rounded-lg mb-2">
                            <p className="text-xs font-medium text-yellow-800 mb-1">⭐ Avaliação Denunciada:</p>
                            <div className="text-xs text-yellow-700">
                              <p><strong>Nota:</strong> {report.review_details.rating_person}/5</p>
                              <p><strong>Comentário:</strong> {report.review_details.comment}</p>
                            </div>
                          </div>
                        )}
                        
                        {report.reported_post && (
                          <div className="bg-green-50 p-3 rounded-lg mb-2">
                            <p className="text-xs font-medium text-green-800 mb-1">📝 Post Denunciado:</p>
                            <div className="text-xs text-green-700">
                              <p><strong>Título:</strong> {report.reported_post.title}</p>
                              <p><strong>Conteúdo:</strong> {report.reported_post.content.substring(0, 100)}...</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Denunciante: {report.reporter?.full_name || 'N/A'}</span>
                          <span>•</span>
                          <span>Denunciado: {report.reported_user?.full_name || 'N/A'}</span>
                          <span>•</span>
                          <span>{new Date(report.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isSelectMode && (
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(report.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedReports([...selectedReports, report.id])
                              } else {
                                setSelectedReports(selectedReports.filter(id => id !== report.id))
                              }
                            }}
                            className="rounded"
                          />
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report)
                            setShowReportModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Select onValueChange={(value) => handleReportAction(report.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Ações" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="review">Revisar</SelectItem>
                            <SelectItem value="resolve">Resolver</SelectItem>
                            <SelectItem value="dismiss">Dispensar</SelectItem>
                            {report.reported_user_id && (
                              <SelectItem value="ban">Banir Usuário</SelectItem>
                            )}
                            <SelectItem value="delete" className="text-red-600">
                              Deletar
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes da denúncia */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Denúncia</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm text-gray-600">{getTypeLabel(selectedReport.type)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prioridade</Label>
                  <Badge className={getPriorityColor(selectedReport.priority)}>
                    {selectedReport.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Criado em</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedReport.description}</p>
              </div>
              
              {selectedReport.reporter && (
                <div>
                  <Label className="text-sm font-medium">Denunciante</Label>
                  <p className="text-sm text-gray-600">
                    {selectedReport.reporter.full_name} ({selectedReport.reporter.email})
                  </p>
                </div>
              )}
              
              {selectedReport.reported_user && (
                <div>
                  <Label className="text-sm font-medium">Usuário Denunciado</Label>
                  <p className="text-sm text-gray-600">
                    {selectedReport.reported_user.full_name} ({selectedReport.reported_user.email})
                  </p>
                </div>
              )}
              
              {/* Conversa completa para denúncias de chat */}
              {selectedReport.conversation_messages && selectedReport.conversation_messages.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">💬 Conversa Completa</Label>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto mt-2">
                    {selectedReport.conversation_messages.map((msg, idx) => (
                      <div key={idx} className={`mb-3 p-2 rounded ${
                        msg.sender_id === selectedReport.reporter_id 
                          ? 'bg-blue-100 ml-8' 
                          : 'bg-gray-100 mr-8'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {msg.profiles.full_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Detalhes da avaliação */}
              {selectedReport.review_details && (
                <div>
                  <Label className="text-sm font-medium">⭐ Avaliação Denunciada</Label>
                  <div className="bg-yellow-50 p-4 rounded-lg mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Nota: {selectedReport.review_details.rating_person}/5</p>
                        <p className="text-sm font-medium">Avaliador: {selectedReport.review_details.profiles.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Data: {new Date(selectedReport.review_details.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Comentário:</p>
                      <p className="text-sm text-gray-600">{selectedReport.review_details.comment}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleReportAction(selectedReport.id, 'review')}
                  disabled={selectedReport.status === 'reviewing'}
                >
                  Marcar como Revisando
                </Button>
                <Button
                  onClick={() => handleReportAction(selectedReport.id, 'resolve')}
                  disabled={selectedReport.status === 'resolved'}
                >
                  Resolver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                  disabled={selectedReport.status === 'dismissed'}
                >
                  Dispensar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReportAction(selectedReport.id, 'delete')}
                >
                  Deletar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de banimento */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banir Usuário</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">Motivo do Banimento</Label>
              <Textarea
                id="ban-reason"
                value={banForm.reason}
                onChange={(e) => setBanForm({...banForm, reason: e.target.value})}
                placeholder="Descreva o motivo do banimento..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="ban-type">Tipo de Banimento</Label>
              <Select
                value={banForm.ban_type}
                onValueChange={(value: 'temporary' | 'permanent') => 
                  setBanForm({...banForm, ban_type: value})
                }
              >
                <SelectTrigger>
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
                <Label htmlFor="ban-duration">Duração (dias)</Label>
                <Input
                  id="ban-duration"
                  type="number"
                  value={banForm.duration_days}
                  onChange={(e) => setBanForm({...banForm, duration_days: parseInt(e.target.value)})}
                  min="1"
                  max="365"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="ban-notes">Notas Administrativas</Label>
              <Textarea
                id="ban-notes"
                value={banForm.admin_notes}
                onChange={(e) => setBanForm({...banForm, admin_notes: e.target.value})}
                placeholder="Notas internas sobre o banimento..."
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (selectedReport?.reported_user_id) {
                    banUser(selectedReport.reported_user_id)
                  }
                }}
                disabled={!banForm.reason.trim()}
              >
                Confirmar Banimento
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBanModal(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
