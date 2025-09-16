'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { 
  Filter, 
  X, 
  MapPin, 
  Star, 
  Clock, 
  Shield,
  Users,
  Calendar,
  Search
} from 'lucide-react'
import { ComboboxCategorias, ComboboxEstados } from '@/components/ui/Combobox'
import { CidadeCombobox } from '@/components/ui/LocationComboboxes'

export interface SearchFilters {
  searchTerm: string
  category: string
  state: string
  city: string
  userType: 'all' | 'professional' | 'client'
  minRating: number
  maxRating: number
  verifiedOnly: boolean
  availableOnly: boolean
  sortBy: 'rating' | 'reviews' | 'name' | 'verified' | 'distance'
  sortOrder: 'asc' | 'desc'
  priceRange: [number, number]
  experienceYears: number
  hasPortfolio: boolean
  hasReviews: boolean
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
  isMobile?: boolean
  isOpen?: boolean
  onToggle?: () => void
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isMobile = false,
  isOpen = true,
  onToggle
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  const updateFilter = (key: keyof SearchFilters, value: string | number | boolean | [number, number]) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const defaultFilters: SearchFilters = {
      searchTerm: '',
      category: 'all',
      state: '',
      city: '',
      userType: 'all',
      minRating: 0,
      maxRating: 5,
      verifiedOnly: false,
      availableOnly: false,
      sortBy: 'rating',
      sortOrder: 'desc',
      priceRange: [0, 1000],
      experienceYears: 0,
      hasPortfolio: false,
      hasReviews: false
    }
    setLocalFilters(defaultFilters)
    onClearFilters()
  }

  const FilterSection = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-black text-yellow-400 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {Icon && <Icon className="h-4 w-4 text-yellow-400" />}
        <Label className="text-sm font-black text-yellow-400 uppercase">{title}</Label>
      </div>
      {children}
    </div>
  )

  const filtersContent = (
    <CardContent className="space-y-6">
      {/* Busca por Texto */}
      <FilterSection title="Busca por Texto" icon={Search}>
        <Input
          placeholder="NOME, PROFISSÃO, ESPECIALIDADE..."
          value={localFilters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black text-black placeholder:text-gray-500"
        />
      </FilterSection>

      {/* Tipo de Usuário */}
      <FilterSection title="Tipo de Usuário" icon={Users}>
        <Select value={localFilters.userType} onValueChange={(value) => updateFilter('userType', value)}>
          <SelectTrigger className="border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <SelectItem value="all" className="font-black">TODOS</SelectItem>
            <SelectItem value="professional" className="font-black">PROFISSIONAIS</SelectItem>
            <SelectItem value="client" className="font-black">CLIENTES</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      {/* Categoria */}
      <FilterSection title="Categoria de Serviço" icon={Filter}>
        <ComboboxCategorias
          value={localFilters.category}
          onValueChange={(value) => updateFilter('category', value)}
        />
      </FilterSection>

      {/* Localização */}
      <FilterSection title="Localização" icon={MapPin}>
        <div className="space-y-3">
          <ComboboxEstados
            value={localFilters.state}
            onValueChange={(value) => updateFilter('state', value)}
          />
          <CidadeCombobox
            value={localFilters.city}
            onValueChange={(value) => updateFilter('city', value)}
            estadoSigla={localFilters.state}
            disabled={!localFilters.state}
          />
        </div>
      </FilterSection>

      <Separator />

      {/* Avaliação */}
      <FilterSection title="Avaliação Mínima" icon={Star}>
        <div className="space-y-2">
          <Slider
            value={[localFilters.minRating]}
            onValueChange={(value) => updateFilter('minRating', value[0])}
            max={5}
            min={0}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.0</span>
            <span className="font-medium">{localFilters.minRating.toFixed(1)}</span>
            <span>5.0</span>
          </div>
        </div>
      </FilterSection>

      {/* Anos de Experiência */}
      <FilterSection title="Experiência Mínima" icon={Clock}>
        <div className="space-y-2">
          <Slider
            value={[localFilters.experienceYears]}
            onValueChange={(value) => updateFilter('experienceYears', value[0])}
            max={20}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 anos</span>
            <span className="font-medium">{localFilters.experienceYears} anos</span>
            <span>20+ anos</span>
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* Filtros de Qualidade */}
      <FilterSection title="Qualidade" icon={Shield}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified-only"
              checked={localFilters.verifiedOnly}
              onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
            />
            <Label htmlFor="verified-only" className="text-sm">
              Apenas verificados
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available-only"
              checked={localFilters.availableOnly}
              onCheckedChange={(checked) => updateFilter('availableOnly', checked)}
            />
            <Label htmlFor="available-only" className="text-sm">
              Apenas disponíveis
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-portfolio"
              checked={localFilters.hasPortfolio}
              onCheckedChange={(checked) => updateFilter('hasPortfolio', checked)}
            />
            <Label htmlFor="has-portfolio" className="text-sm">
              Com portfólio
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-reviews"
              checked={localFilters.hasReviews}
              onCheckedChange={(checked) => updateFilter('hasReviews', checked)}
            />
            <Label htmlFor="has-reviews" className="text-sm">
              Com avaliações
            </Label>
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* Ordenação */}
      <FilterSection title="Ordenar por" icon={Calendar}>
        <div className="space-y-3">
          <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Avaliação</SelectItem>
              <SelectItem value="reviews">Número de Avaliações</SelectItem>
              <SelectItem value="name">Nome A-Z</SelectItem>
              <SelectItem value="verified">Verificados Primeiro</SelectItem>
              <SelectItem value="distance">Distância</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={localFilters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value)}>
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Maior para Menor</SelectItem>
              <SelectItem value="asc">Menor para Maior</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterSection>

      {/* Botão Limpar Filtros Brutalista */}
      <Button
        onClick={handleClearFilters}
        className="w-full bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black py-3"
      >
        <X className="h-4 w-4 mr-2" />
        LIMPAR TODOS OS FILTROS
      </Button>
    </CardContent>
  )

  if (isMobile) {
    return (
      <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="mb-4 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-black text-yellow-400 p-4 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-yellow-400" />
                <h3 className="text-lg font-black text-yellow-400 uppercase">FILTROS AVANÇADOS</h3>
              </div>
              <Button
                onClick={onToggle}
                className="h-8 w-8 p-0 bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-6">
            {filtersContent}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden lg:block lg:w-80 flex-shrink-0">
      <div className="sticky top-8 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-black text-yellow-400 p-4 border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-black text-yellow-400 uppercase">FILTROS AVANÇADOS</h3>
          </div>
        </div>
        <div className="p-6">
          {filtersContent}
        </div>
      </div>
    </div>
  )
}
