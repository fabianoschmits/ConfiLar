'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNavigationWithLoading } from '@/hooks/useLoading'
import { ReactNode } from 'react'

interface NavigationLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
  destination?: string
}

export function NavigationLink({ 
  href, 
  children, 
  className, 
  onClick,
  destination 
}: NavigationLinkProps) {
  const router = useRouter()
  const { navigateWithLoading } = useNavigationWithLoading()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (onClick) {
      onClick()
    }

    await navigateWithLoading(
      destination || href.replace('/', '').replace('_public/', ''),
      () => router.push(href)
    )
  }

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
