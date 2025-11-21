import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// Idiomas suportados
export const locales = ['pt-BR', 'en'] as const
export type Locale = (typeof locales)[number]

// Idioma padrão
export const defaultLocale: Locale = 'pt-BR'

// Mapeamento de países para idiomas
export const countryToLocale: Record<string, Locale> = {
  BR: 'pt-BR',
  US: 'en',
  CA: 'en',
  GB: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
  // Adicione mais países conforme necessário
}

// Tipo para país
export type Country = 'BR' | 'US'

// Mapeamento de idioma para país padrão
export const localeToCountry: Record<Locale, Country> = {
  'pt-BR': 'BR',
  'en': 'US',
}

export default getRequestConfig(async ({ locale }) => {
  // Validar que o locale recebido é válido
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})

