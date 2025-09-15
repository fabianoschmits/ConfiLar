'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, MapPin, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useIBGE } from '@/hooks/useIBGE'
import type { Estado, Cidade } from '@/lib/ibge'

// Componente de busca por Estado com autocompletar
interface EstadoSearchProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function EstadoSearch({ 
  value, 
  onValueChange, 
  placeholder = "Buscar por estado...",
  className 
}: EstadoSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { estados, loading, searchEstados } = useIBGE()

  const selectedEstado = estados.find(estado => estado.sigla === value)

  // Buscar estados quando o termo de busca muda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchEstados(searchTerm)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchEstados])

  const filteredEstados = searchTerm 
    ? estados.filter(estado =>
        estado.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estado.sigla.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : estados.slice(0, 10) // Mostrar apenas os primeiros 10 quando não há busca

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-black text-lg py-3 border-4 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all", className)}
        >
          {value ? (
            <>
              <MapPin className="mr-2 h-5 w-5" />
              {selectedEstado?.nome} ({selectedEstado?.sigla})
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              {placeholder}
            </>
          )}
          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" align="start">
        <Command>
          <CommandInput 
            placeholder="Digite o nome ou sigla do estado..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="border-0 focus:ring-0"
          />
          <CommandList>
            {loading && (
              <CommandEmpty className="py-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto mb-2"></div>
                Carregando estados...
              </CommandEmpty>
            )}
            {!loading && filteredEstados.length === 0 && searchTerm && (
              <CommandEmpty className="py-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                Nenhum estado encontrado para "{searchTerm}"
              </CommandEmpty>
            )}
            {!loading && filteredEstados.length > 0 && (
              <CommandGroup>
                {filteredEstados.map((estado) => (
                  <CommandItem
                    key={estado.sigla}
                    value={estado.sigla}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                      setSearchTerm('')
                    }}
                    className="cursor-pointer hover:bg-gray-100 p-3 border-b-2 border-gray-200 last:border-b-0"
                  >
                    <Check
                      className={cn(
                        "mr-3 h-5 w-5",
                        value === estado.sigla ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{estado.nome}</span>
                      <span className="text-sm text-gray-600 font-medium">{estado.sigla}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Componente de busca por Cidade com autocompletar
interface CidadeSearchProps {
  value?: string
  onValueChange: (value: string) => void
  estadoSigla?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CidadeSearch({ 
  value, 
  onValueChange, 
  estadoSigla,
  placeholder = "Buscar por cidade...",
  className,
  disabled = false
}: CidadeSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { cidades, loading, searchCidades } = useIBGE()

  const selectedCidade = cidades.find(cidade => cidade.nome === value)

  // Buscar cidades quando o termo de busca muda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2 && estadoSigla) {
        searchCidades(searchTerm, estadoSigla)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, estadoSigla, searchCidades])

  const filteredCidades = searchTerm 
    ? cidades.filter(cidade =>
        cidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cidades.slice(0, 15) // Mostrar apenas as primeiras 15 quando não há busca

  // Reset cidade quando estado muda
  useEffect(() => {
    if (value && estadoSigla) {
      const cidadeExiste = cidades.some(cidade => cidade.nome === value)
      if (!cidadeExiste) {
        onValueChange('')
      }
    }
  }, [estadoSigla, value, cidades, onValueChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !estadoSigla}
          className={cn("w-full justify-between font-black text-lg py-3 border-4 border-black bg-white hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all", className)}
        >
          {value ? (
            <>
              <MapPin className="mr-2 h-5 w-5" />
              {selectedCidade?.nome || value}
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              {!estadoSigla ? "Selecione um estado primeiro" : placeholder}
            </>
          )}
          <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" align="start">
        <Command>
          <CommandInput 
            placeholder="Digite o nome da cidade..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="border-0 focus:ring-0"
          />
          <CommandList>
            {loading && (
              <CommandEmpty className="py-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto mb-2"></div>
                Carregando cidades...
              </CommandEmpty>
            )}
            {!loading && filteredCidades.length === 0 && searchTerm && (
              <CommandEmpty className="py-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                Nenhuma cidade encontrada para "{searchTerm}"
              </CommandEmpty>
            )}
            {!loading && filteredCidades.length > 0 && (
              <CommandGroup>
                {filteredCidades.map((cidade) => (
                  <CommandItem
                    key={cidade.id}
                    value={cidade.nome}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                      setSearchTerm('')
                    }}
                    className="cursor-pointer hover:bg-gray-100 p-3 border-b-2 border-gray-200 last:border-b-0"
                  >
                    <Check
                      className={cn(
                        "mr-3 h-5 w-5",
                        value === cidade.nome ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{cidade.nome}</span>
                      <span className="text-sm text-gray-600 font-medium">{cidade.estadoSigla}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Componente combinado de busca por localização
interface LocationSearchProps {
  estadoValue?: string
  cidadeValue?: string
  onEstadoChange: (value: string) => void
  onCidadeChange: (value: string) => void
  className?: string
}

export function LocationSearch({
  estadoValue,
  cidadeValue,
  onEstadoChange,
  onCidadeChange,
  className
}: LocationSearchProps) {
  const [selectedEstado, setSelectedEstado] = useState(estadoValue || '')
  const [selectedCidade, setSelectedCidade] = useState(cidadeValue || '')

  const handleEstadoChange = useCallback((value: string) => {
    setSelectedEstado(value)
    setSelectedCidade('') // Limpa cidade quando estado muda
    onEstadoChange(value)
    onCidadeChange('')
  }, [onEstadoChange, onCidadeChange])

  const handleCidadeChange = useCallback((value: string) => {
    setSelectedCidade(value)
    onCidadeChange(value)
  }, [onCidadeChange])

  const clearLocation = useCallback(() => {
    setSelectedEstado('')
    setSelectedCidade('')
    onEstadoChange('')
    onCidadeChange('')
  }, [onEstadoChange, onCidadeChange])

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-black flex items-center gap-2">
          <MapPin className="h-6 w-6 text-blue-500" />
          LOCALIZAÇÃO
        </h3>
        {(selectedEstado || selectedCidade) && (
          <Button
            onClick={clearLocation}
            variant="outline"
            size="sm"
            className="border-4 border-black font-black text-sm px-4 py-2 bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <X className="h-4 w-4 mr-1" />
            LIMPAR
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-lg font-black text-black mb-3 block">
            ESTADO
          </label>
          <EstadoSearch
            value={selectedEstado}
            onValueChange={handleEstadoChange}
            placeholder="Buscar estado..."
            className="w-full"
          />
        </div>

        <div>
          <label className="text-lg font-black text-black mb-3 block">
            CIDADE
          </label>
          <CidadeSearch
            value={selectedCidade}
            onValueChange={handleCidadeChange}
            estadoSigla={selectedEstado}
            placeholder="Buscar cidade..."
            className="w-full"
            disabled={!selectedEstado}
          />
        </div>
      </div>

      {/* Mostrar localização selecionada */}
      {(selectedEstado || selectedCidade) && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-lg font-black text-gray-600">LOCALIZAÇÃO SELECIONADA:</span>
          {selectedEstado && (
            <Badge className="bg-blue-500 text-white text-sm font-black px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Estado: {selectedEstado}
            </Badge>
          )}
          {selectedCidade && (
            <Badge className="bg-green-500 text-white text-sm font-black px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Cidade: {selectedCidade}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
