'use client'

import { useState, useEffect } from 'react'
import { X, Search, MapPin, Save, RotateCcw } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { LocationFilter } from '@/hooks/useLocationFilters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EstadoCombobox } from '@/components/search/EstadoCombobox'
import { CidadeCombobox } from '@/components/search/CidadeCombobox'
import { useIBGE } from '@/hooks/useIBGE'
import { getEstadoByNome, getEstadoBySigla } from '@/lib/ibge'
import { LocationComboboxesMultiCountry } from '@/components/ui/LocationComboboxesMultiCountry'
import { useLocale } from '@/contexts/LocaleContext'

interface FeedSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentSearch: string
  currentLocationFilter: LocationFilter
  onSearchChange: (search: string) => void
  onLocationFilterChange: (filter: LocationFilter) => void
  onReset?: () => void | Promise<void>
}

interface SearchPreferences {
  searchBy: 'keywords' | 'username' | 'userid'
  keywords: string
  username: string
  userid: string
}

export function FeedSettingsModal({
  isOpen,
  onClose,
  currentSearch,
  currentLocationFilter,
  onSearchChange,
  onLocationFilterChange,
  onReset
}: FeedSettingsModalProps) {
  const { profile, user } = useAuthContext()
  const { country: contextCountry } = useLocale()
  const { estados, loadCidades } = useIBGE()
  const [searchValue, setSearchValue] = useState('')
  const [selectedLocationType, setSelectedLocationType] = useState<LocationFilter['type']>(currentLocationFilter.type)
  const [selectedCountry, setSelectedCountry] = useState<string>((profile as any)?.country || contextCountry || 'BR')
  const [selectedCity, setSelectedCity] = useState(currentLocationFilter.city || '')
  const [selectedState, setSelectedState] = useState(currentLocationFilter.state || '')
  const [selectedStateSigla, setSelectedStateSigla] = useState<string>('') // Sigla do estado para o combobox
  const [isSaving, setIsSaving] = useState(false)
  
  // Função para mapear código de país para nome
  const getCountryName = (code: string): string => {
    const countryMap: Record<string, string> = {
      'BR': 'Brasil',
      'US': 'United States',
      'CA': 'Canada',
      'MX': 'Mexico',
      'GB': 'United Kingdom',
      'AU': 'Australia'
    }
    return countryMap[code] || 'Brasil'
  }
  
  // Função para mapear nome de país para código
  const getCountryCode = (name: string): string => {
    const countryMap: Record<string, string> = {
      'Brasil': 'BR',
      'Brazil': 'BR',
      'United States': 'US',
      'Estados Unidos': 'US',
      'Canada': 'CA',
      'Mexico': 'MX',
      'United Kingdom': 'GB',
      'Australia': 'AU'
    }
    return countryMap[name] || 'BR'
  }

  useEffect(() => {
    if (isOpen) {
      // Carregar preferências salvas do perfil
      // NÃO carregar preferências de pesquisa do banco (keywords, username, userid)
      // A pesquisa é apenas temporária e não é salva
      // Apenas usar o currentSearch atual (se houver) para preencher o campo
      if (currentSearch) {
        // Remover prefixos se houver
        let cleanSearch = currentSearch
        if (currentSearch.startsWith('user:')) {
          cleanSearch = currentSearch.replace('user:', '')
        } else if (currentSearch.startsWith('id:')) {
          cleanSearch = currentSearch.replace('id:', '')
        }
        setSearchValue(cleanSearch)
      } else {
        setSearchValue('')
      }
      setSelectedLocationType(currentLocationFilter.type)
      setSelectedCity(currentLocationFilter.city || profile?.location_city || '')
      
      // Normalizar estado: converter sigla para nome completo se necessário
      const normalizeState = async () => {
        const stateValue = currentLocationFilter.state || profile?.location_state || ''
        if (stateValue) {
          // Se for sigla (2 caracteres), converter para nome completo
          if (stateValue.length === 2) {
            try {
              const estado = await getEstadoBySigla(stateValue) || estados.find(e => e.sigla === stateValue)
              if (estado) {
                setSelectedState(estado.nome) // Sempre usar nome completo
                setSelectedStateSigla(estado.sigla)
                if (estado.sigla) {
                  loadCidades(estado.sigla)
                }
              } else {
                setSelectedState(stateValue)
              }
            } catch (error) {
              console.error('Erro ao normalizar estado:', error)
              const estadoEncontrado = estados.find(e => e.sigla === stateValue)
              if (estadoEncontrado) {
                setSelectedState(estadoEncontrado.nome)
                setSelectedStateSigla(estadoEncontrado.sigla)
                loadCidades(estadoEncontrado.sigla)
              } else {
                setSelectedState(stateValue)
              }
            }
          } else {
            // Já é nome completo, apenas buscar sigla para o combobox
            setSelectedState(stateValue)
            try {
              const estado = await getEstadoByNome(stateValue) || estados.find(e => e.nome === stateValue)
              if (estado) {
                setSelectedStateSigla(estado.sigla)
                if (estado.sigla) {
                  loadCidades(estado.sigla)
                }
              }
            } catch (error) {
              console.error('Erro ao buscar sigla do estado:', error)
              const estadoEncontrado = estados.find(e => e.nome === stateValue)
              if (estadoEncontrado) {
                setSelectedStateSigla(estadoEncontrado.sigla)
                loadCidades(estadoEncontrado.sigla)
              }
            }
          }
        }
      }
      
      normalizeState()
    }
  }, [isOpen, currentSearch, currentLocationFilter, profile, user?.id, estados, loadCidades])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // SEMPRE converter sigla do estado para nome completo antes de salvar
      let finalState = selectedState
      
      // Se tiver sigla selecionada mas não tiver nome, buscar o nome
      if (selectedStateSigla && !selectedState) {
        const estado = estados.find(e => e.sigla === selectedStateSigla)
        if (estado) {
          finalState = estado.nome
        }
      }
      
      // Se o estado for uma sigla (2 caracteres), converter para nome completo
      if (finalState && finalState.length === 2) {
        const estado = estados.find(e => e.sigla === finalState)
        if (estado) {
          finalState = estado.nome
        }
      }
      
      // Garantir que sempre use nome completo
      if (selectedStateSigla && !finalState) {
        const estado = estados.find(e => e.sigla === selectedStateSigla)
        if (estado) {
          finalState = estado.nome
        }
      }
      
      // Mapear código de país para nome
      const countryName = getCountryName(selectedCountry)
      
      const locationFilter: LocationFilter = {
        type: selectedLocationType,
        city: selectedLocationType === 'local' || selectedLocationType === 'custom' ? selectedCity : undefined,
        state: selectedLocationType === 'local' || selectedLocationType === 'state' || selectedLocationType === 'custom' ? finalState : undefined,
        country: countryName
      }

      // Determinar o valor de pesquisa - detectar automaticamente o tipo
      let finalSearchValue = ''
      if (searchValue.trim()) {
        // Se começar com "user:" ou "id:", usar como está
        if (searchValue.trim().startsWith('user:')) {
          finalSearchValue = searchValue.trim()
        } else if (searchValue.trim().startsWith('id:')) {
          finalSearchValue = searchValue.trim()
        } else {
          // Tentar detectar se é UUID (ID de usuário)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          if (uuidRegex.test(searchValue.trim())) {
            finalSearchValue = `id:${searchValue.trim()}`
          } else {
            // Caso contrário, tratar como palavras-chave ou nome de usuário
            // Se tiver espaço, é palavras-chave; se não, pode ser nome de usuário
            if (searchValue.trim().includes(' ')) {
              finalSearchValue = searchValue.trim()
            } else {
              // Tentar como nome de usuário primeiro
              finalSearchValue = `user:${searchValue.trim()}`
            }
          }
        }
      }

      // Atualizar filtro local (pesquisa é temporária, não salva)
      onSearchChange(finalSearchValue)
      onLocationFilterChange(locationFilter)

      // Salvar APENAS localização no banco de dados (cidade, estado, tipo)
      // NÃO salvar pesquisa (keywords, username, userid) - é apenas temporária
      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({
            feed_location_filter_type: locationFilter.type,
            feed_location_filter_city: locationFilter.city || null,
            feed_location_filter_state: locationFilter.state || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (error) throw error

        // Salvar silenciosamente, sem mostrar mensagem
      }

      onClose()
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      data-feed-settings-modal
      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-[85vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Configurações do Feed
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-3 space-y-4">
          {/* Pesquisa */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-900 dark:text-white mb-2">
              <Search className="h-3.5 w-3.5" />
              Pesquisa no Feed
            </label>
            
            <div className="space-y-1.5">
              <Input
                type="text"
                placeholder="Palavras-chave, user:nome ou id:uuid..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-xs h-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Digite palavras-chave, <code className="text-[9px] bg-gray-100 dark:bg-gray-800 px-1 rounded">user:nome</code> ou <code className="text-[9px] bg-gray-100 dark:bg-gray-800 px-1 rounded">id:uuid</code>
              </p>
            </div>
          </div>

          {/* Localização */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-900 dark:text-white mb-2">
              <MapPin className="h-3.5 w-3.5" />
              Filtro de Localização
            </label>
            
            <div className="space-y-1.5">
              {/* Seleção de País - PRIMEIRO */}
              <div className="mb-3">
                <label className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  País
                </label>
                <LocationComboboxesMultiCountry
                  country={selectedCountry}
                  stateCode={selectedStateSigla}
                  city={selectedCity}
                  onCountryChange={(newCountry) => {
                    setSelectedCountry(newCountry)
                    // Limpar estado e cidade quando país muda
                    setSelectedState('')
                    setSelectedStateSigla('')
                    setSelectedCity('')
                  }}
                  onStateChange={(stateCode) => {
                    setSelectedStateSigla(stateCode)
                    // Buscar nome do estado baseado no país
                    if (selectedCountry === 'BR') {
                      const estado = estados.find(e => e.sigla === stateCode)
                      if (estado) {
                        setSelectedState(estado.nome)
                        loadCidades(estado.sigla)
                      }
                    } else {
                      // Para EUA, usar o código do estado diretamente
                      setSelectedState(stateCode)
                    }
                    setSelectedCity('')
                    // NÃO fechar o modal ao selecionar estado
                  }}
                  onCityChange={(city) => {
                    setSelectedCity(city)
                  }}
                />
              </div>

              {/* Opção: Minha Cidade */}
              <div>
                <button
                  onClick={() => {
                    setSelectedLocationType('local')
                    // Se não houver cidade/estado selecionados, usar do perfil
                    if (!selectedCity && !selectedState) {
                      setSelectedCity(profile?.location_city || '')
                      setSelectedCountry((profile as any)?.country || contextCountry || 'BR')
                      // Buscar sigla do estado baseado no país
                      if (profile?.location_state) {
                        const country = (profile as any)?.country || contextCountry || 'BR'
                        if (country === 'BR') {
                          const estado = estados.find(e => e.nome === profile.location_state || e.sigla === profile.location_state)
                          if (estado) {
                            setSelectedState(estado.nome)
                            setSelectedStateSigla(estado.sigla)
                            loadCidades(estado.sigla)
                          }
                        } else {
                          // Para EUA, usar o código diretamente
                          setSelectedState(profile.location_state)
                          setSelectedStateSigla(profile.location_state)
                        }
                      }
                    }
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-md border transition-all ${
                    selectedLocationType === 'local'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold text-xs">Minha Cidade</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {selectedCity && selectedState
                      ? `${selectedCity}, ${selectedState}`
                      : profile?.location_city && profile?.location_state 
                        ? `${profile.location_city}, ${profile.location_state}`
                        : 'Selecione país, estado e cidade'}
                  </div>
                </button>
              </div>

              {/* Opção: Meu Estado */}
              <div>
                <button
                  onClick={() => {
                    setSelectedLocationType('state')
                    // Se não houver estado selecionado, usar do perfil
                    if (!selectedState) {
                      setSelectedState(profile?.location_state || '')
                      // Buscar sigla do estado
                      if (profile?.location_state) {
                        const estado = estados.find(e => e.nome === profile.location_state)
                        if (estado) {
                          setSelectedStateSigla(estado.sigla)
                        }
                      }
                    }
                    setSelectedCity('')
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-md border transition-all ${
                    selectedLocationType === 'state'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold text-xs">Meu Estado</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {selectedState || profile?.location_state || 'Selecione um estado'}
                  </div>
                </button>
                
                {/* Mostrar combobox quando "state" estiver selecionado */}
                {selectedLocationType === 'state' && (
                  <div className="mt-2 px-0.5">
                    <label className="text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-0.5 block">
                      Estado
                    </label>
                    <EstadoCombobox
                      value={selectedStateSigla}
                      onValueChange={(sigla) => {
                        setSelectedStateSigla(sigla)
                        const estado = estados.find(e => e.sigla === sigla)
                        if (estado) {
                          setSelectedState(estado.nome)
                          loadCidades(estado.sigla)
                        }
                        // NÃO fechar o modal ao selecionar estado
                      }}
                      placeholder="Selecione o estado"
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Opção: Todos */}
              <button
                onClick={() => {
                  setSelectedLocationType('all')
                  setSelectedCity('')
                  setSelectedState('')
                }}
                className={`w-full text-left px-2.5 py-2 rounded-md border transition-all ${
                  selectedLocationType === 'all'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-xs">Todos os Locais</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Posts de qualquer localização
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onReset && (
              <Button
                variant="outline"
                onClick={() => {
                  if (onReset) {
                    onReset()
                  }
                  onClose()
                }}
                size="sm"
                className="text-xs h-7 px-2 text-gray-700 dark:text-gray-300"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Resetar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              size="sm"
              className="text-xs h-7 px-2 text-gray-700 dark:text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-2"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-1 text-[10px]">⏳</span>
                  <span className="text-[10px]">Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-1" />
                  <span className="text-xs">Salvar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
  )
}

