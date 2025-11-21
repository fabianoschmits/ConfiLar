import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, locales } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  // Esta função será chamada para cada request
  let locale = await requestLocale

  // Se não houver locale na request, usar o padrão
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})

