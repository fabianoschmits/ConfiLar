'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

interface AdminUser {
  id: string
  user_id: string
  role: 'admin' | 'super_admin'
  permissions: {
    view_reports: boolean
    manage_reports: boolean
    view_analytics: boolean
    manage_users: boolean
    system_settings?: boolean
  }
  is_active: boolean
  created_at: string
}

interface AdminState {
  isAdmin: boolean
  isSuperAdmin: boolean
  adminUser: AdminUser | null
  loading: boolean
  error: string | null
}

export function useAdmin() {
  const { user } = useAuthContext()
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isSuperAdmin: false,
    adminUser: null,
    loading: true,
    error: null
  })

  const checkAdminStatus = async () => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        isAdmin: false,
        isSuperAdmin: false,
        adminUser: null,
        loading: false,
        error: null
      }))
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Verificar se o usuário é administrador
      let adminData = null
      const { data, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      // Tratar erros 406 (Not Acceptable) e 403 (Forbidden) como "não é admin"
      if (adminError) {
        // PGRST116 = nenhuma linha retornada (usuário não é admin)
        // 406 = Not Acceptable (RLS ou formato)
        // 403 = Forbidden (sem permissão)
        // Não logar esses erros - são esperados quando a tabela não existe ou há RLS
        const isExpectedError = adminError.code === 'PGRST116' || 
            adminError.code === 'PGRST301' ||
            adminError.message?.includes('406') ||
            adminError.message?.includes('403') ||
            adminError.message?.includes('Not Acceptable') ||
            adminError.message?.includes('Forbidden') ||
            adminError.message?.includes('relation') ||
            adminError.message?.includes('does not exist')
        
        if (!isExpectedError) {
          // Apenas logar erros inesperados
          console.warn('Erro inesperado ao verificar status de administrador:', adminError)
        }
        // Silenciar erros esperados - usuário não é admin, não é erro
      } else {
        adminData = data
      }

      const isAdmin = !!adminData
      const isSuperAdmin = adminData?.role === 'super_admin'

      setState({
        isAdmin,
        isSuperAdmin,
        adminUser: adminData,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Erro ao verificar status de administrador:', error)
      setState(prev => ({
        ...prev,
        isAdmin: false,
        isSuperAdmin: false,
        adminUser: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }

  useEffect(() => {
    checkAdminStatus()
  }, [user?.id])

  const refreshAdminStatus = () => {
    checkAdminStatus()
  }

  return {
    ...state,
    refreshAdminStatus
  }
}

// Hook específico para verificar apenas se é admin
export function useIsAdmin() {
  const { isAdmin, loading } = useAdmin()
  return { isAdmin, loading }
}

// Hook específico para verificar se é super admin
export function useIsSuperAdmin() {
  const { isSuperAdmin, loading } = useAdmin()
  return { isSuperAdmin, loading }
}
