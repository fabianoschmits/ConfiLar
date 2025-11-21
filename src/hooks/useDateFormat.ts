import { useLocale } from '@/contexts/LocaleContext'
import { format, formatDistanceToNow, formatRelative } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'

const localeMap = {
  'pt-BR': ptBR,
  'en': enUS,
}

export function useDateFormat() {
  const { locale } = useLocale()
  const dateLocale = localeMap[locale] || ptBR

  const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, formatStr, { locale: dateLocale })
  }

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (locale === 'en') {
      return format(dateObj, 'MM/dd/yyyy HH:mm', { locale: dateLocale })
    }
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: dateLocale })
  }

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(dateObj, { 
      addSuffix: true,
      locale: dateLocale 
    })
  }

  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatRelative(dateObj, new Date(), { locale: dateLocale })
  }

  const formatShortDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (locale === 'en') {
      return format(dateObj, 'MM/dd/yyyy', { locale: dateLocale })
    }
    return format(dateObj, 'dd/MM/yyyy', { locale: dateLocale })
  }

  return {
    formatDate,
    formatDateTime,
    formatTimeAgo,
    formatRelativeTime,
    formatShortDate,
    locale: dateLocale,
  }
}

