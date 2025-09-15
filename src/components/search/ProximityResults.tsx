'use client';

import { MapPin, Star, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProximitySearchResult } from '@/hooks/useProximitySearch';
import { AvailabilityIndicator } from '@/components/ui/AvailabilityIndicator';

interface ProximityResultsProps {
  results: ProximitySearchResult[];
  loading: boolean;
  error: string | null;
  onUserClick?: (userId: string) => void;
  className?: string;
}

export function ProximityResults({
  results,
  loading,
  error,
  onUserClick,
  className = '',
}: ProximityResultsProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 text-gray-300" />
        );
      }
    }
    return stars;
  };

  const getDistanceColor = (distance: number) => {
    if (distance <= 1) return 'bg-green-100 text-green-800';
    if (distance <= 5) return 'bg-blue-100 text-blue-800';
    if (distance <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDistanceIcon = (distance: number) => {
    if (distance <= 1) return '🟢';
    if (distance <= 5) return '🔵';
    if (distance <= 10) return '🟡';
    return '🔴';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">⚠️ Erro na busca</div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <div className="text-lg font-medium mb-2">Nenhum resultado encontrado</div>
          <p className="text-sm text-muted-foreground">
            Tente aumentar o raio de busca ou ajustar os filtros
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Cabeçalho com estatísticas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {results.length} profissional{results.length !== 1 ? 'is' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>🟢</span>
                <span>{results.filter(r => r.distance_km <= 1).length}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔵</span>
                <span>{results.filter(r => r.distance_km > 1 && r.distance_km <= 5).length}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🟡</span>
                <span>{results.filter(r => r.distance_km > 5 && r.distance_km <= 10).length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de resultados */}
      <div className="space-y-3">
        {results.map((user) => (
          <Card 
            key={user.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onUserClick?.(user.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
                  <AvatarFallback>
                    {user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                {/* Informações principais */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-sm truncate">
                        {user.full_name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.location_city}, {user.location_state}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {/* Distância */}
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getDistanceColor(user.distance_km)}`}
                      >
                        {getDistanceIcon(user.distance_km)} {formatDistance(user.distance_km)}
                      </Badge>
                      
                      {/* Disponibilidade */}
                      <AvailabilityIndicator 
                        isAvailable={user.is_available} 
                        size="sm" 
                        showText={false}
                      />
                    </div>
                  </div>

                  {/* Serviços */}
                  {user.professional_services && user.professional_services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {user.professional_services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {user.professional_services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.professional_services.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Rating e disponibilidade */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      {renderStars(user.rating || 0)}
                      <span className="text-muted-foreground">
                        ({user.total_reviews || 0})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className={user.is_available ? 'text-green-600' : 'text-red-600'}>
                        {user.is_available ? 'Disponível' : 'Indisponível'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botão de ação */}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserClick?.(user.id);
                  }}
                >
                  Ver Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
