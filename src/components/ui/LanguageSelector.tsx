'use client'

import React, { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Globe, MapPin } from 'lucide-react'
import { Locale, Country, localeToCountry } from '@/i18n/config'
import Image from 'next/image'

const countries: { code: Country; name: string; flag: string; locale: Locale }[] = [
  { code: 'BR', name: 'Brasil', flag: '/imagens/flags/br.svg', locale: 'pt-BR' },
  { code: 'US', name: 'United States', flag: '/imagens/flags/us.svg', locale: 'en' },
]

interface LanguageSelectorProps {
  iconOnly?: boolean
  compact?: boolean
}

export function LanguageSelector({ iconOnly = false, compact = false }: LanguageSelectorProps = {}) {
  const { locale, country, setLocale, setCountry } = useLocale()
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const currentCountry = countries.find(c => c.code === country) || countries[0]

  const handleCountryChange = async (newCountry: Country, newLocale: Locale) => {
    setIsOpen(false)
    
    // Salvar preferências no localStorage primeiro
    if (typeof window !== 'undefined') {
      localStorage.setItem('confilar-locale', newLocale)
      localStorage.setItem('confilar-country', newCountry)
    }
    
    // Salvar no banco de dados (via setLocale e setCountry)
    await Promise.all([
      setCountry(newCountry),
      setLocale(newLocale)
    ])
    
    // Construir a nova URL com o locale
    // Se o locale não for o padrão, adicionar o prefixo
    const currentPath = pathname || window.location.pathname
    let newPath = currentPath
    
    // Remover qualquer prefixo de locale existente
    const pathWithoutLocale = currentPath.replace(/^\/(pt-BR|en)/, '') || '/'
    
    // Se o novo locale não for o padrão, adicionar o prefixo
    if (newLocale !== 'pt-BR') {
      newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
    } else {
      newPath = pathWithoutLocale
    }
    
    // Preservar query params se existirem
    const searchParams = window.location.search
    const newUrl = newPath + searchParams
    
    // Redirecionar usando window.location para garantir que o middleware detecte
    window.location.href = newUrl
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "sm"}
          className={`flex items-center ${iconOnly ? 'gap-0 h-7 w-7 p-0' : 'gap-2 h-9 px-2'}`}
          aria-label="Selecionar país e idioma"
        >
          <Image
            src={currentCountry.flag}
            alt={`${currentCountry.name} flag`}
            width={iconOnly ? 16 : 20}
            height={iconOnly ? 12 : 14}
            className="rounded-sm object-cover"
          />
          {!iconOnly && (
            <span className="hidden md:inline text-sm">{currentCountry.name}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Selecionar Localização</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {countries.map((countryOption) => (
          <DropdownMenuItem
            key={countryOption.code}
            onClick={() => handleCountryChange(countryOption.code, countryOption.locale)}
            className={`flex items-center gap-2 cursor-pointer ${
              country === countryOption.code ? 'bg-accent' : ''
            }`}
          >
            <Image
              src={countryOption.flag}
              alt={`${countryOption.name} flag`}
              width={24}
              height={18}
              className="rounded-sm object-cover"
            />
            <div className="flex flex-col">
              <span className="font-medium">{countryOption.name}</span>
              <span className="text-xs text-muted-foreground">
                {countryOption.locale === 'pt-BR' ? 'Português' : 'English'}
              </span>
            </div>
            {country === countryOption.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

