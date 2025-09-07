'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { useEstados, useCidades } from '@/hooks/useIBGE'
import type { Estado, Cidade } from '@/lib/ibge'
import { services } from '@/data/services'

// Combobox para Estados
interface EstadoComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function EstadoCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Selecione o estado",
  className 
}: EstadoComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { estados, loading, error } = useEstados()

  const selectedEstado = estados.find(estado => estado.sigla === value)
  const filteredEstados = searchTerm 
    ? estados.filter(estado =>
        estado.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estado.sigla.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : estados

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {selectedEstado?.nome} ({selectedEstado?.sigla})
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {placeholder}
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar estado..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && (
              <CommandEmpty>Carregando estados...</CommandEmpty>
            )}
            {error && (
              <CommandEmpty>Erro ao carregar estados. Tente novamente.</CommandEmpty>
            )}
            {!loading && !error && filteredEstados.length === 0 && (
              <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
            )}
            {!loading && !error && filteredEstados.length > 0 && (
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
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === estado.sigla ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{estado.nome}</span>
                    <span className="text-sm text-muted-foreground">{estado.sigla}</span>
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

// Combobox para Cidades
interface CidadeComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  estadoSigla?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CidadeCombobox({ 
  value, 
  onValueChange, 
  estadoSigla,
  placeholder = "Selecione a cidade",
  className,
  disabled = false
}: CidadeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { cidades, loading: loadingCidades } = useCidades(estadoSigla || '')

  const filteredCidades = searchTerm 
    ? cidades.filter(cidade =>
        cidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cidades

  const selectedCidade = cidades.find(cidade => cidade.nome === value)

  // Reset cidade quando estado muda
  useEffect(() => {
    if (value && estadoSigla) {
      const cidadeExiste = cidades.some(cidade => cidade.nome === value)
      if (!cidadeExiste) {
        onValueChange('')
      }
    }
  }, [estadoSigla, value, cidades, onValueChange])

  // Estabilizar a função de mudança de valor
  const handleValueChange = useCallback((newValue: string) => {
    onValueChange(newValue)
  }, [onValueChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !estadoSigla}
          className={cn("w-full justify-between", className)}
        >
          {value ? (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {selectedCidade?.nome || value}
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {!estadoSigla ? "Cidade" : placeholder}
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar cidade..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loadingCidades && (
              <CommandEmpty>Carregando cidades...</CommandEmpty>
            )}
            {!loadingCidades && filteredCidades.length === 0 && (
              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            )}
            {!loadingCidades && filteredCidades.length > 0 && (
              <CommandGroup>
                {filteredCidades.map((cidade) => (
                <CommandItem
                  key={cidade.id}
                  value={cidade.nome}
                  onSelect={(currentValue) => {
                    handleValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    setSearchTerm('')
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === cidade.nome ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cidade.nome}
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

// Combobox para Categorias
interface CategoriaComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Adicionar categoria "Todas as Categorias" para filtros
const categorias = [
  { id: 'all', name: 'Todas as Categorias', icon: '🏠' },
  ...services
]

export function CategoriaCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Selecione a categoria",
  className 
}: CategoriaComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedCategoria = categorias.find(cat => cat.id === value)
  const filteredCategorias = searchTerm 
    ? categorias.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categorias

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? (
            <>
              <span className="mr-2">{selectedCategoria?.icon}</span>
              {selectedCategoria?.name}
            </>
          ) : (
            <>
              <span className="mr-2">🏠</span>
              {placeholder}
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar categoria..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
            <CommandGroup>
              {filteredCategorias.map((categoria) => (
                <CommandItem
                  key={categoria.id}
                  value={categoria.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    setSearchTerm('')
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === categoria.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{categoria.icon}</span>
                  {categoria.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
