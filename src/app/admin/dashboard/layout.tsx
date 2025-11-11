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
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/admin/dashboard/users', label: 'Usuários', icon: Users },
  { href: '/admin/dashboard/reports', label: 'Denúncias', icon: AlertTriangle },
  { href: '/admin/dashboard/bans', label: 'Banimentos', icon: Shield },
  { href: '/admin/dashboard/logs', label: 'Logs', icon: FileText },
  { href: '/admin/dashboard/analytics', label: 'Gráficos', icon: BarChart3 },
]

export default function AdminDashboardLayout({
  children
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <MainLayout requireAuth={true}>
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          <div className="flex">
            {/* Sidebar de Navegação */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin
                </h2>
              </div>
              
              <nav className="p-2">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminGuard>
    </MainLayout>
  )
}

