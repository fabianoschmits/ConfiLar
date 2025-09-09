-- =====================================================
-- ADICIONAR CAMPOS DE GEOLOCALIZAÇÃO À TABELA PROFILES
-- =====================================================

-- Adicionar campos de coordenadas geográficas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_accuracy DECIMAL(8, 2),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.profiles.latitude IS 'Latitude da localização do usuário (coordenada Y)';
COMMENT ON COLUMN public.profiles.longitude IS 'Longitude da localização do usuário (coordenada X)';
COMMENT ON COLUMN public.profiles.location_accuracy IS 'Precisão da localização em metros';
COMMENT ON COLUMN public.profiles.location_updated_at IS 'Data da última atualização da localização';

-- Criar índice para consultas espaciais eficientes
CREATE INDEX IF NOT EXISTS idx_profiles_location 
ON public.profiles USING GIST (
  ST_Point(longitude, latitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Criar função para calcular distância entre dois pontos
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL(10, 8),
  lon1 DECIMAL(11, 8),
  lat2 DECIMAL(10, 8),
  lon2 DECIMAL(11, 8)
) RETURNS DECIMAL AS $$
BEGIN
  -- Fórmula de Haversine para calcular distância em quilômetros
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * 
      cos(radians(lat2)) * 
      cos(radians(lon2) - radians(lon1)) + 
      sin(radians(lat1)) * 
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Criar função para buscar usuários por proximidade
CREATE OR REPLACE FUNCTION search_users_by_proximity(
  user_lat DECIMAL(10, 8),
  user_lon DECIMAL(11, 8),
  radius_km DECIMAL DEFAULT 10,
  user_type_filter TEXT DEFAULT NULL,
  service_filter TEXT DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  full_name TEXT,
  user_type TEXT,
  location_city TEXT,
  location_state TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  distance_km DECIMAL,
  professional_services TEXT[],
  rating DECIMAL(3,2),
  total_reviews INTEGER,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.user_type,
    p.location_city,
    p.location_state,
    p.latitude,
    p.longitude,
    calculate_distance(user_lat, user_lon, p.latitude, p.longitude) AS distance_km,
    p.professional_services,
    p.rating,
    p.total_reviews,
    p.is_available
  FROM public.profiles p
  WHERE 
    p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, p.latitude, p.longitude) <= radius_km
    AND (user_type_filter IS NULL OR p.user_type = user_type_filter)
    AND (service_filter IS NULL OR service_filter = ANY(p.professional_services))
    AND p.id != auth.uid() -- Excluir o próprio usuário
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar extensão PostGIS se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS postgis;

-- Criar trigger para atualizar location_updated_at quando coordenadas mudarem
CREATE OR REPLACE FUNCTION update_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude THEN
    NEW.location_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_location_timestamp();

-- Comentários finais
COMMENT ON FUNCTION calculate_distance IS 'Calcula distância entre dois pontos geográficos em quilômetros usando fórmula de Haversine';
COMMENT ON FUNCTION search_users_by_proximity IS 'Busca usuários por proximidade com filtros opcionais de tipo e serviço';
