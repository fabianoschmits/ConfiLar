'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Fade, 
  Slide, 
  Zoom, 
  Bounce, 
  Flip, 
  Rotate, 
  JackInTheBox,
  Hinge,
  Roll
} from 'react-awesome-reveal';
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
  Plus,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Rocket,
  Target,
  Layers,
  Grid3X3,
  List
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

export default function ClassificadosV6Page() {
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
  const renderAdCard = (ad: ClassifiedAd, index: number) => {
    const animations = [Fade, Slide, Zoom, Bounce, Flip, Rotate, JackInTheBox];
    const AnimationComponent = animations[index % animations.length];
    
    return (
      <AnimationComponent key={ad.id} delay={index * 100} duration={800}>
        <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white overflow-hidden hover:scale-105">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">
                    {ad.user_type === 'professional' ? 'OFERECENDO' : 'PROCURANDO'}
                  </span>
                </div>
                
                <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300">
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
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-gray-700">{ad.location}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
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
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AnimationComponent>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-pulse rounded-full bg-orange-500/20 blur-xl"></div>
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Carregando classificados...</h2>
          <p className="text-gray-600">Preparando a experiência mais animada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-100 to-pink-100">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-500 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Fade direction="down" duration={1000}>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Rocket className="h-12 w-12 text-white animate-bounce" />
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                  Classificados
                </h1>
                <Target className="h-12 w-12 text-white animate-bounce" />
              </div>
            </Fade>
            
            <Slide direction="up" duration={1000} delay={200}>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md">
                Descubra oportunidades incríveis com animações dramáticas e impactantes
              </p>
            </Slide>
            
            {/* Estatísticas */}
            <Zoom duration={1000} delay={400}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">{ads.length}</div>
                  <div className="text-sm text-white/80">Anúncios Ativos</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">{filteredAds.length}</div>
                  <div className="text-sm text-white/80">Resultados</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white">{favorites.size}</div>
                  <div className="text-sm text-white/80">Favoritos</div>
                </div>
              </div>
            </Zoom>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Busca */}
        <Bounce duration={1000} delay={600}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 mb-8 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar anúncios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white/50 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                  />
                </div>
              </div>
              
              {/* Filtros */}
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-14 px-4 bg-white/50 border-gray-200 text-gray-800 rounded-xl">
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
                  <SelectTrigger className="h-14 px-4 bg-white/50 border-gray-200 text-gray-800 rounded-xl">
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
        </Bounce>

        {/* Botão Criar Anúncio */}
        <JackInTheBox duration={1000} delay={800}>
          <div className="text-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-5 text-xl rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105">
              <Plus className="h-6 w-6 mr-3" />
              Criar Anúncio
              <Award className="h-6 w-6 ml-3" />
            </Button>
          </div>
        </JackInTheBox>

        {/* Grid de Anúncios */}
        {filteredAds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAds.map((ad, index) => renderAdCard(ad, index))}
          </div>
        ) : (
          <Hinge duration={1000} delay={200}>
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                {ads.length === 0 ? 'Nenhum anúncio encontrado' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {ads.length === 0 
                  ? 'Seja o primeiro a criar um anúncio!'
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
            </div>
          </Hinge>
        )}
      </div>
    </div>
  );
}