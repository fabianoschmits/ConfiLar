'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { MainLayout } from '@/components/layout/MainLayout'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Shield, 
  AlertTriangle,
  BarChart3,
  Bell,
  Settings,
  Database,
  Clock,
  Activity,
  MessageSquare,
  Image,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Visão Geral', icon: LayoutDashboard, description: 'Resumo completo do sistema' },
  { href: '/admin/dashboard/users', label: 'Usuários', icon: Users, description: 'Gerenciar usuários' },
  { href: '/admin/dashboard/posts', label: 'Posts & Conteúdo', icon: FileText, description: 'Gerenciar posts e conteúdo' },
  { href: '/admin/dashboard/moderation', label: 'Moderação', icon: Shield, description: 'Denúncias e banimentos' },
  { href: '/admin/dashboard/cron', label: 'Cron Jobs', icon: Clock, description: 'Tarefas agendadas' },
  { href: '/admin/dashboard/analytics', label: 'Analytics', icon: BarChart3, description: 'Gráficos e estatísticas' },
  { href: '/admin/dashboard/system', label: 'Sistema', icon: Settings, description: 'Configurações do sistema' },
  { href: '/admin/dashboard/logs', label: 'Logs', icon: Activity, description: 'Logs e monitoramento' },
]

export default function AdminDashboardLayout({
  children
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  // Determinar qual aba está ativa baseado na rota
  const getActiveTab = () => {
    if (pathname === '/admin/dashboard') return '/admin/dashboard'
    if (pathname.startsWith('/admin/dashboard/posts')) return '/admin/dashboard/posts'
    if (pathname.startsWith('/admin/dashboard/moderation')) return '/admin/dashboard/moderation'
    if (pathname.startsWith('/admin/dashboard/cron')) return '/admin/dashboard/cron'
    if (pathname.startsWith('/admin/dashboard/analytics')) return '/admin/dashboard/analytics'
    if (pathname.startsWith('/admin/dashboard/system')) return '/admin/dashboard/system'
    if (pathname.startsWith('/admin/dashboard/logs')) return '/admin/dashboard/logs'
    if (pathname.startsWith('/admin/dashboard/users')) return '/admin/dashboard/users'
    if (pathname.startsWith('/admin/dashboard/reports')) return '/admin/dashboard/moderation'
    if (pathname.startsWith('/admin/dashboard/bans')) return '/admin/dashboard/moderation'
    if (pathname.startsWith('/admin/dashboard/notifications')) return '/admin/dashboard/system'
    if (pathname.startsWith('/admin/dashboard/stats')) return '/admin/dashboard/analytics'
    return pathname
  }

  const activeTab = getActiveTab()

  return (
    <MainLayout requireAuth={true}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          {/* Header com Abas no Topo */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
            <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
              <div className="flex items-center justify-between h-14 sm:h-16">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">Painel Administrativo</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">ConfiLar Admin Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Abas de Navegação */}
            <div className="px-3 sm:px-4 lg:px-6 xl:px-8 border-t border-gray-200 dark:border-gray-800">
              <nav className="flex space-x-1 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0",
                        isActive
                          ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                          : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                      title={item.description}
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden">{item.label.split(' ')[0]}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
            {children}
          </main>
        </div>
      </AdminGuard>
    </MainLayout>
  )
}
