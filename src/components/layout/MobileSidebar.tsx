'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  Briefcase, 
  Calendar,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Info,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications'
import { createContext, useContext } from 'react'

interface MobileSidebarProps {
  children: React.ReactNode
}

// Context para compartilhar a função de abrir sidebar
interface MobileSidebarContextType {
  openSidebar: () => void
}

const MobileSidebarContext = createContext<MobileSidebarContextType | undefined>(undefined)

export const useMobileSidebar = () => {
  const context = useContext(MobileSidebarContext)
  if (!context) {
    throw new Error('useMobileSidebar must be used within MobileSidebar')
  }
  return context
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sidebarX, setSidebarX] = useState(0)
  const { profile, signOut, user } = useAuthContext()
  const { unreadCount } = useSupabaseNotifications()
  const router = useRouter()
  const pathname = usePathname()

  // Fechar sidebar ao mudar de rota
  useEffect(() => {
    setIsOpen(false)
    setSidebarX(0)
  }, [pathname])

  // Fechar sidebar ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSidebarX(0)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevenir scroll do body quando sidebar está aberta
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Gestos de drag para fechar a sidebar
  const bindDrag = useDrag(
    ({ movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
      if (mx < -50 || (xDir < 0 && vx > 0.5)) {
        setIsOpen(false)
        setSidebarX(0)
        cancel()
      } else {
        setSidebarX(mx)
      }
    },
    {
      from: () => [sidebarX, 0],
      filterTaps: true,
      bounds: { left: -320, right: 0 },
      rubberband: true
    }
  )

  const handleLogout = async () => {
    try {
      setIsOpen(false)
      setSidebarX(0)
      window.location.href = '/logout'
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  const navigationItems = [
    {
      label: 'Home',
      href: '/home',
      icon: <Home className="h-5 w-5" />,
      badge: null
    },
    {
      label: 'Feed Social',
      href: '/feed',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: null
    },
    {
      label: 'Buscar',
      href: '/buscar',
      icon: <Search className="h-5 w-5" />,
      badge: null
    },
    {
      label: 'Classificados',
      href: '/classificados',
      icon: <Briefcase className="h-5 w-5" />,
      badge: null
    },
    {
      label: 'Mensagens',
      href: '/mensagens',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      label: 'Notificações',
      href: '/notificacoes',
      icon: <Bell className="h-5 w-5" />,
      badge: unreadCount > 0 ? unreadCount : null
    }
  ]

  const professionalItems = profile?.user_type === 'professional' ? [
    {
      label: 'Agenda',
      href: '/agenda',
      icon: <Calendar className="h-5 w-5" />,
      badge: null
    },
    {
      label: 'Meus Serviços',
      href: '/dashboard-profissional',
      icon: <Briefcase className="h-5 w-5" />,
      badge: null
    }
  ] : []

  const accountItems = [
    {
      label: 'Editar Perfil',
      href: '/editarperfil',
      icon: <User className="h-5 w-5" />,
      badge: null
    },
    {
      label: 'Configurações',
      href: '/configuracoes',
      icon: <Settings className="h-5 w-5" />,
      badge: null
    },
    {
      label: 'Central de Ajuda',
      href: '/ajuda',
      icon: <HelpCircle className="h-5 w-5" />,
      badge: null
    },
    {
      label: 'Sobre',
      href: '/sobre',
      icon: <Info className="h-5 w-5" />,
      badge: null
    }
  ]

  // Função para abrir a sidebar (será passada para o MobileHeader)
  const openSidebar = () => {
    setIsOpen(true)
    setSidebarX(0)
  }

  return (
    <>
      {/* Overlay com AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => {
              setIsOpen(false)
              setSidebarX(0)
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar com Framer Motion */}
      <div {...bindDrag()}>
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: isOpen ? 0 : '-100%' }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 200,
            mass: 0.8
          }}
          className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 border-b border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white font-bold text-sm">C</span>
                </motion.div>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg font-bold text-gray-900"
                >
                  ConfiLar
                </motion.span>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2"
                  onClick={() => {
                    setIsOpen(false)
                    setSidebarX(0)
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto">
              {/* Perfil do Usuário */}
              {user && profile && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 border-b border-gray-100 bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <UserAvatar
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Usuário'}
                        fallback={profile.full_name?.charAt(0) || 'U'}
                        size="md"
                      />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {profile.full_name || 'Usuário'}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {profile.user_type === 'professional' ? 'Profissional' : 'Cliente'}
                      </Badge>
                    </div>
                    <NotificationBell />
                  </div>
                </motion.div>
              )}

              {/* Navegação Principal */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4"
              >
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navegação
                </h3>
                <nav className="space-y-1">
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setIsOpen(false)
                          setSidebarX(0)
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5 + index * 0.05, type: 'spring' }}
                            >
                              <Badge className="bg-red-500 text-white text-xs">
                                {item.badge}
                              </Badge>
                            </motion.div>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </motion.div>

              {/* Itens Profissionais */}
              {professionalItems.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="px-4"
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Profissional
                  </h3>
                  <nav className="space-y-1">
                    {professionalItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pathname === item.href
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setIsOpen(false)
                            setSidebarX(0)
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </Link>
                      </motion.div>
                    ))}
                  </nav>
                </motion.div>
              )}

              {/* Conta */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="px-4 mt-6"
              >
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Conta
                </h3>
                <nav className="space-y-1">
                  {accountItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setIsOpen(false)
                          setSidebarX(0)
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </motion.div>
            </div>

            {/* Footer */}
            {user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 border-t border-gray-200"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair da Conta
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Conteúdo Principal com Context */}
      <MobileSidebarContext.Provider value={{ openSidebar }}>
        {children}
      </MobileSidebarContext.Provider>
    </>
  )
}
