"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Profile } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { normalizeSearchTerm, expandSearchTerm } from "@/lib/searchUtils";
export interface SearchFilters {
  searchTerm: string;
  category: string;
  state: string;
  city: string;
  userType: string;
  minRating: number;
  maxRating: number;
  verifiedOnly: boolean;
  availability: string;
  sortBy: string;
  sortOrder: string;
  priceRange: [number, number];
  experienceYears: number;
  hasPortfolio: boolean;
  hasReviews: boolean;
}

const DEFAULT_FILTERS: SearchFilters = {
  searchTerm: "",
  category: "all",
  state: "",
  city: "",
  userType: "all",
  minRating: 0,
  maxRating: 5,
  verifiedOnly: false,
  availability: "all",
  sortBy: "rating",
  sortOrder: "desc",
  priceRange: [0, 1000],
  experienceYears: 0,
  hasPortfolio: false,
  hasReviews: false,
};

export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar usuários do Supabase com filtros no servidor
  const loadUsers = useCallback(async (currentFilters: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      // Limpar resultados imediatamente para evitar mostrar dados antigos
      setFilteredUsers([]);

      let query = supabase.from("profiles").select("*", { count: "exact" });

      // 0. Filtrar perfis ocultos (Admin/Testes)
      query = query.eq("is_hidden", false);

      // 1. Regras de Visibilidade Base (Marketplace)
      // Mostrar tanto profissionais quanto clientes, dependendo do filtro userType
      if (currentFilters.userType && currentFilters.userType !== "all") {
        query = query.eq("user_type", currentFilters.userType);

        // Apenas profissionais precisam estar aprovados
        if (currentFilters.userType === "professional") {
          query = query.eq("is_approved", true);
        }
      }
      // Se userType for "all" ou não especificado, não filtrar por tipo

      // 2. Filtros de Localização (SQL)
      if (currentFilters.state) {
        query = query.eq("location_state", currentFilters.state);
      }
      if (currentFilters.city) {
        query = query.eq("location_city", currentFilters.city);
      }

      // 3. Filtro de Categoria (SQL)
      if (currentFilters.category && currentFilters.category !== "all") {
        query = query.contains("professional_services", [
          currentFilters.category,
        ]);
      }

      // Ordenação Padrão: Membros PRO primeiro, depois por avaliação
      query = query
        .order("is_pro", { ascending: false, nullsFirst: false })
        .order("rating", { ascending: false });

      // Limite para performance (Paginação pode ser adicionada depois)
      query = query.limit(100);

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("❌ Erro ao carregar usuários:", fetchError);
        setError("Erro ao carregar usuários");
        setAllUsers([]);
        setFilteredUsers([]);
        return;
      }

      console.log("📊 Usuários carregados (SQL):", data?.length || 0);

      // Sempre atualizar, mesmo se vazio
      const users = (data || []) as unknown as Profile[];
      setAllUsers(users);

      // Se não houver dados, limpar filteredUsers imediatamente
      if (users.length === 0) {
        setFilteredUsers([]);
      }
    } catch (err) {
      console.error("❌ Erro ao carregar usuários:", err);
      setError("Erro inesperado ao carregar usuários");
      setAllUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros aos usuários
  const applyFilters = useCallback(
    (users: Profile[], currentFilters: SearchFilters) => {
      let filtered = [...users];

      // Filtro por termo de busca (Refinado cliente-side para manter expansão inteligente)
      if (currentFilters.searchTerm.trim()) {
        const expandedTerms = expandSearchTerm(currentFilters.searchTerm);

        filtered = filtered.filter((user) => {
          const nameMatch = expandedTerms.some((term) =>
            user.full_name
              ?.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(term),
          );
          const bioMatch = expandedTerms.some((term) =>
            user.bio
              ?.toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(term),
          );
          const servicesMatch = user.professional_services?.some((service) => {
            const normalizedService = normalizeSearchTerm(service);
            return expandedTerms.some(
              (term) =>
                normalizedService.includes(term) ||
                term.includes(normalizedService),
            );
          });
          return nameMatch || bioMatch || servicesMatch;
        });
      }

      // Os filtros de Categoria, Cidade e Estado agora são feitos no SQL (loadUsers)
      // Mantemos aqui outros filtros específicos que são mais fáceis de aplicar no cliente

      // Filtro por avaliação mínima
      if (currentFilters.minRating > 0) {
        filtered = filtered.filter(
          (user) => (user.rating || 0) >= currentFilters.minRating,
        );
      }

      // Filtro por avaliação máxima
      if (currentFilters.maxRating < 5) {
        filtered = filtered.filter(
          (user) => (user.rating || 0) <= currentFilters.maxRating,
        );
      }

      // Filtro por usuários verificados
      if (currentFilters.verifiedOnly) {
        filtered = filtered.filter((user) => user.is_verified);
      }

      // Filtro por turno de trabalho (Disponibilidade)
      if (
        currentFilters.availability &&
        currentFilters.availability !== "all"
      ) {
        filtered = filtered.filter(
          (user) => user.turno_trabalho === currentFilters.availability,
        );
      }

      // Filtro por anos de experiência
      if (currentFilters.experienceYears > 0) {
        filtered = filtered.filter((user) => {
          const years = user.professional_experience_years || 0;
          return years >= currentFilters.experienceYears;
        });
      }

      // Filtro por usuários com portfólio
      if (currentFilters.hasPortfolio) {
        filtered = filtered.filter((user) => {
          return (
            user.professional_portfolio_url !== null &&
            user.professional_portfolio_url !== undefined
          );
        });
      }

      // Filtro por usuários com avaliações
      if (currentFilters.hasReviews) {
        filtered = filtered.filter((user) => (user.total_reviews || 0) > 0);
      }

      return filtered;
    },
    [],
  );

  // Ordenar usuários
  const sortUsers = useCallback(
    (users: Profile[], currentFilters: SearchFilters) => {
      const sorted = [...users];

      switch (currentFilters.sortBy) {
        case "rating":
          sorted.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return currentFilters.sortOrder === "desc"
              ? ratingB - ratingA
              : ratingA - ratingB;
          });
          break;

        case "reviews":
          sorted.sort((a, b) => {
            const reviewsA = a.total_reviews || 0;
            const reviewsB = b.total_reviews || 0;
            return currentFilters.sortOrder === "desc"
              ? reviewsB - reviewsA
              : reviewsA - reviewsB;
          });
          break;

        case "name":
          sorted.sort((a, b) => {
            const nameA = a.full_name || "";
            const nameB = b.full_name || "";
            return currentFilters.sortOrder === "desc"
              ? nameB.localeCompare(nameA)
              : nameA.localeCompare(nameB);
          });
          break;

        case "verified":
          sorted.sort((a, b) => {
            const verifiedA = a.is_verified ? 1 : 0;
            const verifiedB = b.is_verified ? 1 : 0;
            return currentFilters.sortOrder === "desc"
              ? verifiedB - verifiedA
              : verifiedA - verifiedB;
          });
          break;

        case "distance":
          // TODO: Implementar ordenação por distância
          // Por enquanto, mantém a ordenação atual
          break;
      }

      return sorted;
    },
    [],
  );

  // Aplicar filtros e ordenação quando os filtros mudarem
  useEffect(() => {
    if (allUsers.length === 0) return;

    const filtered = applyFilters(allUsers, filters);
    const sorted = sortUsers(filtered, filters);
    setFilteredUsers(sorted);
  }, [allUsers, filters, applyFilters, sortUsers]);

  // Carregar usuários quando os filtros de SQL mudarem
  useEffect(() => {
    loadUsers(filters);
  }, [
    filters.category,
    filters.city,
    filters.state,
    filters.userType,
    loadUsers,
  ]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Limpar todos os filtros
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Executar busca
  const executeSearch = useCallback(() => {
    // Os filtros já são aplicados automaticamente via useEffect
    console.log("🔍 Executando busca com filtros:", filters);
  }, [filters]);

  // Estatísticas dos resultados
  const stats = useMemo(() => {
    const totalUsers = allUsers.length;
    const filteredCount = filteredUsers.length;
    const professionalsCount = allUsers.filter(
      (u) => u.user_type === "professional",
    ).length;
    const clientsCount = allUsers.filter(
      (u) => u.user_type === "client",
    ).length;
    const verifiedCount = allUsers.filter((u) => u.is_verified).length;

    // Lógica de Recomendações Profissionais
    let recommendations: Profile[] = [];
    if (
      filteredCount === 0 &&
      (filters.searchTerm || filters.category !== "all")
    ) {
      const expandedTerms = expandSearchTerm(
        filters.searchTerm || filters.category,
      );

      recommendations = allUsers
        .filter(
          (user) =>
            user.user_type === "professional" &&
            user.professional_services?.some((service) => {
              const normalized = normalizeSearchTerm(service);
              return expandedTerms.some(
                (term) =>
                  normalized.includes(term) || term.includes(normalized),
              );
            }),
        )
        .slice(0, 3);

      // Se ainda não tiver nada, pegar profissionais aleatórios (ou mais recentes)
      if (recommendations.length === 0) {
        recommendations = allUsers
          .filter((u) => u.user_type === "professional")
          .sort(() => 0.5 - Math.random()) // Fake shuffle for recommendations
          .slice(0, 3);
      }
    }

    return {
      totalUsers,
      filteredCount,
      professionalsCount,
      clientsCount,
      verifiedCount,
      hasResults: filteredCount > 0,
      hasFilters: JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS),
      recommendations,
    };
  }, [allUsers, filteredUsers, filters]);

  return {
    // Estado
    filters,
    allUsers,
    filteredUsers,
    loading,
    error,
    stats,

    // Ações
    updateFilters,
    clearFilters,
    executeSearch,
    loadUsers,

    // Utilitários
    DEFAULT_FILTERS,
  };
};
