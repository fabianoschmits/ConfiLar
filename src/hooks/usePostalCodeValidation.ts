import { useLocale } from '@/contexts/LocaleContext'
import { useTranslations } from 'next-intl'

export function usePostalCodeValidation() {
  const { country, locationService } = useLocale()
  const t = useTranslations('location')

  const validate = (code: string): { valid: boolean; error?: string; formatted?: string } => {
    if (!code || code.trim() === '') {
      return { valid: false, error: t('invalidZipCode') }
    }

    const isValid = locationService.validatePostalCode(code)
    
    if (!isValid) {
      return { 
        valid: false, 
        error: country === 'US' ? t('invalidZipCodeUS') : t('invalidZipCode')
      }
    }

    const formatted = locationService.formatPostalCode(code)
    return { valid: true, formatted }
  }

  const format = (code: string): string => {
    return locationService.formatPostalCode(code)
  }

  const getPlaceholder = (): string => {
    return country === 'US' ? '12345 ou 12345-6789' : '12345-678'
  }

  const getMask = (): string => {
    return country === 'US' ? '99999-9999' : '99999-999'
  }

  return {
    validate,
    format,
    getPlaceholder,
    getMask,
    country,
  }
}

