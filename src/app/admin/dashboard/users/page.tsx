'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SimpleTable } from '@/components/admin/shared/SimpleTable'
import { SearchBar } from '@/components/admin/shared/SearchBar'
import { PageHeader } from '@/components/admin/shared/PageHeader'
import Link from 'next/link'

interface User {
  id: string
  full_name: string
  email: string
  user_type: string
  is_verified: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, user_type, is_verified, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Nome',
      render: (user: User) => user.full_name || 'Sem nome'
    },
    {
      key: 'email',
      label: 'Email',
      render: (user: User) => user.email
    },
    {
      key: 'user_type',
      label: 'Tipo',
      render: (user: User) => user.user_type === 'professional' ? 'Profissional' : 'Cliente'
    },
    {
      key: 'is_verified',
      label: 'Status',
      render: (user: User) => (
        user.is_verified ? (
          <span className="text-green-600 dark:text-green-400">Verificado</span>
        ) : (
          <span className="text-gray-500">Não verificado</span>
        )
      )
    },
    {
      key: 'created_at',
      label: 'Cadastro',
      render: (user: User) => new Date(user.created_at).toLocaleDateString('pt-BR')
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (user: User) => (
        <Link
          href={`/perfil/${user.id}`}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Ver perfil
        </Link>
      )
    }
  ]

  return (
    <div>
      <PageHeader title="Usuários" onRefresh={fetchUsers} loading={loading} />
      <SearchBar
        placeholder="Buscar por nome ou email..."
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={fetchUsers}
      />
      <SimpleTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="Nenhum usuário encontrado"
      />
    </div>
  )
}
