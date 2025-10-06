import { useState, useCallback } from 'react'

interface DuplicateCheckResult {
  emailExists: boolean
  cpfExists: boolean
  hasDuplicates: boolean
}

interface UseDuplicateCheckReturn {
  checkDuplicates: (email?: string, cpf?: string) => Promise<DuplicateCheckResult>
  isChecking: boolean
  error: string | null
}

/**
 * Hook para verificar duplicatas de email e CPF
 * 
 * @returns {UseDuplicateCheckReturn} Funções e estados para verificação de duplicatas
 */
export function useDuplicateCheck(): UseDuplicateCheckReturn {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDuplicates = useCallback(async (email?: string, cpf?: string): Promise<DuplicateCheckResult> => {
    if (!email && !cpf) {
      return { emailExists: false, cpfExists: false, hasDuplicates: false }
    }

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch('/api/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, cpf }),
      })

      if (!response.ok) {
        throw new Error('Erro ao verificar duplicatas')
      }

      const result = await response.json()
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao verificar duplicatas:', err)
      
      return { emailExists: false, cpfExists: false, hasDuplicates: false }
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    checkDuplicates,
    isChecking,
    error
  }
}

/**
 * Hook para verificar apenas email
 */
export function useEmailCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkEmail = useCallback(async (email: string): Promise<boolean> => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return false
    }

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch(`/api/check-duplicates?email=${encodeURIComponent(email)}`)

      if (!response.ok) {
        throw new Error('Erro ao verificar email')
      }

      const result = await response.json()
      return result.emailExists

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao verificar email:', err)
      
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    checkEmail,
    isChecking,
    error
  }
}

/**
 * Hook para verificar apenas CPF
 */
export function useCpfCheck() {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkCpf = useCallback(async (cpf: string): Promise<boolean> => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) {
      return false
    }

    setIsChecking(true)
    setError(null)

    try {
      const response = await fetch(`/api/check-duplicates?cpf=${encodeURIComponent(cleanCpf)}`)

      if (!response.ok) {
        throw new Error('Erro ao verificar CPF')
      }

      const result = await response.json()
      return result.cpfExists

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao verificar CPF:', err)
      
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    checkCpf,
    isChecking,
    error
  }
}
