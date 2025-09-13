'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useNavigationWithLoading } from '@/hooks/useLoading'
import { NavigationLink } from '@/components/ui/NavigationLink'
import { cn } from '@/lib/utils'

// Tabler Icons - Estilo Brutalista
import {
  IconHome,
  IconSearch,
  IconChartBar,
  IconBriefcase
} from '@tabler/icons-react'

export function MobileBottomNavigation() {
  const pathname = usePathname()
  const { user, profile } = useAuthContext()

  // Só renderiza se o usuário estiver logado
  if (!user || !profile) {
    return null
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="relative">
        {/* Barra Principal Brutalista */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] px-4 py-3">
          <div className="flex items-center justify-center">
            {/* Links Principais */}
            <div className="flex items-center space-x-1">
              <NavigationLink
                href="/home"
                destination="Home"
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 min-w-[50px] border-2 border-black font-black text-xs",
                  isActive('/home')
                    ? "bg-blue-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <IconHome size={20} stroke={2} />
                <span className="font-black mt-1">HOME</span>
              </NavigationLink>
              
              <NavigationLink
                href="/dashboard"
                destination="Dashboard"
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 min-w-[50px] border-2 border-black font-black text-xs",
                  isActive('/dashboard')
                    ? "bg-indigo-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <IconChartBar size={20} stroke={2} />
                <span className="font-black mt-1">DASH</span>
              </NavigationLink>
              
              <NavigationLink
                href="/buscar"
                destination="Buscar"
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 min-w-[50px] border-2 border-black font-black text-xs",
                  isActive('/buscar')
                    ? "bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <IconSearch size={20} stroke={2} />
                <span className="font-black mt-1">BUSCAR</span>
              </NavigationLink>
              
              <NavigationLink
                href="/classificados"
                destination="Classificados"
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200 min-w-[50px] border-2 border-black font-black text-xs",
                  isActive('/classificados')
                    ? "bg-purple-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white text-black hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <IconBriefcase size={20} stroke={2} />
                <span className="font-black mt-1">CLASS</span>
              </NavigationLink>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}