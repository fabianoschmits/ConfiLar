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
  SlidersHorizontal,
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
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { services } from "@/data/services";
import { normalizeSearchTerm, SYNONYM_MAP } from "@/lib/searchUtils";
import { useAuthContext } from "@/contexts/AuthContext";

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
  const [modalFilters, setModalFilters] =
    useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { estados, cidades, loadCidades } = useIBGE();
  const { profile } = useAuthContext();

  // Helper function to auto-fill location
  const handleOpenFilters = () => {
    let initialModalState = { ...filters };

    // Auto-fill state and city from profile if not already set
    if (!initialModalState.state && profile?.location_state) {
      // Find the state by name or sigla
      const stateToFind = profile.location_state;
      const est = estados.find(
        (e) =>
          e.nome === stateToFind ||
          e.sigla === stateToFind ||
          e.sigla === stateToFind.toUpperCase(),
      );

      if (est) {
        initialModalState.state = est.nome;

        // Also pre-fill city if state is found
        if (!initialModalState.city && profile?.location_city) {
          initialModalState.city = profile.location_city;
        }

        loadCidades(est.sigla);
      }
    }

    setModalFilters(initialModalState);
    setShowFilters(true);
  };

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
    if (!debouncedQuery || debouncedQuery.length < 2) {
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
    const chips: { key: string; label: string; value: string }[] = [];

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
      let label = "Disponibilidade";
      switch (filters.availability) {
        case "manha":
          label = "Manhã";
          break;
        case "tarde":
          label = "Tarde";
          break;
        case "noite":
          label = "Noite";
          break;
        case "integral":
          label = "Integral";
          break;
        case "flexivel":
          label = "Flexível";
          break;
      }
      chips.push({
        key: "availability",
        label: `Turno: ${label}`,
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
      <div className="flex flex-row items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
        {/* Campo Único: Busca (Serviços, Profissionais, Localização indireta) */}
        <div className="flex-1 relative min-w-0">
          <div className="flex items-center px-3 h-10">
            <Search className="text-gray-400 dark:text-gray-500 h-5 w-5 mr-3 shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Encontre serviços ou profissionais..."
              className="border-none focus-visible:ring-0 bg-transparent p-0 text-base h-full placeholder:text-gray-400 w-full"
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

        {/* Botão de Busca e Filtros Avançados */}
        <div className="flex items-center gap-2 px-1">
          {showAdvancedFilters && (
            <Button
              variant="outline"
              onClick={handleOpenFilters}
              className={`h-10 px-3 flex items-center gap-2 shrink-0 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
          )}
          <Button
            onClick={handleSearch}
            className="h-10 px-3 sm:px-6 bg-[#00b0b0] hover:bg-[#009090] text-white font-bold rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Search className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Buscar</span>
          </Button>
        </div>
      </div>

      {/* Filtros visuais com chips */}
      {getFilterChips().length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 px-1">
          {getFilterChips().map((chip) => (
            <div
              key={chip.key}
              className="flex items-center gap-1.5 text-blue-900 dark:text-blue-100 text-xs sm:text-[13px] font-bold tracking-wide"
            >
              <span>{chip.label}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFilter(chip.key as keyof SearchFilters);
                }}
                className="text-blue-900/40 hover:text-red-500 dark:text-blue-100/40 dark:hover:text-red-400 transition-colors ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-xs h-6 px-2"
          >
            Limpar todos
          </Button>
        </div>
      )}

      {/* Modal de Filtros Avançados */}
      <ResponsiveModal
        isOpen={showFilters}
        onOpenChange={setShowFilters}
        title={
          <div className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary-500" />
            Filtros Avançados
          </div>
        }
        description="Refine sua busca para encontrar os melhores profissionais e clientes."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                const cleared = {
                  ...modalFilters,
                  state: "",
                  city: "",
                  service: "all",
                  rating: "all",
                  availability: "all",
                  userType: "all",
                };
                setModalFilters(cleared);
              }}
              className="text-gray-500"
            >
              Limpar Tudo
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowFilters(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-[#00b0b0] hover:bg-[#009090] text-white"
              onClick={() => {
                const newFilters = { ...modalFilters, searchTerm: query };
                setFilters(newFilters);
                onSearch(query, newFilters);
                onFiltersChange(newFilters);
                setShowFilters(false);
              }}
            >
              Mostrar Resultados
            </Button>
          </>
        }
      >
        <div className="space-y-6 pb-4 pt-2">
          {/* Sessão Localização */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
              <MapPin className="h-4 w-4 text-primary-500" />
              Localização
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Estado
                </label>
                <EstadoCombobox
                  value={modalFilters.state}
                  onValueChange={(newState) => {
                    setModalFilters((prev) => ({
                      ...prev,
                      state: newState,
                      city: "",
                    }));
                  }}
                  placeholder="Todos"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Cidade
                </label>
                <CidadeCombobox
                  value={modalFilters.city}
                  onValueChange={(newCity) =>
                    setModalFilters((prev) => ({ ...prev, city: newCity }))
                  }
                  estadoSigla={modalFilters.state}
                  placeholder="Todas"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800" />

          {/* Sessão Serviço */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
              <Briefcase className="h-4 w-4 text-primary-500" />
              Especialidade
            </h4>
            <select
              value={modalFilters.service}
              onChange={(e) =>
                setModalFilters((prev) => ({
                  ...prev,
                  service: e.target.value,
                }))
              }
              className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
            >
              <option value="all">Todos os serviços</option>
              {services.map((service) => (
                <option key={service.name} value={service.name}>
                  {service.icon} {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-800" />

          {/* Sessão Perfil */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
              <Star className="h-4 w-4 text-primary-500" />
              Perfil
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Avaliação mínima
                </label>
                <select
                  value={modalFilters.rating}
                  onChange={(e) =>
                    setModalFilters((prev) => ({
                      ...prev,
                      rating: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                >
                  <option value="all">Qualquer</option>
                  <option value="4">4+ estrelas ⭐</option>
                  <option value="3">3+ estrelas ⭐</option>
                  <option value="2">2+ estrelas ⭐</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Disponibilidade
                </label>
                <select
                  value={modalFilters.availability}
                  onChange={(e) =>
                    setModalFilters((prev) => ({
                      ...prev,
                      availability: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                >
                  <option value="all">Qualquer</option>
                  <option value="manha">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                  <option value="integral">Integral</option>
                  <option value="flexivel">Flexível</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Tipo de Usuário
                </label>
                <select
                  value={modalFilters.userType}
                  onChange={(e) =>
                    setModalFilters((prev) => ({
                      ...prev,
                      userType: e.target.value,
                    }))
                  }
                  className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                >
                  <option value="all">Todos</option>
                  <option value="professional">Profissionais</option>
                  <option value="client">Clientes</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}
