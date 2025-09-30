'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Ban, 
  UserX, 
  Shield, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  User,
  MessageCircle,
  Flag
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Ban {
  id: string
  user_id: string
  reason: string
  ban_type: 'temporary' | 'permanent'
  duration_days?: number
  is_active: boolean
  admin_notes?: string
  created_at: string
  updated_at?: string
  expires_at?: string
  profiles: {
    id: string
    full_name: string
    email: string
    user_type: string
    avatar_url?: string
  }
}

interface Investigation {
  user: {
    id: string
    full_name: string
    email: string
    user_type: string
    avatar_url?: string
  }
  reports: Array<{
    id: string
    report_type: string
    reason: string
    description: string
    status: string
    priority: string
    created_at: string
  }>
  total_reports: number
  pending_reports: number
  reviewing_reports: number
  last_report_date: string
}

export function BansManagementEnhanced() {
  const [activeTab, setActiveTab] = useState('investigations')
  const [bans, setBans] = useState<Ban[]>([])
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Investigation | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showUnbanModal, setShowUnbanModal] = useState(false)
  const [banToUnban, setBanToUnban] = useState<Ban | null>(null)
  const [banForm, setBanForm] = useState({
    reason: '',
    ban_type: 'temporary' as 'temporary' | 'permanent',
    duration_days: 7,
    admin_notes: ''
  })
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })

  const fetchBans = async () => {
    try {
      const response = await fetch('/api/admin/bans')
      if (!response.ok) throw new Error('Erro ao buscar banimentos')
      
      const { bans } = await response.json()
      setBans(bans)
    } catch (error) {
      console.error('Erro ao buscar banimentos:', error)
      toast.error('Erro ao carregar banimentos')
    }
  }

  const fetchInvestigations = async () => {
    try {
      const response = await fetch('/api/admin/investigations')
      if (!response.ok) throw new Error('Erro ao buscar investigações')
      
      const { investigations } = await response.json()
      setInvestigations(investigations)
    } catch (error) {
      console.error('Erro ao buscar investigações:', error)
      toast.error('Erro ao carregar investigações')
    }
  }

  const banUser = async (userId: string) => {
    if (!banForm.reason.trim()) {
      toast.error('Preencha o motivo do banimento')
      return
    }

    try {
      const response = await fetch('/api/admin/bans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          reason: banForm.reason,
          banType: banForm.ban_type,
          durationDays: banForm.duration_days,
          adminNotes: banForm.admin_notes
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao banir usuário')
      }

      toast.success('Usuário banido com sucesso')
      setShowBanModal(false)
      setBanForm({
        reason: '',
        ban_type: 'temporary',
        duration_days: 7,
        admin_notes: ''
      })
      fetchBans()
    } catch (error) {
      console.error('Erro ao banir usuário:', error)
      toast.error('Erro ao banir usuário')
    }
  }

  const revokeBan = async (banId: string) => {
    try {
      const response = await fetch('/api/admin/bans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banId,
          status: 'revoked',
          adminNotes: 'Banimento revogado pelo administrador'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao revogar banimento')
      }

      toast.success('Usuário desbanido com sucesso')
      setShowUnbanModal(false)
      setBanToUnban(null)
      fetchBans()
    } catch (error) {
      console.error('Erro ao revogar banimento:', error)
      toast.error('Erro ao desbanir usuário')
    }
  }

  const handleUnbanClick = (ban: Ban) => {
    setBanToUnban(ban)
    setShowUnbanModal(true)
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Ativo' : 'Desbanido'
  }

  const getBanTypeColor = (type: string) => {
    switch (type) {
      case 'permanent': return 'bg-red-100 text-red-800'
      case 'temporary': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBans = bans.filter(ban => {
    if (filters.status !== 'all') {
      if (filters.status === 'active' && !ban.is_active) return false
      if (filters.status === 'revoked' && ban.is_active) return false
    }
    if (filters.search && ban.profiles && !ban.profiles.full_name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const filteredInvestigations = investigations.filter(inv => {
    if (filters.search && !inv.user.full_name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  useEffect(() => {
    fetchBans()
    fetchInvestigations()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Banimentos</h2>
        <Button
          variant="outline"
          onClick={() => {
            fetchBans()
            fetchInvestigations()
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="expired">Expirados</SelectItem>
                  <SelectItem value="revoked">Revogados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nome..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="investigations" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Investigados ({filteredInvestigations.length})
          </TabsTrigger>
          <TabsTrigger value="bans" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Banidos ({filteredBans.length})
          </TabsTrigger>
          <TabsTrigger value="revoked" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Revogados ({bans.filter(b => !b.is_active).length})
          </TabsTrigger>
        </TabsList>

        {/* Aba de Investigados */}
        <TabsContent value="investigations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Usuários Investigados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInvestigations.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum usuário em investigação</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInvestigations.map((investigation) => (
                    <Card key={investigation.user.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{investigation.user.full_name}</span>
                              <Badge variant="outline">{investigation.user.user_type}</Badge>
                              <Badge className="bg-yellow-100 text-yellow-800">Em Investigação</Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{investigation.user.email}</p>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Total de Denúncias:</span>
                                <span className="ml-2 text-red-600">{investigation.total_reports}</span>
                              </div>
                              <div>
                                <span className="font-medium">Pendentes:</span>
                                <span className="ml-2 text-yellow-600">{investigation.pending_reports}</span>
                              </div>
                              <div>
                                <span className="font-medium">Em Revisão:</span>
                                <span className="ml-2 text-blue-600">{investigation.reviewing_reports}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Resumo das Denúncias:</p>
                              <div className="space-y-2">
                                {investigation.reports.slice(0, 3).map((report, idx) => (
                                  <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Flag className="h-3 w-3" />
                                      <span className="font-medium">{report.report_type}</span>
                                      <Badge className={report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                                        {report.status}
                                      </Badge>
                                    </div>
                                    <p className="text-gray-600">{report.description}</p>
                                  </div>
                                ))}
                                {investigation.reports.length > 3 && (
                                  <p className="text-xs text-gray-500">+{investigation.reports.length - 3} mais denúncias...</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(investigation)
                                setShowBanModal(true)
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Banir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Banidos */}
        <TabsContent value="bans">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Usuários Banidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredBans.length === 0 ? (
                <div className="text-center py-8">
                  <Ban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum usuário banido</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBans.map((ban) => (
                    <Card key={ban.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <UserX className="h-4 w-4" />
                              <span className="font-medium">{ban.profiles.full_name}</span>
                              <Badge variant="outline">{ban.profiles.user_type}</Badge>
                              <Badge className={getStatusColor(ban.is_active)}>
                                {getStatusText(ban.is_active)}
                              </Badge>
                              <Badge className={getBanTypeColor(ban.ban_type)}>
                                {ban.ban_type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{ban.profiles.email}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                              <div>
                                <span className="font-medium">Motivo:</span>
                                <span className="ml-2">{ban.reason}</span>
                              </div>
                              <div>
                                <span className="font-medium">Banido em:</span>
                                <span className="ml-2">{new Date(ban.created_at).toLocaleString()}</span>
                              </div>
                              {ban.expires_at && (
                                <div>
                                  <span className="font-medium">Expira em:</span>
                                  <span className="ml-2">{new Date(ban.expires_at).toLocaleString()}</span>
                                </div>
                              )}
                              {ban.duration_days && (
                                <div>
                                  <span className="font-medium">Duração:</span>
                                  <span className="ml-2">{ban.duration_days} dias</span>
                                </div>
                              )}
                            </div>
                            
                            {ban.admin_notes && (
                              <div className="bg-gray-50 p-2 rounded text-xs">
                                <span className="font-medium">Notas Administrativas:</span>
                                <p className="text-gray-600">{ban.admin_notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {ban.is_active && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnbanClick(ban)}
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Desbanir
                              </Button>
                            )}
                            {!ban.is_active && (
                              <Badge className="bg-green-100 text-green-800">
                                Desbanido
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Revogados */}
        <TabsContent value="revoked">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Banimentos Revogados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bans.filter(b => !b.is_active).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum banimento revogado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bans.filter(b => !b.is_active).map((ban) => (
                    <Card key={ban.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{ban.profiles.full_name}</span>
                              <Badge variant="outline">{ban.profiles.user_type}</Badge>
                              <Badge className="bg-green-100 text-green-800">Revogado</Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{ban.profiles.email}</p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Motivo Original:</span>
                                <span className="ml-2">{ban.reason}</span>
                              </div>
                              <div>
                                <span className="font-medium">Revogado em:</span>
                                <span className="ml-2">{new Date(ban.updated_at || ban.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Banimento */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Banir Usuário</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Usuário: {selectedUser.user.full_name}</h3>
                <p className="text-sm text-yellow-700">Email: {selectedUser.user.email}</p>
                <p className="text-sm text-yellow-700">Total de Denúncias: {selectedUser.total_reports}</p>
              </div>
              
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
                    if (selectedUser.user.id) {
                      banUser(selectedUser.user.id)
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
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação para Desbanir */}
      <Dialog open={showUnbanModal} onOpenChange={setShowUnbanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Desbanir Usuário
            </DialogTitle>
          </DialogHeader>
          
          {banToUnban && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">
                  Usuário: {banToUnban.profiles?.full_name}
                </h3>
                <p className="text-sm text-green-700">Email: {banToUnban.profiles?.email}</p>
                <p className="text-sm text-green-700">
                  Banido em: {new Date(banToUnban.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-green-700">
                  Motivo: {banToUnban.reason}
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  ⚠️ Confirmação Necessária
                </p>
                <p className="text-sm text-yellow-700">
                  Tem certeza que deseja desbanir este usuário? 
                  Ele terá acesso completo ao sistema novamente.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (banToUnban.id) {
                      revokeBan(banToUnban.id)
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Desbanimento
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUnbanModal(false)
                    setBanToUnban(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
