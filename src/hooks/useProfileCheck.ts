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
        // Verificar se o perfil foi completado usando o campo profile_completed
        const isProfileCompleted = profile.profile_completed === true

        // Se o perfil não foi completado, redirecionar para onboarding
        if (!isProfileCompleted) {
          // Verificar se já está na página de onboarding ou editar perfil para evitar loop
          const currentPath = window.location.pathname
          if (currentPath !== '/onboarding' && currentPath !== '/editarperfil' && currentPath !== '/editar-perfil') {
            console.log('🔍 Perfil não completado, redirecionando para onboarding')
            router.push('/onboarding')
          }
        } else {
          console.log('✅ Perfil completado, permitindo acesso')
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

        // Verificar se o perfil foi completado usando o campo profile_completed
        const isProfileCompleted = profileData.profile_completed === true

        // Se o perfil não foi completado, redirecionar para onboarding
        if (!isProfileCompleted) {
          const currentPath = window.location.pathname
          if (currentPath !== '/onboarding' && currentPath !== '/editarperfil' && currentPath !== '/editar-perfil') {
            console.log('🔍 Perfil não completado, redirecionando para onboarding')
            router.push('/onboarding')
          }
        } else {
          console.log('✅ Perfil completado, permitindo acesso')
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
