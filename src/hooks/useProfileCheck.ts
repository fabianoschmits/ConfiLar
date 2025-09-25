'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function useProfileCheck() {
  const { user, profile } = useAuthContext()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setIsChecking(false)
        return
      }

      try {
        // Verificar se o usuário tem perfil completo
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, profile_completed')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Erro ao verificar perfil:', error)
          setIsChecking(false)
          return
        }

        // Se não tem perfil ou perfil não está completo, redirecionar para onboarding
        if (!profileData || !profileData.profile_completed) {
          // Verificar se já está na página de onboarding para evitar loop
          if (window.location.pathname !== '/onboarding') {
            router.push('/onboarding')
          }
        }
      } catch (error) {
        console.error('Erro ao verificar perfil:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkProfile()
  }, [user, router])

  return { isChecking }
}
