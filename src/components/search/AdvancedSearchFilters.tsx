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
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <Label className="text-sm font-medium text-foreground">{title}</Label>
      </div>
      {children}
    </div>
  )

  const filtersContent = (
    <CardContent className="space-y-6">
      {/* Busca por Texto */}
      <FilterSection title="Busca por Texto" icon={Search}>
        <Input
          placeholder="Nome, profissão, especialidade..."
          value={localFilters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="rounded-lg"
        />
      </FilterSection>

      {/* Tipo de Usuário */}
      <FilterSection title="Tipo de Usuário" icon={Users}>
        <Select value={localFilters.userType} onValueChange={(value) => updateFilter('userType', value)}>
          <SelectTrigger className="rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="professional">Profissionais</SelectItem>
            <SelectItem value="client">Clientes</SelectItem>
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

      {/* Botão Limpar Filtros */}
      <Button
        variant="outline"
        onClick={handleClearFilters}
        className="w-full rounded-lg border-2 hover:bg-red-50 hover:border-red-300"
      >
        <X className="h-4 w-4 mr-2" />
        Limpar Todos os Filtros
      </Button>
    </CardContent>
  )

  if (isMobile) {
    return (
      <div className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <Card className="mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {filtersContent}
        </Card>
      </div>
    )
  }

  return (
    <div className="hidden lg:block lg:w-80 flex-shrink-0">
      <Card className="sticky top-8">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </CardTitle>
        </CardHeader>
        {filtersContent}
      </Card>
    </div>
  )
}
