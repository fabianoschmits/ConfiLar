import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Profile } from '@/types/database';

export interface ProximitySearchResult extends Profile {
  distance_km: number;
}

export interface ProximitySearchFilters {
  radius_km: number;
  user_type?: 'client' | 'professional';
  service?: string;
  min_rating?: number;
  is_available?: boolean;
}

export interface ProximitySearchState {
  results: ProximitySearchResult[];
  loading: boolean;
  error: string | null;
  total_count: number;
}

const defaultFilters: ProximitySearchFilters = {
  radius_km: 10,
  user_type: 'professional',
  is_available: true,
};

export const useProximitySearch = () => {
  const [state, setState] = useState<ProximitySearchState>({
    results: [],
    loading: false,
    error: null,
    total_count: 0,
  });

  const supabase = createClientComponentClient();

  // Buscar usuários por proximidade usando função SQL
  const searchByProximity = useCallback(async (
    userLat: number,
    userLon: number,
    filters: Partial<ProximitySearchFilters> = {}
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchFilters = { ...defaultFilters, ...filters };

      // Usar a função SQL personalizada para busca por proximidade
      const { data, error } = await supabase.rpc('search_users_by_proximity', {
        user_lat: userLat,
        user_lon: userLon,
        radius_km: searchFilters.radius_km,
        user_type_filter: searchFilters.user_type,
        service_filter: searchFilters.service,
      });

      if (error) {
        throw error;
      }

      // Aplicar filtros adicionais no frontend
      let filteredResults = data || [];

      if (searchFilters.min_rating) {
        filteredResults = filteredResults.filter(
          (result: ProximitySearchResult) => result.rating >= searchFilters.min_rating!
        );
      }

      if (searchFilters.is_available !== undefined) {
        filteredResults = filteredResults.filter(
          (result: ProximitySearchResult) => result.is_available === searchFilters.is_available
        );
      }

      setState(prev => ({
        ...prev,
        results: filteredResults,
        total_count: filteredResults.length,
        loading: false,
      }));

      return filteredResults;
    } catch (error) {
      console.error('Erro na busca por proximidade:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro na busca',
        loading: false,
      }));
      return [];
    }
  }, [supabase]);

  // Buscar usuários próximos com coordenadas do usuário atual
  const searchNearbyUsers = useCallback(async (
    filters: Partial<ProximitySearchFilters> = {}
  ) => {
    try {
      // Obter localização atual do usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar perfil do usuário com coordenadas
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.latitude || !profile?.longitude) {
        throw new Error('Localização do usuário não encontrada');
      }

      return await searchByProximity(
        profile.latitude,
        profile.longitude,
        filters
      );
    } catch (error) {
      console.error('Erro ao buscar usuários próximos:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro na busca',
        loading: false,
      }));
      return [];
    }
  }, [supabase, searchByProximity]);

  // Buscar usuários próximos a uma localização específica
  const searchNearLocation = useCallback(async (
    latitude: number,
    longitude: number,
    filters: Partial<ProximitySearchFilters> = {}
  ) => {
    return await searchByProximity(latitude, longitude, filters);
  }, [searchByProximity]);

  // Obter estatísticas de proximidade
  const getProximityStats = useCallback(async (
    latitude: number,
    longitude: number,
    radius_km: number = 10
  ) => {
    try {
      const { data, error } = await supabase.rpc('search_users_by_proximity', {
        user_lat: latitude,
        user_lon: longitude,
        radius_km: radius_km,
        user_type_filter: null,
        service_filter: null,
      });

      if (error) {
        throw error;
      }

      const results = data || [];
      
      return {
        total_users: results.length,
        professionals: results.filter((r: ProximitySearchResult) => r.user_type === 'professional').length,
        clients: results.filter((r: ProximitySearchResult) => r.user_type === 'client').length,
        available_professionals: results.filter((r: ProximitySearchResult) => 
          r.user_type === 'professional' && r.is_available
        ).length,
        average_rating: results.length > 0 
          ? results.reduce((sum: number, r: ProximitySearchResult) => sum + (r.rating || 0), 0) / results.length 
          : 0,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de proximidade:', error);
      return {
        total_users: 0,
        professionals: 0,
        clients: 0,
        available_professionals: 0,
        average_rating: 0,
      };
    }
  }, [supabase]);

  // Limpar resultados
  const clearResults = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
      total_count: 0,
    });
  }, []);

  return {
    ...state,
    searchByProximity,
    searchNearbyUsers,
    searchNearLocation,
    getProximityStats,
    clearResults,
  };
};
