'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useIBGE } from '@/hooks/useIBGE'
import { Estado, Cidade } from '@/lib/ibge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, ChevronDown, ChevronUp, X } from 'lucide-react'

interface LocationFilterProps {
  onLocationChange: (estado?: string, cidade?: string) => void
  className?: string
}

export function LocationFilter({ onLocationChange, className = '' }: LocationFilterProps) {
  const { estados, cidades, loading, searchEstados, searchCidades, loadCidades } = useIBGE()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null)
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null)
  const [estadoSearchTerm, setEstadoSearchTerm] = useState('')
  const [cidadeSearchTerm, setCidadeSearchTerm] = useState('')
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false)
  const [showCidadeDropdown, setShowCidadeDropdown] = useState(false)
  const [filteredEstados, setFilteredEstados] = useState<Estado[]>([])
  const [filteredCidades, setFilteredCidades] = useState<Cidade[]>([])

  const estadoInputRef = useRef<HTMLInputElement>(null)
  const cidadeInputRef = useRef<HTMLInputElement>(null)
  const estadoDropdownRef = useRef<HTMLDivElement>(null)
  const cidadeDropdownRef = useRef<HTMLDivElement>(null)

  // Filtrar estados baseado no termo de busca
  useEffect(() => {
    if (estadoSearchTerm) {
      const filtered = estados.filter(estado =>
        estado.nome.toLowerCase().includes(estadoSearchTerm.toLowerCase()) ||
        estado.sigla.toLowerCase().includes(estadoSearchTerm.toLowerCase())
      )
      setFilteredEstados(filtered)
    } else {
      setFilteredEstados(estados)
    }
  }, [estadoSearchTerm, estados])

  // Filtrar cidades baseado no termo de busca
  useEffect(() => {
    if (cidadeSearchTerm && selectedEstado) {
      const filtered = cidades.filter(cidade =>
        cidade.nome.toLowerCase().includes(cidadeSearchTerm.toLowerCase())
      )
      setFilteredCidades(filtered)
    } else {
      setFilteredCidades(cidades)
    }
  }, [cidadeSearchTerm, cidades, selectedEstado])

  // Carregar cidades quando um estado for selecionado
  useEffect(() => {
    if (selectedEstado) {
      loadCidades(selectedEstado.sigla)
      setSelectedCidade(null)
      setCidadeSearchTerm('')
    }
  }, [selectedEstado, loadCidades])

  // Notificar mudanças de localização
  useEffect(() => {
    onLocationChange(selectedEstado?.sigla, selectedCidade?.nome)
  }, [selectedEstado, selectedCidade, onLocationChange])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (estadoDropdownRef.current && !estadoDropdownRef.current.contains(event.target as Node)) {
        setShowEstadoDropdown(false)
      }
      if (cidadeDropdownRef.current && !cidadeDropdownRef.current.contains(event.target as Node)) {
        setShowCidadeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEstadoSelect = (estado: Estado) => {
    setSelectedEstado(estado)
    setEstadoSearchTerm(estado.nome)
    setShowEstadoDropdown(false)
  }

  const handleCidadeSelect = (cidade: Cidade) => {
    setSelectedCidade(cidade)
    setCidadeSearchTerm(cidade.nome)
    setShowCidadeDropdown(false)
  }

  const clearEstado = () => {
    setSelectedEstado(null)
    setEstadoSearchTerm('')
    setSelectedCidade(null)
    setCidadeSearchTerm('')
    setShowEstadoDropdown(false)
  }

  const clearCidade = () => {
    setSelectedCidade(null)
    setCidadeSearchTerm('')
    setShowCidadeDropdown(false)
  }

  const clearAll = () => {
    clearEstado()
    clearCidade()
  }

  const getDisplayText = () => {
    if (selectedCidade && selectedEstado) {
      return `${selectedCidade.nome}, ${selectedEstado.sigla}`
    }
    if (selectedEstado) {
      return selectedEstado.nome
    }
    return 'FILTRAR POR LOCALIZAÇÃO'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Botão principal brutalista */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all font-black"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span className="truncate font-black uppercase">{getDisplayText()}</span>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </Button>

      {/* Campos expandidos brutalistas */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 z-50">
          <div className="space-y-6">
            {/* Header brutalista */}
            <div className="flex items-center justify-between bg-black text-yellow-400 p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black text-black uppercase text-sm">FILTRO POR LOCALIZAÇÃO</h3>
              <Button
                onClick={clearAll}
                size="sm"
                className="bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black text-xs"
              >
                <X className="h-4 w-4 mr-1" />
                LIMPAR TUDO
              </Button>
            </div>

            {/* Campo Estado brutalista */}
            <div className="space-y-3">
              <label className="text-sm font-black text-black uppercase">ESTADO</label>
              <div className="relative" ref={estadoDropdownRef}>
                <Input
                  ref={estadoInputRef}
                  type="text"
                  placeholder="DIGITE O ESTADO..."
                  value={estadoSearchTerm}
                  onChange={(e) => {
                    setEstadoSearchTerm(e.target.value)
                    setShowEstadoDropdown(true)
                  }}
                  onFocus={() => setShowEstadoDropdown(true)}
                  className="border-4 border-black font-black text-black placeholder:text-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                {selectedEstado && (
                  <Button
                    onClick={clearEstado}
                    size="sm"
                    className="absolute right-2 top-2 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {showEstadoDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-h-64 overflow-y-auto z-10">
                    {loading ? (
                      <div className="p-4 text-center text-sm font-black bg-yellow-400 text-black border-b-2 border-black">
                        CARREGANDO ESTADOS...
                      </div>
                    ) : filteredEstados.length > 0 ? (
                      filteredEstados.map((estado) => (
                        <button
                          key={estado.id}
                          onClick={() => handleEstadoSelect(estado)}
                          className="w-full p-3 text-left hover:bg-yellow-400 border-b-2 border-black last:border-b-0 font-black text-sm transition-colors"
                        >
                          <div className="font-black text-black">{estado.nome}</div>
                          <div className="text-xs font-bold text-gray-700">{estado.sigla} - {estado.regiao}</div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm font-black text-gray-500 bg-gray-100 border-b-2 border-black">
                        NENHUM ESTADO ENCONTRADO
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Campo Cidade brutalista */}
            {selectedEstado && (
              <div className="space-y-3">
                <label className="text-sm font-black text-black uppercase">CIDADE</label>
                <div className="relative" ref={cidadeDropdownRef}>
                  <Input
                    ref={cidadeInputRef}
                    type="text"
                    placeholder="DIGITE A CIDADE..."
                    value={cidadeSearchTerm}
                    onChange={(e) => {
                      setCidadeSearchTerm(e.target.value)
                      setShowCidadeDropdown(true)
                    }}
                    onFocus={() => setShowCidadeDropdown(true)}
                    className="border-4 border-black font-black text-black placeholder:text-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  {selectedCidade && (
                    <Button
                      onClick={clearCidade}
                      size="sm"
                      className="absolute right-2 top-2 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {showCidadeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-h-64 overflow-y-auto z-10">
                      {loading ? (
                        <div className="p-4 text-center text-sm font-black bg-yellow-400 text-black border-b-2 border-black">
                          CARREGANDO CIDADES...
                        </div>
                      ) : filteredCidades.length > 0 ? (
                        filteredCidades.map((cidade) => (
                          <button
                            key={cidade.id}
                            onClick={() => handleCidadeSelect(cidade)}
                            className="w-full p-3 text-left hover:bg-yellow-400 border-b-2 border-black last:border-b-0 font-black text-sm transition-colors"
                          >
                            <div className="font-black text-black">{cidade.nome}</div>
                            <div className="text-xs font-bold text-gray-700">{cidade.estadoSigla}</div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm font-black text-gray-500 bg-gray-100 border-b-2 border-black">
                          NENHUMA CIDADE ENCONTRADA
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status brutalista */}
            <div className="bg-gray-100 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3">
              <div className="text-sm font-black text-black uppercase">
                {selectedEstado && selectedCidade ? (
                  `FILTRANDO POR: ${selectedCidade.nome}, ${selectedEstado.sigla}`
                ) : selectedEstado ? (
                  `FILTRANDO POR: ${selectedEstado.nome}`
                ) : (
                  'MOSTRANDO TODOS OS USUÁRIOS'
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
