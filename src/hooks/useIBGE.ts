import { useState, useEffect, useCallback } from 'react'
import { ibgeService, Estado, Cidade } from '@/lib/ibge'

export function useIBGE() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar todos os estados
  const loadEstados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ibgeService.getEstados()
      setEstados(data)
    } catch (err) {
      setError('Erro ao carregar estados')
      console.error('Erro ao carregar estados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar cidades de um estado específico
  const loadCidades = useCallback(async (siglaEstado: string) => {
    if (!siglaEstado) {
      setCidades([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await ibgeService.getCidadesByEstado(siglaEstado)
      setCidades(data)
    } catch (err) {
      setError('Erro ao carregar cidades')
      console.error('Erro ao carregar cidades:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar estados por termo
  const searchEstados = useCallback(async (termo: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await ibgeService.getEstados()
      const filtered = termo 
        ? data.filter(estado =>
            estado.nome.toLowerCase().includes(termo.toLowerCase()) ||
            estado.sigla.toLowerCase().includes(termo.toLowerCase())
          )
        : data
      setEstados(filtered)
    } catch (err) {
      setError('Erro ao buscar estados')
      console.error('Erro ao buscar estados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar cidades por termo
  const searchCidades = useCallback(async (termo: string, siglaEstado?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await ibgeService.searchCidades(termo, siglaEstado)
      setCidades(data)
    } catch (err) {
      setError('Erro ao buscar cidades')
      console.error('Erro ao buscar cidades:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Verificar saúde da API
  const checkHealth = useCallback(async () => {
    try {
      return await ibgeService.healthCheck()
    } catch (err) {
      console.error('Erro no health check:', err)
      return false
    }
  }, [])

  // Limpar cache
  const clearCache = useCallback(() => {
    ibgeService.clearCache()
  }, [])

  // Carregar estados na inicialização
  useEffect(() => {
    loadEstados()
  }, [loadEstados])

  return {
    // Estado
    estados,
    cidades,
    loading,
    error,
    
    // Ações
    loadEstados,
    loadCidades,
    searchEstados,
    searchCidades,
    checkHealth,
    clearCache,
    
    // Utilitários
    getEstadoBySigla: useCallback((sigla: string) => 
      estados.find(estado => estado.sigla === sigla), [estados]
    ),
    getCidadesByEstado: useCallback((siglaEstado: string) => 
      cidades.filter(cidade => cidade.estadoSigla === siglaEstado), [cidades]
    )
  }
}

// Hook específico para estados
export function useEstados() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEstados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ibgeService.getEstados()
      setEstados(data)
    } catch (err) {
      setError('Erro ao carregar estados')
      console.error('Erro ao carregar estados:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEstados()
  }, [loadEstados])

  return { estados, loading, error, loadEstados }
}

// Hook específico para cidades de um estado
export function useCidades(siglaEstado: string) {
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  console.log('🏙️ useCidades chamado com estado:', siglaEstado)

  const loadCidades = useCallback(async () => {
    console.log('🔄 loadCidades chamado para estado:', siglaEstado)
    if (!siglaEstado) {
      console.log('❌ Nenhum estado fornecido, limpando cidades')
      setCidades([])
      return
    }

    try {
      console.log('⏳ Carregando cidades para estado:', siglaEstado)
      setLoading(true)
      setError(null)
      const data = await ibgeService.getCidadesByEstado(siglaEstado)
      console.log('✅ Cidades carregadas:', data.length, 'cidades')
      setCidades(data)
    } catch (err) {
      console.error('❌ Erro ao carregar cidades:', err)
      setError('Erro ao carregar cidades')
    } finally {
      setLoading(false)
    }
  }, [siglaEstado])

  useEffect(() => {
    loadCidades()
  }, [loadCidades])

  return { cidades, loading, error, loadCidades }
}




