import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  city?: string;
  state?: string;
  address?: string;
}

export interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permission: PermissionState | null;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutos
};

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
    permission: null,
  });

  const supabase = createClientComponentClient();

  // Verificar permissão de geolocalização
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      setState(prev => ({ ...prev, permission: 'granted' }));
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setState(prev => ({ ...prev, permission: permission.state }));
      
      permission.onchange = () => {
        setState(prev => ({ ...prev, permission: permission.state }));
      };
    } catch (error) {
      console.warn('Erro ao verificar permissão de geolocalização:', error);
      setState(prev => ({ ...prev, permission: 'granted' }));
    }
  }, []);

  // Obter localização atual
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      throw new Error('Geolocalização não é suportada neste navegador');
    }

    return new Promise((resolve, reject) => {
      const opts = { ...defaultOptions, ...options };
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          // Tentar obter endereço através de geocoding reverso
          try {
            const address = await reverseGeocode(locationData.latitude, locationData.longitude);
            locationData.city = address.city;
            locationData.state = address.state;
            locationData.address = address.address;
          } catch (error) {
            console.warn('Erro ao obter endereço:', error);
          }

          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout ao obter localização';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        opts
      );
    });
  }, [options]);

  // Geocoding reverso usando Nominatim (gratuito)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`
      );
      
      if (!response.ok) {
        throw new Error('Erro na requisição de geocoding');
      }
      
      const data = await response.json();
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village || 'Cidade não encontrada',
        state: data.address?.state || 'Estado não encontrado',
        address: data.display_name || 'Endereço não encontrado',
      };
    } catch (error) {
      console.error('Erro no geocoding reverso:', error);
      throw error;
    }
  }, []);

  // Salvar localização no perfil do usuário
  const saveLocationToProfile = useCallback(async (location: LocationData) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: location.latitude,
          longitude: location.longitude,
          location_accuracy: location.accuracy,
          location_updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar localização no perfil:', error);
      throw error;
    }
  }, [supabase]);

  // Obter e salvar localização
  const getAndSaveLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const location = await getCurrentLocation();
      
      if (location) {
        await saveLocationToProfile(location);
        setState(prev => ({ 
          ...prev, 
          location, 
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false 
      }));
    }
  }, [getCurrentLocation, saveLocationToProfile]);

  // Calcular distância entre dois pontos
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Verificar permissão na inicialização
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    ...state,
    getCurrentLocation,
    getAndSaveLocation,
    reverseGeocode,
    saveLocationToProfile,
    calculateDistance,
    checkPermission,
  };
};
