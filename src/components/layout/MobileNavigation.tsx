'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X, Home, Search, User, MessageSquare, FileText, Star, Settings, LogOut, HelpCircle } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuthContext()

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    router.push('/')
  }

  const navigationItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Search, label: 'Buscar', path: '/buscar' },
    { icon: FileText, label: 'Classificados', path: '/classificados' },
    { icon: Star, label: 'Reputação', path: '/reputacao' },
    { icon: MessageSquare, label: 'Mensagens', path: '/mensagens' },
  ]

  const userItems = [
    { icon: User, label: 'Meu Perfil', path: '/perfil' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold">ConfiLar</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start h-12 text-base"
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User Section */}
          {user ? (
            <div className="p-4 border-t space-y-2">
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Logado como: {user.email}
              </div>
              
              {userItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start h-12 text-base"
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </Button>
            </div>
          ) : (
            <div className="p-4 border-t space-y-3">
              <Button
                className="w-full h-12"
                onClick={() => handleNavigation('/auth')}
              >
                Entrar
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => handleNavigation('/auth')}
              >
                Criar Conta
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

