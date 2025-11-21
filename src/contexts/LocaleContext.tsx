'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Locale, localeToCountry } from '@/i18n/config'
import type { Country } from '@/i18n/config'
import { createLocationService, LocationService } from '@/lib/location/LocationService'
import { supabase } from '@/lib/supabase'

interface LocaleContextType {
  locale: Locale
  country: Country
  locationService: LocationService
  setLocale: (locale: Locale) => void
  setCountry: (country: Country) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = 'confilar-locale'
const COUNTRY_STORAGE_KEY = 'confilar-country'

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Detectar idioma inicial
  const getInitialLocale = async (): Promise<Locale> => {
    if (typeof window === 'undefined') return 'pt-BR'
    
    // 1. Verificar perfil do usuário (se logado)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('locale, country')
          .eq('id', user.id)
          .maybeSingle()
        
        if (profile?.locale && (profile.locale === 'pt-BR' || profile.locale === 'en')) {
          return profile.locale as Locale
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar locale do perfil:', error)
    }
    
    // 2. Verificar localStorage
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && (stored === 'pt-BR' || stored === 'en')) {
      return stored as Locale
    }
    
    // 3. Verificar navegador (melhorado)
    const browserLang = navigator.language || (navigator as any).userLanguage || navigator.languages?.[0] || 'pt-BR'
    if (browserLang.startsWith('en')) return 'en'
    if (browserLang.startsWith('pt')) return 'pt-BR'
    
    // 4. Padrão
    return 'pt-BR'
  }

  const getInitialCountry = async (locale: Locale): Promise<Country> => {
    if (typeof window === 'undefined') return localeToCountry[locale]
    
    // 1. Verificar perfil do usuário (se logado)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country, locale')
          .eq('id', user.id)
          .maybeSingle()
        
        if (profile?.country && (profile.country === 'BR' || profile.country === 'US')) {
          return profile.country as Country
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar country do perfil:', error)
    }
    
    // 2. Verificar localStorage
    const stored = localStorage.getItem(COUNTRY_STORAGE_KEY)
    if (stored && (stored === 'BR' || stored === 'US')) {
      return stored as Country
    }
    
    // 3. Usar país baseado no idioma
    return localeToCountry[locale]
  }

  const [locale, setLocaleState] = useState<Locale>('pt-BR')
  const [country, setCountryState] = useState<Country>('BR')
  const [locationService] = useState<LocationService>(() => 
    createLocationService('BR')
  )

  // Inicializar locale e country do perfil ou navegador
  useEffect(() => {
    let mounted = true
    
    const initializeLocale = async () => {
      if (isInitialized) return
      
      try {
        const detectedLocale = await getInitialLocale()
        const detectedCountry = await getInitialCountry(detectedLocale)
        
        if (mounted) {
          setLocaleState(detectedLocale)
          setCountryState(detectedCountry)
          locationService.setCountry(detectedCountry)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Erro ao inicializar locale:', error)
        if (mounted) {
          setIsInitialized(true)
        }
      }
    }
    
    initializeLocale()
    
    return () => {
      mounted = false
    }
  }, [isInitialized, locationService])

  // Atualizar locationService quando país mudar
  useEffect(() => {
    locationService.setCountry(country)
  }, [country, locationService])

  // Salvar no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    }
  }, [locale])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUNTRY_STORAGE_KEY, country)
    }
  }, [country])

  // Função para mudar locale
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    // Atualizar país baseado no locale se não foi definido manualmente
    const newCountry = localeToCountry[newLocale]
    if (country === localeToCountry[locale]) {
      setCountryState(newCountry)
    }
    // Recarregar página para aplicar mudanças
    router.refresh()
  }, [locale, country, router])

  // Função para mudar país
  const setCountry = useCallback((newCountry: Country) => {
    setCountryState(newCountry)
    locationService.setCountry(newCountry)
    // Atualizar locale baseado no país se não foi definido manualmente
    const newLocale = Object.entries(localeToCountry).find(
      ([_, c]) => c === newCountry
    )?.[0] as Locale | undefined
    
    if (newLocale && locale === Object.entries(localeToCountry).find(
      ([_, c]) => c === country
    )?.[0]) {
      setLocaleState(newLocale)
    }
    router.refresh()
  }, [country, locale, locationService, router])

  // Função de tradução simples (placeholder - use useTranslations do next-intl nos componentes)
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    // Esta função é apenas um placeholder
    // Use useTranslations do next-intl diretamente nos componentes
    let result = key
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        result = result.replace(`{${paramKey}}`, String(value))
      })
    }
    return result
  }, [])

  return (
    <LocaleContext.Provider
      value={{
        locale,
        country,
        locationService,
        setLocale,
        setCountry,
        t
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

