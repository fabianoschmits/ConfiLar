"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  X,
  Filter,
  MapPin,
  Star,
  Users,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useIBGE } from "@/hooks/useIBGE";
import {
  EstadoCombobox,
  CidadeCombobox,
} from "@/components/ui/LocationComboboxes";
import { services } from "@/data/services";
import { normalizeSearchTerm, SYNONYM_MAP } from "@/lib/searchUtils";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "service" | "location" | "professional" | "recent";
  icon?: string;
}

interface SmartSearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  placeholder?: string;
  className?: string;
  showAdvancedFilters?: boolean;
}

interface SearchFilters {
  searchTerm: string;
  state: string;
  city: string;
  service: string;
  rating: string;
  availability: string;
  userType: string;
}

export function SmartSearchBar({
  onSearch,
  onFiltersChange,
  initialFilters = {
    searchTerm: "",
    state: "",
    city: "",
    service: "all",
    rating: "all",
    availability: "all",
    userType: "all",
  },
  placeholder = "Buscar profissionais, serviços...",
  className = "",
  showAdvancedFilters = true,
}: SmartSearchBarProps) {
  const [query, setQuery] = useState(initialFilters.searchTerm);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { estados, cidades, loadCidades } = useIBGE();

  // Debounce para sugestões
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Gerar sugestões baseadas na query
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const generateSuggestions = (): SearchSuggestion[] => {
      const queryLower = debouncedQuery.toLowerCase();
      const normalizedQuery = normalizeSearchTerm(debouncedQuery);
      const suggestions: SearchSuggestion[] = [];

      // 1. Sugestões de categorias exatas (usando termo normalizado para bater plurais)
      services.forEach((service) => {
        const normalizedServiceName = normalizeSearchTerm(service.name);
        if (
          service.name.toLowerCase().includes(queryLower) ||
          normalizedServiceName.includes(normalizedQuery)
        ) {
          suggestions.push({
            id: `service-${service.name}`,
            text: service.name,
            type: "service",
            icon: service.icon,
          });
        }
      });

      // 2. Sugestões baseadas em sinônimos
      if (suggestions.length < 5) {
        Object.entries(SYNONYM_MAP).forEach(([category, synonyms]) => {
          const alreadyAdded = suggestions.some(
            (s) => s.text.toLowerCase() === category.toLowerCase(),
          );
          if (alreadyAdded) return;

          const match = synonyms.some((syn) => {
            const normalizedSyn = normalizeSearchTerm(syn);
            return (
              syn.toLowerCase().includes(queryLower) ||
              normalizedSyn.includes(normalizedQuery)
            );
          });

          if (match) {
            // Tentar achar o ícone do serviço correspondente
            const service = services.find(
              (s) => s.name.toLowerCase() === category.toLowerCase(),
            );
            suggestions.push({
              id: `synonym-${category}`,
              text: category.charAt(0).toUpperCase() + category.slice(1),
              type: "service",
              icon: service?.icon || "🔍",
            });
          }
        });
      }

      // 3. Sugestões de estados
      estados.forEach((estado) => {
        if (estado.nome.toLowerCase().includes(queryLower)) {
          suggestions.push({
            id: `state-${estado.sigla}`,
            text: estado.nome,
            type: "location",
            icon: "📍",
          });
        }
      });

      // 4. Sugestões de cidades (se estado selecionado)
      if (filters.state && cidades.length > 0) {
        cidades.forEach((cidade) => {
          if (cidade.nome.toLowerCase().includes(queryLower)) {
            suggestions.push({
              id: `city-${cidade.nome}`,
              text: cidade.nome,
              type: "location",
              icon: "🏙️",
            });
          }
        });
      }

      return suggestions.slice(0, 8); // Aumentar limite para 8
    };

    setSuggestions(generateSuggestions());
  }, [debouncedQuery, estados, cidades, filters.state]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);

    // Aplicar filtro baseado no tipo de sugestão
    if (suggestion.type === "service") {
      const newFilters = {
        ...filters,
        service: suggestion.text,
        searchTerm: suggestion.text,
      };
      setFilters(newFilters);
      onSearch(suggestion.text, newFilters);
      onFiltersChange(newFilters);
    } else if (suggestion.type === "location") {
      // Detectar se é estado ou cidade
      const estado = estados.find((estado) => estado.nome === suggestion.text);
      if (estado) {
        const newFilters = { ...filters, state: suggestion.text, city: "" };
        setFilters(newFilters);
        loadCidades(estado.sigla);
        onFiltersChange(newFilters);
      } else {
        const newFilters = { ...filters, city: suggestion.text };
        setFilters(newFilters);
        onFiltersChange(newFilters);
      }
    }
  };

  const handleSearch = () => {
    const normalizedQuery = normalizeSearchTerm(query);
    const searchFilters = { ...filters, searchTerm: query }; // Manter query original para UI mas hook usa normalize internamente
    setFilters(searchFilters);
    onSearch(query, searchFilters);
    onFiltersChange(searchFilters);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: "",
      state: "",
      city: "",
      service: "all",
      rating: "all",
      availability: "all",
      userType: "all",
    };
    setFilters(clearedFilters);
    setQuery("");
    onFiltersChange(clearedFilters);
  };

  const removeFilter = (filterKey: keyof SearchFilters) => {
    const newFilters = {
      ...filters,
      [filterKey]: filterKey === "service" ? "all" : "",
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getFilterChips = () => {
    const chips = [];

    if (filters.state) {
      chips.push({
        key: "state",
        label: `Estado: ${filters.state}`,
        value: filters.state,
      });
    }
    if (filters.city) {
      chips.push({
        key: "city",
        label: `Cidade: ${filters.city}`,
        value: filters.city,
      });
    }
    if (filters.service !== "all") {
      chips.push({
        key: "service",
        label: `Serviço: ${filters.service}`,
        value: filters.service,
      });
    }
    if (filters.rating !== "all") {
      chips.push({
        key: "rating",
        label: `Avaliação: ${filters.rating}+`,
        value: filters.rating,
      });
    }
    if (filters.availability !== "all") {
      chips.push({
        key: "availability",
        label: `Disponível`,
        value: filters.availability,
      });
    }
    if (filters.userType !== "all") {
      chips.push({
        key: "userType",
        label: `Tipo: ${filters.userType}`,
        value: filters.userType,
      });
    }

    return chips;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Barra de busca principal - Estilo Marketplace */}
      <div className="flex flex-col md:flex-row gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
        {/* Campo 1: O Que Pesquisar (Serviços) */}
        <div className="flex-1 md:flex-none md:w-64 lg:w-80 relative">
          <div className="flex items-center px-3 h-10">
            <Search className="text-gray-400 dark:text-gray-500 h-5 w-5 mr-3 shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Encontre serviços ou profissionais..."
              className="border-none focus-visible:ring-0 bg-transparent p-0 text-base h-full placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Sugestões de Serviço */}
          {showSuggestions &&
            suggestions.filter((s) => s.type === "service").length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-3 z-50 shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-60 overflow-y-auto">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  Serviços Recomendados
                </div>
                <CardContent className="p-0">
                  {suggestions
                    .filter((s) => s.type === "service")
                    .map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-3 transition-colors text-sm"
                      >
                        <span>{suggestion.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {suggestion.text}
                        </span>
                      </button>
                    ))}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Divisor Visual (Desktop) */}
        <div className="hidden md:block w-[1px] bg-gray-200 dark:bg-gray-800 my-2"></div>

        {/* Campo 2: Onde Pesquisar (Localização) */}
        <div className="w-full md:w-auto md:max-w-xs lg:max-w-sm relative">
          <div className="flex flex-col md:flex-row md:items-center gap-2 px-3 py-2 md:py-0 md:h-10">
            <MapPin className="hidden md:block text-gray-400 dark:text-gray-500 h-5 w-5 mr-2 shrink-0" />
            <div className="flex flex-col md:flex-row flex-1 gap-2">
              <div className="flex-1 min-w-0">
                <EstadoCombobox
                  value={filters.state}
                  onValueChange={(val) => {
                    const newFilters = { ...filters, state: val, city: "" };
                    setFilters(newFilters);
                    loadCidades(val);
                    onFiltersChange(newFilters);
                  }}
                  className="w-full"
                />
              </div>
              {filters.state && (
                <div className="flex-1 min-w-0">
                  <CidadeCombobox
                    estadoSigla={filters.state}
                    value={filters.city}
                    onValueChange={(val) => {
                      const newFilters = { ...filters, city: val };
                      setFilters(newFilters);
                      onFiltersChange(newFilters);
                    }}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divisor Visual (Desktop) */}
        <div className="hidden md:block w-[1px] bg-gray-200 dark:bg-gray-800 my-2"></div>

        {/* Botão de Busca e Filtros */}
        <div className="flex items-center gap-2 px-1">
          {showAdvancedFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-10 w-10 shrink-0 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${showFilters ? "bg-blue-50 border-blue-200 text-blue-600" : "text-gray-600 dark:text-gray-400"}`}
            >
              <Filter className="h-5 w-5" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Filtros visuais com chips */}
      {getFilterChips().length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {getFilterChips().map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="px-2 py-0.5 bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer text-xs"
            >
              {chip.label}
              <button
                onClick={() => removeFilter(chip.key as keyof SearchFilters)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 text-xs h-6 px-2"
          >
            Limpar
          </Button>
        </div>
      )}

      {/* Filtros avançados - Escondidos por padrão */}
      {showFilters && showAdvancedFilters && (
        <Card className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filtros Avançados
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Estado */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Estado
              </label>
              <EstadoCombobox
                value={filters.state}
                onValueChange={(newState) => {
                  setFilters((prev) => ({
                    ...prev,
                    state: newState,
                    city: "",
                  }));
                }}
                placeholder="Digite ou selecione o estado"
                className="w-full"
              />
            </div>

            {/* Cidade */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Cidade
              </label>
              <CidadeCombobox
                value={filters.city}
                onValueChange={(newCity) =>
                  setFilters((prev) => ({ ...prev, city: newCity }))
                }
                estadoSigla={filters.state}
                placeholder="Digite ou selecione a cidade"
                className="w-full"
              />
            </div>

            {/* Serviço */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Serviço
              </label>
              <select
                value={filters.service}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, service: e.target.value }))
                }
                className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os serviços</option>
                {services.map((service) => (
                  <option key={service.name} value={service.name}>
                    {service.icon} {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Avaliação */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Avaliação mínima
              </label>
              <select
                value={filters.rating}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, rating: e.target.value }))
                }
                className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Qualquer avaliação</option>
                <option value="4">4+ estrelas</option>
                <option value="3">3+ estrelas</option>
                <option value="2">2+ estrelas</option>
              </select>
            </div>

            {/* Disponibilidade */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Disponibilidade
              </label>
              <select
                value={filters.availability}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    availability: e.target.value,
                  }))
                }
                className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="available">Disponível agora</option>
                <option value="this_week">Esta semana</option>
                <option value="this_month">Este mês</option>
              </select>
            </div>

            {/* Tipo de usuário */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Tipo
              </label>
              <select
                value={filters.userType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, userType: e.target.value }))
                }
                className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="professional">Profissionais</option>
                <option value="client">Clientes</option>
              </select>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600 dark:text-gray-400 text-xs h-7 px-2"
            >
              Limpar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleSearch();
                setShowFilters(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-xs h-7 px-3"
            >
              Aplicar
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
