'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';

interface ProximityFilterProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
  currentLocation?: { lat: number; lng: number } | null;
  className?: string;
}

export function ProximityFilter({
  radius,
  onRadiusChange,
  onLocationChange,
  currentLocation,
  className = '',
}: ProximityFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    location, 
    loading, 
    error, 
    permission, 
    getAndSaveLocation,
    calculateDistance 
  } = useGeolocation();

  // Atualizar localização quando obtida
  useEffect(() => {
    if (location) {
      onLocationChange({
        lat: location.latitude,
        lng: location.longitude,
      });
    }
  }, [location, onLocationChange]);

  // Definir localização atual se disponível
  useEffect(() => {
    if (currentLocation) {
      onLocationChange(currentLocation);
    }
  }, [currentLocation, onLocationChange]);

  const handleGetLocation = async () => {
    try {
      await getAndSaveLocation();
      toast.success('Localização obtida com sucesso!');
    } catch (error) {
      toast.error('Erro ao obter localização. Verifique as permissões.');
    }
  };

  const getRadiusLabel = (value: number) => {
    if (value < 1) return `${Math.round(value * 1000)}m`;
    if (value < 10) return `${value.toFixed(1)}km`;
    return `${value}km`;
  };

  const getRadiusDescription = (value: number) => {
    if (value <= 1) return 'Muito próximo';
    if (value <= 5) return 'Próximo';
    if (value <= 10) return 'Moderado';
    if (value <= 25) return 'Distante';
    return 'Muito distante';
  };

  const isLocationAvailable = location || currentLocation;
  const hasPermission = permission === 'granted' || permission === 'prompt';

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4" />
          Busca por Proximidade
          {isExpanded ? (
            <Badge variant="secondary" className="ml-auto">
              {getRadiusLabel(radius)}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Status da Localização */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isLocationAvailable ? 'Localização disponível' : 'Localização não disponível'}
              </span>
            </div>
            
            {!isLocationAvailable && hasPermission && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGetLocation}
                disabled={loading}
                className="text-xs"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                ) : (
                  <Target className="w-3 h-3 mr-1" />
                )}
                Obter Localização
              </Button>
            )}
          </div>

          {/* Erro de Permissão */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Slider de Raio */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="radius-slider" className="text-sm font-medium">
                Raio de Busca
              </Label>
              <Badge variant="outline" className="text-xs">
                {getRadiusLabel(radius)}
              </Badge>
            </div>
            
            <Slider
              id="radius-slider"
              min={0.1}
              max={50}
              step={0.1}
              value={[radius]}
              onValueChange={([value]) => onRadiusChange(value)}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100m</span>
              <span className="font-medium">{getRadiusDescription(radius)}</span>
              <span>50km</span>
            </div>
          </div>

          {/* Informações da Localização Atual */}
          {isLocationAvailable && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <div className="font-medium mb-1">Localização atual:</div>
              <div>
                {location?.city && location?.state 
                  ? `${location.city}, ${location.state}`
                  : currentLocation 
                    ? `Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}`
                    : 'Coordenadas disponíveis'
                }
              </div>
              {location?.accuracy && (
                <div className="mt-1">
                  Precisão: ±{Math.round(location.accuracy)}m
                </div>
              )}
            </div>
          )}

          {/* Dicas de Uso */}
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
            <div className="font-medium mb-1">💡 Dicas:</div>
            <ul className="space-y-1 text-xs">
              <li>• Raio menor = resultados mais próximos</li>
              <li>• Raio maior = mais opções disponíveis</li>
              <li>• Localização é salva automaticamente</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
