'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useIBGE } from '@/hooks/useIBGE'

interface CidadeComboboxProps {
  value: string
  onValueChange: (value: string) => void
  estadoSelecionado: string
  placeholder?: string
  className?: string
}

export function CidadeCombobox({
  value,
  onValueChange,
  estadoSelecionado,
  placeholder = "Selecione a cidade",
  className = ""
}: CidadeComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCidades, setFilteredCidades] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { cidades, loading, loadCidades, estados } = useIBGE()

  // Sincronizar searchTerm com value quando value mudar externamente
  useEffect(() => {
    if (value && value !== searchTerm) {
      setSearchTerm(value)
    }
  }, [value])

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    if (estadoSelecionado) {
      // Encontrar a sigla do estado
      const estado = estados.find(e => e.nome === estadoSelecionado)
      if (estado) {
        loadCidades(estado.sigla)
      }
    } else {
      setFilteredCidades([])
    }
  }, [estadoSelecionado, loadCidades])

  // Filtrar cidades baseado na busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCidades(cidades)
    } else {
      const filtered = cidades.filter(cidade =>
        cidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCidades(filtered)
    }
  }, [searchTerm, cidades])

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (cidade: any) => {
    onValueChange(cidade.nome)
    setSearchTerm(cidade.nome)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    setIsOpen(true)
    
    // Se o usuário limpar o campo, limpar a seleção
    if (!newValue.trim()) {
      onValueChange('')
    }
  }

  const handleInputFocus = () => {
    if (estadoSelecionado) {
      setIsOpen(true)
      // Só definir o searchTerm se o value não estiver vazio
      if (value) {
        setSearchTerm(value)
      }
    }
  }

  const handleInputBlur = () => {
    // Só fechar se não estiver clicando em uma opção
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
        // Só definir o searchTerm se o value não estiver vazio
        if (value) {
          setSearchTerm(value)
        }
      }
    }, 150)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input de busca */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={estadoSelecionado ? placeholder : "Primeiro selecione um estado"}
          disabled={!estadoSelecionado}
          className="pl-10 pr-10 h-9 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => estadoSelecionado && setIsOpen(!isOpen)}
          disabled={!estadoSelecionado}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Dropdown com opções */}
      {isOpen && estadoSelecionado && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border border-gray-200 bg-white max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Carregando cidades...</div>
            ) : filteredCidades.length > 0 ? (
              filteredCidades.map((cidade) => (
                <button
                  key={cidade.id}
                  onClick={() => handleSelect(cidade)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0 text-sm"
                >
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{cidade.nome}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">Nenhuma cidade encontrada</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
