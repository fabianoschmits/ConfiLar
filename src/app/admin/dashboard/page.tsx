'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, TrendingUp, MessageCircle, AlertTriangle } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalPosts: 0,
    totalReports: 0,
    loading: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Novos usuários hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Total de posts
      const { count: totalPosts } = await supabase
        .from('feed_posts')
        .select('*', { count: 'exact', head: true })

      // Total de denúncias
      const { count: totalReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        totalPosts: totalPosts || 0,
        totalReports: totalReports || 0,
        loading: false
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Visão Geral
      </h1>

      {stats.loading ? (
        <div className="text-center py-12 text-gray-500">
          Carregando...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Novos Hoje</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newUsersToday}</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPosts}</p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Denúncias</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReports}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ações Rápidas
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Use o menu lateral para acessar as diferentes seções do painel administrativo.</p>
        </div>
      </div>
    </div>
  )
}
