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

      // Se já temos o perfil no contexto, verificar se está completo
      if (profile) {
        // Verificar se o perfil tem dados essenciais
        const hasEssentialData = profile.full_name && 
                                profile.phone && 
                                profile.location_state && 
                                profile.location_city

        // Se não tem dados essenciais, redirecionar para onboarding
        if (!hasEssentialData) {
          // Verificar se já está na página de onboarding para evitar loop
          if (window.location.pathname !== '/onboarding') {
            console.log('🔍 Perfil incompleto, redirecionando para onboarding')
            router.push('/onboarding')
          }
        } else {
          console.log('✅ Perfil completo, permitindo acesso')
        }
        setIsChecking(false)
        return
      }

      try {
        // Se não temos perfil no contexto, buscar no banco
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, full_name, phone, location_state, location_city, profile_completed')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error('Erro ao verificar perfil:', error)
          setIsChecking(false)
          return
        }

        // Se não tem perfil no banco, redirecionar para onboarding
        if (!profileData) {
          if (window.location.pathname !== '/onboarding') {
            console.log('🔍 Perfil não encontrado, redirecionando para onboarding')
            router.push('/onboarding')
          }
          setIsChecking(false)
          return
        }

        // Verificar se tem dados essenciais
        const hasEssentialData = profileData.full_name && 
                                profileData.phone && 
                                profileData.location_state && 
                                profileData.location_city

        // Se não tem dados essenciais, redirecionar para onboarding
        if (!hasEssentialData) {
          if (window.location.pathname !== '/onboarding') {
            console.log('🔍 Perfil incompleto (dados essenciais faltando), redirecionando para onboarding')
            router.push('/onboarding')
          }
        } else {
          console.log('✅ Perfil completo, permitindo acesso')
        }
      } catch (error) {
        console.error('Erro ao verificar perfil:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkProfile()
  }, [user, profile, router])

  return { isChecking }
}
