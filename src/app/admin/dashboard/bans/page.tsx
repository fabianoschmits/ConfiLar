'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SimpleTable } from '@/components/admin/shared/SimpleTable'
import { SearchBar } from '@/components/admin/shared/SearchBar'
import { PageHeader } from '@/components/admin/shared/PageHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { toast } from 'sonner'

interface Ban {
  id: string
  user_id: string
  reason: string
  ban_type: string
  duration_days?: number
  is_active: boolean
  created_at: string
  expires_at?: string
  profiles: {
    full_name: string
    email: string
  }
}

export default function AdminBansPage() {
  const [bans, setBans] = useState<Ban[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showBanModal, setShowBanModal] = useState(false)
  const [banForm, setBanForm] = useState({
    user_id: '',
    reason: '',
    ban_type: 'temporary' as 'temporary' | 'permanent',
    duration_days: 7
  })

  useEffect(() => {
    fetchBans()
  }, [statusFilter])

  const fetchBans = async () => {
    setLoading(true)
    try {
      // Verificar se a tabela bans existe, se não, usar tabela alternativa ou criar
      let query = supabase
        .from('bans')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter === 'active') {
        query = query.eq('is_active', true)
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false)
      }

      const { data: bansData, error } = await query

      if (error) {
        // Se a tabela não existir, retornar array vazio
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.warn('Tabela bans não existe ainda')
          setBans([])
          return
        }
        throw error
      }

      // Buscar dados dos usuários separadamente
      const bansWithUsers = await Promise.all(
        (bansData || []).map(async (ban) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', ban.user_id)
            .single()

          return {
            ...ban,
            profiles: profile || { full_name: 'Usuário não encontrado', email: '' }
          }
        })
      )

      setBans(bansWithUsers)
    } catch (error) {
      console.error('Erro ao buscar banimentos:', error)
      toast.error('Erro ao carregar banimentos')
    } finally {
      setLoading(false)
    }
  }

  const createBan = async () => {
    try {
      const { error } = await supabase
        .from('bans')
        .insert({
          user_id: banForm.user_id,
          reason: banForm.reason,
          ban_type: banForm.ban_type,
          duration_days: banForm.ban_type === 'temporary' ? banForm.duration_days : null,
          is_active: true
        })

      if (error) throw error
      toast.success('Usuário banido com sucesso')
      setShowBanModal(false)
      setBanForm({ user_id: '', reason: '', ban_type: 'temporary', duration_days: 7 })
      fetchBans()
    } catch (error) {
      console.error('Erro ao banir usuário:', error)
      toast.error('Erro ao banir usuário')
    }
  }

  const unbanUser = async (banId: string) => {
    try {
      const { error } = await supabase
        .from('bans')
        .update({ is_active: false })
        .eq('id', banId)

      if (error) throw error
      toast.success('Usuário desbanido')
      fetchBans()
    } catch (error) {
      console.error('Erro ao desbanir usuário:', error)
      toast.error('Erro ao desbanir usuário')
    }
  }

  const columns = [
    {
      key: 'user',
      label: 'Usuário',
      render: (ban: Ban) => (
        <div>
          <div className="font-medium">{ban.profiles.full_name || ban.profiles.email}</div>
          <div className="text-xs text-gray-500">{ban.profiles.email}</div>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Motivo',
      render: (ban: Ban) => <span className="truncate max-w-xs">{ban.reason}</span>
    },
    {
      key: 'ban_type',
      label: 'Tipo',
      render: (ban: Ban) => (
        <Badge variant={ban.ban_type === 'permanent' ? 'destructive' : 'default'}>
          {ban.ban_type === 'permanent' ? 'Permanente' : `Temporário (${ban.duration_days}d)`}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (ban: Ban) => (
        <Badge variant={ban.is_active ? 'destructive' : 'outline'}>
          {ban.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Data',
      render: (ban: Ban) => new Date(ban.created_at).toLocaleDateString('pt-BR')
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (ban: Ban) => (
        <div className="flex gap-2">
          <Link
            href={`/perfil/${ban.user_id}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
          >
            Ver perfil
          </Link>
          {ban.is_active && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => unbanUser(ban.id)}
              className="text-xs"
            >
              Desbanir
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div>
      <PageHeader 
        title="Banimentos" 
        onRefresh={fetchBans} 
        loading={loading}
        actions={
          <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
            <DialogTrigger asChild>
              <Button>Banir Usuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Banir Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>ID do Usuário</Label>
                  <Input
                    value={banForm.user_id}
                    onChange={(e) => setBanForm({ ...banForm, user_id: e.target.value })}
                    placeholder="UUID do usuário"
                  />
                </div>
                <div>
                  <Label>Motivo</Label>
                  <Textarea
                    value={banForm.reason}
                    onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                    placeholder="Motivo do banimento"
                  />
                </div>
                <div>
                  <Label>Tipo de Banimento</Label>
                  <Select
                    value={banForm.ban_type}
                    onValueChange={(value: 'temporary' | 'permanent') => 
                      setBanForm({ ...banForm, ban_type: value })
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
                    <Label>Duração (dias)</Label>
                    <Input
                      type="number"
                      value={banForm.duration_days}
                      onChange={(e) => setBanForm({ ...banForm, duration_days: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                )}
                <Button onClick={createBan} className="w-full">
                  Banir Usuário
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={fetchBans}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SimpleTable
        columns={columns}
        data={bans}
        loading={loading}
        emptyMessage="Nenhum banimento encontrado"
      />
    </div>
  )
}

