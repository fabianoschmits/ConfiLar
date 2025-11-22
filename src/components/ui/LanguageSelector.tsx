'use client'

import React, { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from 'next-intl'
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

export function LanguageSelector() {
  const { locale, country, setLocale, setCountry } = useLocale()
  const t = useTranslations('common')
  const [isOpen, setIsOpen] = useState(false)

  const currentCountry = countries.find(c => c.code === country) || countries[0]

  const handleCountryChange = async (newCountry: Country, newLocale: Locale) => {
    setIsOpen(false)
    // Atualizar país e idioma (ambos salvam no banco automaticamente)
    await Promise.all([
      setCountry(newCountry),
      setLocale(newLocale)
    ])
    // Recarregar página para aplicar mudanças
    window.location.reload()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 h-9 px-2"
          aria-label="Selecionar país e idioma"
        >
          <Image
            src={currentCountry.flag}
            alt={`${currentCountry.name} flag`}
            width={20}
            height={14}
            className="rounded-sm object-cover"
          />
          <span className="hidden md:inline text-sm">{currentCountry.name}</span>
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

