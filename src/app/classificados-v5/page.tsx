'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Container, Engine } from 'tsparticles-engine';
import { 
  Search, 
  Filter, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Star, 
  Clock, 
  User, 
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  Orbit,
  Waves,
  Layers,
  Grid3X3,
  List,
  SlidersHorizontal,
  Palette,
  Brush,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { servicesList } from '@/data/services';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

interface ClassifiedAd {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
  user_name: string;
  user_type: 'client' | 'professional';
  user_avatar?: string;
  is_favorited?: boolean;
}

export default function ClassificadosV5Page() {
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Configuração das partículas
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    // console.log('Partículas carregadas:', container);
  }, []);

  // Carregar dados
  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classified_ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar anúncios:', error);
        setAds([]);
        return;
      }

      setAds(data || []);
    } catch (error) {
      console.error('❌ Erro geral:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar e ordenar dados
  const filteredAds = ads.filter(ad => {
    const matchesSearch = !searchTerm || 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'budget_low':
        return (a.budget || 0) - (b.budget || 0);
      case 'budget_high':
        return (b.budget || 0) - (a.budget || 0);
      default:
        return 0;
    }
  });

  // Funções utilitárias
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgente';
      case 'medium': return 'Normal';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  // Funções de interação
  const handleFavorite = async (adId: string) => {
    const isFavorited = favorites.has(adId);
    
    try {
      if (isFavorited) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(adId);
          return newSet;
        });
        toast.success('Removido dos favoritos');
      } else {
        setFavorites(prev => new Set(prev).add(adId));
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar favoritos:', error);
      toast.error('Erro ao atualizar favoritos');
    }
  };

  // Renderização de componentes
  const renderAdCard = (ad: ClassifiedAd) => (
    <Card key={ad.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-105 overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                {ad.user_type === 'professional' ? 'OFERECENDO' : 'PROCURANDO'}
              </span>
            </div>
            
            <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
              {ad.title}
            </h3>
            
            <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
              {ad.description}
            </p>
          </div>
        </div>

        {/* Informações */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-gray-700">{ad.location}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-gray-700">{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-gray-700">{ad.user_name}</span>
          </div>
        </div>

        {/* Urgência */}
        <div className="mb-6">
          <Badge className={`text-xs font-medium px-3 py-1 rounded-full ${getUrgencyColor(ad.urgency)} shadow-lg`}>
            <Zap className="h-3 w-3 mr-1" />
            {getUrgencyLabel(ad.urgency)}
          </Badge>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              R$ {ad.budget ? ad.budget.toFixed(2) : '0,00'}
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleFavorite(ad.id)}
                className={`h-9 w-9 p-0 rounded-lg transition-all duration-300 ${
                  favorites.has(ad.id) 
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${favorites.has(ad.id) ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-300"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-pulse rounded-full bg-purple-500/20 blur-xl"></div>
          </div>
          <h2 className="text-xl font-medium text-white mb-2">Carregando classificados...</h2>
          <p className="text-white/60">Preparando a experiência com partículas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Partículas de fundo */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Header */}
      <div className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Orbit className="h-12 w-12 text-white animate-spin" />
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 drop-shadow-2xl">
                Classificados
              </h1>
              <Waves className="h-12 w-12 text-white animate-pulse" />
            </div>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md">
              Descubra oportunidades incríveis com efeitos visuais impressionantes
            </p>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{ads.length}</div>
                <div className="text-sm text-white/80">Anúncios Ativos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{filteredAds.length}</div>
                <div className="text-sm text-white/80">Resultados</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{favorites.size}</div>
                <div className="text-sm text-white/80">Favoritos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Busca */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                <Input
                  placeholder="Buscar anúncios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-purple-400 rounded-xl backdrop-blur-sm"
                />
              </div>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-14 px-4 bg-white/10 border border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {servicesList.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-14 px-4 bg-white/10 border border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="budget_low">Menor orçamento</SelectItem>
                  <SelectItem value="budget_high">Maior orçamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Botão Criar Anúncio */}
        <div className="text-center mb-8">
          <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-5 text-xl rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20">
            <Plus className="h-6 w-6 mr-3" />
            Criar Anúncio
            <Lightbulb className="h-6 w-6 ml-3" />
          </Button>
        </div>

        {/* Grid de Anúncios */}
        {filteredAds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAds.map(renderAdCard)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-white/60" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              {ads.length === 0 ? 'Nenhum anúncio encontrado' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-white/60 max-w-md mx-auto">
              {ads.length === 0 
                ? 'Seja o primeiro a criar um anúncio!'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}