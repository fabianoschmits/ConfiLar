'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  UserX, 
  Clock, 
  AlertTriangle, 
  Shield, 
  RefreshCw,
  Search,
  Filter,
  Ban,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Mail,
  Flag,
  Eye
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface BanInfo {
  id: string
  user_id: string
  banned_by: string
  reason: string
  ban_type: 'temporary' | 'permanent' | 'pending'
  duration_days?: number
  expires_at?: string
  admin_notes?: string
  related_report_id?: string
  created_at: string
  updated_at: string
  banned_user_name: string
  banned_user_email: string
  banned_user_type: string
  banned_by_name: string
  banned_by_email: string
  report_type?: string
  report_description?: string
  ban_status: 'Permanente' | 'Ativo' | 'Expirado' | 'Pendente'
  days_remaining?: number
}

interface BanStats {
  total_bans: number
  active_bans: number
  permanent_bans: number
  temporary_bans: number
  expired_bans: number
  bans_last_30_days: number
}

export function BansManagement() {
  const [bans, setBans] = useState<BanInfo[]>([])
  const [banStats, setBanStats] = useState<BanStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBan, setSelectedBan] = useState<BanInfo | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showUnbanModal, setShowUnbanModal] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  })
  const [banForm, setBanForm] = useState({
    user_id: '',
    reason: '',
    ban_type: 'temporary' as 'temporary' | 'permanent',
    duration_days: 7,
    admin_notes: ''
  })
  const [unbanNotes, setUnbanNotes] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    final_ban_type: 'temporary' as 'temporary' | 'permanent',
    duration_days: 7,
    admin_notes: ''
  })

  const fetchBans = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('active_bans_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar banimentos:', error)
        toast.error('Erro ao carregar banimentos')
        return
      }

      setBans(data || [])
    } catch (error) {
      console.error('Erro ao buscar banimentos:', error)
      toast.error('Erro ao carregar banimentos')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBanStats = async () => {
    try {
      // Total de banimentos
      const { count: totalBans } = await supabase
        .from('user_bans')
        .select('*', { count: 'exact' })

      // Banimentos ativos
      const { count: activeBans } = await supabase
        .from('user_bans')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Banimentos permanentes
      const { count: permanentBans } = await supabase
        .from('user_bans')
        .select('*', { count: 'exact' })
        .eq('ban_type', 'permanent')
        .eq('is_active', true)

      // Banimentos temporários
      const { count: temporaryBans } = await supabase
        .from('user_bans')
        .select('*', { count: 'exact' })
        .eq('ban_type', 'temporary')
        .eq('is_active', true)

      // Banimentos expirados
      const { count: expiredBans } = await supabase
        .from('user_bans')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .lt('expires_at', new Date().toISOString())

      // Banimentos dos últimos 30 dias
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count: bansLast30Days } = await supabase
        .from('user_bans')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo)

      setBanStats({
        total_bans: totalBans || 0,
        active_bans: activeBans || 0,
        permanent_bans: permanentBans || 0,
        temporary_bans: temporaryBans || 0,
        expired_bans: expiredBans || 0,
        bans_last_30_days: bansLast30Days || 0
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas de banimentos:', error)
    }
  }

  const banUser = async () => {
    if (!banForm.user_id || !banForm.reason) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const { data, error } = await supabase.rpc('ban_user', {
        target_user_id: banForm.user_id,
        ban_reason: banForm.reason,
        ban_type: banForm.ban_type,
        duration_days: banForm.ban_type === 'temporary' ? banForm.duration_days : null,
        admin_notes: banForm.admin_notes || null
      })

      if (error) {
        console.error('Erro ao banir usuário:', error)
        toast.error('Erro ao banir usuário')
        return
      }

      toast.success('Usuário banido com sucesso!')
      setShowBanModal(false)
      setBanForm({
        user_id: '',
        reason: '',
        ban_type: 'temporary',
        duration_days: 7,
        admin_notes: ''
      })
      fetchBans()
      fetchBanStats()
    } catch (error) {
      console.error('Erro ao banir usuário:', error)
      toast.error('Erro ao banir usuário')
    }
  }

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('unban_user', {
        target_user_id: userId,
        admin_notes: unbanNotes || null
      })

      if (error) {
        console.error('Erro ao desbanir usuário:', error)
        toast.error('Erro ao desbanir usuário')
        return
      }

      toast.success('Usuário desbanido com sucesso!')
      setShowUnbanModal(false)
      setUnbanNotes('')
      fetchBans()
      fetchBanStats()
    } catch (error) {
      console.error('Erro ao desbanir usuário:', error)
      toast.error('Erro ao desbanir usuário')
    }
  }

  const approvePendingBan = async (banId: string) => {
    try {
      const { error } = await supabase.rpc('approve_pending_ban', {
        ban_id: banId,
        final_ban_type: reviewForm.final_ban_type,
        duration_days: reviewForm.final_ban_type === 'temporary' ? reviewForm.duration_days : null,
        admin_notes: reviewForm.admin_notes || null
      })

      if (error) {
        console.error('Erro ao aprovar banimento:', error)
        toast.error('Erro ao aprovar banimento')
        return
      }

      toast.success('Banimento aprovado com sucesso!')
      setShowReviewModal(false)
      setReviewForm({
        final_ban_type: 'temporary',
        duration_days: 7,
        admin_notes: ''
      })
      fetchBans()
      fetchBanStats()
    } catch (error) {
      console.error('Erro ao aprovar banimento:', error)
      toast.error('Erro ao aprovar banimento')
    }
  }

  const rejectPendingBan = async (banId: string) => {
    try {
      const { error } = await supabase.rpc('reject_pending_ban', {
        ban_id: banId,
        admin_notes: reviewForm.admin_notes || null
      })

      if (error) {
        console.error('Erro ao rejeitar banimento:', error)
        toast.error('Erro ao rejeitar banimento')
        return
      }

      toast.success('Banimento rejeitado com sucesso!')
      setShowReviewModal(false)
      setReviewForm({
        final_ban_type: 'temporary',
        duration_days: 7,
        admin_notes: ''
      })
      fetchBans()
      fetchBanStats()
    } catch (error) {
      console.error('Erro ao rejeitar banimento:', error)
      toast.error('Erro ao rejeitar banimento')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Permanente': return 'bg-red-100 text-red-800'
      case 'Ativo': return 'bg-orange-100 text-orange-800'
      case 'Pendente': return 'bg-yellow-100 text-yellow-800'
      case 'Expirado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'permanent': return 'bg-red-100 text-red-800'
      case 'temporary': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBans = bans.filter(ban => {
    if (filters.status !== 'all' && ban.ban_status !== filters.status) return false
    if (filters.type !== 'all' && ban.ban_type !== filters.type) return false
    if (filters.search && !ban.banned_user_name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !ban.banned_user_email.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  useEffect(() => {
    fetchBans()
    fetchBanStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Banimentos</h2>
          <p className="text-sm text-gray-600">
            Gerencie banimentos de usuários baseados em denúncias
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowBanModal(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <UserX className="h-4 w-4 mr-2" />
            Banir Usuário
          </Button>
          <Button onClick={() => { fetchBans(); fetchBanStats(); }} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {banStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{banStats.total_bans}</p>
                </div>
                <Ban className="h-6 w-6 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-orange-600">{banStats.active_bans}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Permanentes</p>
                  <p className="text-2xl font-bold text-red-600">{banStats.permanent_bans}</p>
                </div>
                <Shield className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Temporários</p>
                  <p className="text-2xl font-bold text-yellow-600">{banStats.temporary_bans}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expirados</p>
                  <p className="text-2xl font-bold text-gray-600">{banStats.expired_bans}</p>
                </div>
                <XCircle className="h-6 w-6 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Últimos 30 dias</p>
                  <p className="text-2xl font-bold text-blue-600">{banStats.bans_last_30_days}</p>
                </div>
                <Calendar className="h-6 w-6 text-blue-500" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Permanente">Permanente</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Expirado">Expirado</SelectItem>
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="permanent">Permanente</SelectItem>
                  <SelectItem value="temporary">Temporário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Banimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Banimentos ({filteredBans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBans.map((ban) => (
              <Card key={ban.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <h3 className="font-semibold text-lg">{ban.banned_user_name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {ban.banned_user_email}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(ban.ban_status)}`}>
                          {ban.ban_status}
                        </Badge>
                        <Badge className={`${getTypeColor(ban.ban_type)}`}>
                          {ban.ban_type === 'permanent' ? 'Permanente' : 'Temporário'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Motivo:</strong> {ban.reason}
                          </p>
                          {ban.admin_notes && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Notas do Admin:</strong> {ban.admin_notes}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Banido por:</strong> {ban.banned_by_name}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Data:</strong> {new Date(ban.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          {ban.expires_at && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Expira em:</strong> {new Date(ban.expires_at).toLocaleDateString('pt-BR')}
                              {ban.days_remaining && ban.days_remaining > 0 && (
                                <span className="ml-2 text-orange-600">
                                  ({ban.days_remaining} dias restantes)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {ban.related_report_id && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            Denúncia Relacionada
                          </h4>
                          <p className="text-blue-800 text-sm">
                            <strong>Tipo:</strong> {ban.report_type} | 
                            <strong> Descrição:</strong> {ban.report_description?.substring(0, 100)}...
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {ban.ban_type === 'pending' ? (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedBan(ban)
                              setShowReviewModal(true)
                            }}
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Revisar
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedBan(ban)
                            setShowUnbanModal(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Desbanir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredBans.length === 0 && (
              <div className="text-center py-8">
                <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum banimento encontrado
                </h3>
                <p className="text-gray-500">
                  Não há banimentos que correspondam aos filtros aplicados.
                </p>
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
            <div>
              <Label htmlFor="user_id" className="text-sm font-medium">
                ID do Usuário *
              </Label>
              <Input
                id="user_id"
                placeholder="UUID do usuário"
                value={banForm.user_id}
                onChange={(e) => setBanForm({...banForm, user_id: e.target.value})}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Motivo do Banimento *
              </Label>
              <Textarea
                id="reason"
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
                <strong>Atenção:</strong> Esta ação é irreversível. O usuário será banido imediatamente.
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
                onClick={banUser}
                disabled={!banForm.user_id || !banForm.reason}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Banir Usuário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Desbanir Usuário */}
      <Dialog open={showUnbanModal} onOpenChange={setShowUnbanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Desbanir Usuário
            </DialogTitle>
          </DialogHeader>

          {selectedBan && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Usuário: {selectedBan.banned_user_name}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Motivo do banimento: {selectedBan.reason}
                </p>
              </div>

              <div>
                <Label htmlFor="unban_notes" className="text-sm font-medium">
                  Motivo do Desbanimento
                </Label>
                <Textarea
                  id="unban_notes"
                  placeholder="Explique por que o usuário está sendo desbanido..."
                  value={unbanNotes}
                  onChange={(e) => setUnbanNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  O usuário será desbanido e poderá acessar a plataforma novamente.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUnbanModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => unbanUser(selectedBan.user_id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Desbanir Usuário
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Revisar Banimento Pendente */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              Revisar Banimento Pendente
            </DialogTitle>
          </DialogHeader>

          {selectedBan && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Usuário: {selectedBan.banned_user_name}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Motivo: {selectedBan.reason}
                </p>
                {selectedBan.report_description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-1">Descrição da Denúncia:</h5>
                    <p className="text-sm text-gray-700">{selectedBan.report_description}</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="final_ban_type" className="text-sm font-medium">
                  Decisão Final
                </Label>
                <Select 
                  value={reviewForm.final_ban_type} 
                  onValueChange={(value: 'temporary' | 'permanent') => setReviewForm({...reviewForm, final_ban_type: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporary">Banimento Temporário</SelectItem>
                    <SelectItem value="permanent">Banimento Permanente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reviewForm.final_ban_type === 'temporary' && (
                <div>
                  <Label htmlFor="duration_days" className="text-sm font-medium">
                    Duração (dias)
                  </Label>
                  <Input
                    id="duration_days"
                    type="number"
                    min="1"
                    max="365"
                    value={reviewForm.duration_days}
                    onChange={(e) => setReviewForm({...reviewForm, duration_days: parseInt(e.target.value) || 7})}
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
                  placeholder="Adicione suas observações sobre a decisão..."
                  value={reviewForm.admin_notes}
                  onChange={(e) => setReviewForm({...reviewForm, admin_notes: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Decisão Final:</strong> Escolha se o usuário deve ser banido ou se a denúncia não tem fundamento.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => rejectPendingBan(selectedBan.id)}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
                <Button
                  onClick={() => approvePendingBan(selectedBan.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
