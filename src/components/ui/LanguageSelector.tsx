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
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { Locale } from '@/i18n/config'

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
]

export function LanguageSelector() {
  const { locale, setLocale } = useLocale()
  const t = useTranslations('common')
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
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
          aria-label="Selecionar idioma"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline text-sm">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              locale === language.code ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {locale === language.code && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

