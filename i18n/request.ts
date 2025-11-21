import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '../src/i18n/routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Esta função será chamada para cada request
  let locale = await requestLocale

  // Se não houver locale na request, usar o padrão
  const validLocales = routing.locales as readonly string[]
  if (!locale || !validLocales.includes(locale)) {
    locale = routing.defaultLocale
  }

  // Validar que o locale recebido é válido
  if (!validLocales.includes(locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`../src/i18n/messages/${locale}.json`)).default
  }
})

