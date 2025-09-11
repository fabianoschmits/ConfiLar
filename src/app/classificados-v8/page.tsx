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
  budget: number;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
  user_name: string;
  user_type: 'client' | 'professional';
  user_avatar?: string;
  is_favorited?: boolean;
}

interface ProfessionalService {
  id: string;
  user_id: string;
  title: string;
  description: string;
  service_type: 'hourly' | 'fixed' | 'negotiable';
  price: number;
  location: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
  user_name: string;
  user_avatar?: string;
  rating?: number;
  review_count?: number;
  is_favorited?: boolean;
}

export default function ClassificadosV8() {
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('ads');
  const [filterVisible, setFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [particleTheme, setParticleTheme] = useState<'cosmic' | 'ocean' | 'fire' | 'forest'>('cosmic');

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log('Particles loaded:', container);
  }, []);

  const getParticleConfig = (theme: string) => {
    const baseConfig = {
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
          opacity: 0.5,
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
    };

    switch (theme) {
      case 'ocean':
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: { value: "#0ea5e9" },
            links: {
              ...baseConfig.particles.links,
              color: "#0ea5e9",
            },
          },
        };
      case 'fire':
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: { value: "#ef4444" },
            links: {
              ...baseConfig.particles.links,
              color: "#ef4444",
            },
          },
        };
      case 'forest':
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: { value: "#22c55e" },
            links: {
              ...baseConfig.particles.links,
              color: "#22c55e",
            },
          },
        };
      default: // cosmic
        return {
          ...baseConfig,
          particles: {
            ...baseConfig.particles,
            color: { value: "#8b5cf6" },
            links: {
              ...baseConfig.particles.links,
              color: "#8b5cf6",
            },
          },
        };
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load classified ads
      const { data: adsData, error: adsError } = await supabase
        .from('classified_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (adsError) throw adsError;

      // Load professional services
      const { data: servicesData, error: servicesError } = await supabase
        .from('professional_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      // Transform services to match interface
      const transformedServices: ProfessionalService[] = servicesData?.map(service => ({
        id: service.id,
        user_id: service.user_id,
        title: service.title,
        description: service.description,
        service_type: service.service_type as 'hourly' | 'fixed' | 'negotiable',
        price: service.price,
        location: service.location,
        experience_level: service.experience_level as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        created_at: service.created_at,
        user_name: service.user_name,
        user_avatar: service.user_avatar,
        rating: service.rating,
        review_count: service.review_count,
        is_favorited: service.is_favorited
      })) || [];

      setAds(adsData || []);
      setServices(transformedServices);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           servicesList.find(s => s.id === service.title)?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedAds = [...filteredAds].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'budget_high':
        return b.budget - a.budget;
      case 'budget_low':
        return a.budget - b.budget;
      default:
        return 0;
    }
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price_high':
        return b.price - a.price;
      case 'price_low':
        return a.price - b.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'expert': return 'bg-purple-500';
      case 'advanced': return 'bg-blue-500';
      case 'intermediate': return 'bg-green-500';
      case 'beginner': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'ocean':
        return {
          bg: 'from-cyan-900 via-blue-900 to-indigo-900',
          card: 'from-cyan-500/10 to-blue-500/10',
          accent: 'from-cyan-400 to-blue-500',
          text: 'from-cyan-300 to-blue-400'
        };
      case 'fire':
        return {
          bg: 'from-red-900 via-orange-900 to-yellow-900',
          card: 'from-red-500/10 to-orange-500/10',
          accent: 'from-red-400 to-orange-500',
          text: 'from-red-300 to-orange-400'
        };
      case 'forest':
        return {
          bg: 'from-green-900 via-emerald-900 to-teal-900',
          card: 'from-green-500/10 to-emerald-500/10',
          accent: 'from-green-400 to-emerald-500',
          text: 'from-green-300 to-emerald-400'
        };
      default: // cosmic
        return {
          bg: 'from-purple-900 via-indigo-900 to-blue-900',
          card: 'from-purple-500/10 to-indigo-500/10',
          accent: 'from-purple-400 to-indigo-500',
          text: 'from-purple-300 to-indigo-400'
        };
    }
  };

  const themeColors = getThemeColors(particleTheme);

  const renderAdCard = (ad: ClassifiedAd, index: number) => (
    <Card key={ad.id} className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.card} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              {ad.title}
            </CardTitle>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`${getUrgencyColor(ad.urgency)} text-white text-xs`}
              >
                {ad.urgency === 'high' ? 'Urgente' : ad.urgency === 'medium' ? 'Médio' : 'Baixo'}
              </Badge>
              <Badge variant="outline" className="text-xs border-white/30 text-white">
                {servicesList.find(s => s.id === ad.category)?.name || ad.category}
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-red-400 transition-colors"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <p className="text-white/80 text-sm mb-4 line-clamp-2">
          {ad.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{ad.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{ad.user_name}</p>
              <p className="text-xs text-white/70 capitalize">{ad.user_type}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-cyan-300">
              {formatPrice(ad.budget)}
            </p>
            <p className="text-xs text-white/70">Orçamento</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" className={`flex-1 bg-gradient-to-r ${themeColors.accent} hover:opacity-90`}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contatar
          </Button>
          <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderServiceCard = (service: ProfessionalService, index: number) => (
    <Card key={service.id} className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group">
      <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.card} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              {service.title}
            </CardTitle>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`${getExperienceColor(service.experience_level)} text-white text-xs`}
              >
                {service.experience_level === 'expert' ? 'Especialista' : 
                 service.experience_level === 'advanced' ? 'Avançado' :
                 service.experience_level === 'intermediate' ? 'Intermediário' : 'Iniciante'}
              </Badge>
              <Badge variant="outline" className="text-xs border-white/30 text-white">
                {service.service_type === 'hourly' ? 'Por hora' : 
                 service.service_type === 'fixed' ? 'Valor fixo' : 'Negociável'}
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-red-400 transition-colors"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <p className="text-white/80 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{service.location}</span>
            </div>
            {service.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{service.rating.toFixed(1)} ({service.review_count} avaliações)</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{service.user_name}</p>
              <p className="text-xs text-white/70">Profissional</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-300">
              {formatPrice(service.price)}
            </p>
            <p className="text-xs text-white/70">
              {service.service_type === 'hourly' ? '/hora' : 
               service.service_type === 'fixed' ? 'valor fixo' : 'negociável'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" className={`flex-1 bg-gradient-to-r ${themeColors.accent} hover:opacity-90`}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contatar
          </Button>
          <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themeColors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-white">Carregando classificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.bg} relative overflow-hidden`}>
      {/* Particles Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={getParticleConfig(particleTheme)}
        className="absolute inset-0 z-0"
      />

      {/* Header */}
      <div className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <Orbit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${themeColors.text} bg-clip-text text-transparent`}>
                  Classificados Particles
                </h1>
                <p className="text-white/70 text-sm">Efeitos visuais impressionantes</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={particleTheme} onValueChange={setParticleTheme}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cosmic">Cosmic</SelectItem>
                  <SelectItem value="ocean">Ocean</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className={`bg-gradient-to-r ${themeColors.accent} hover:opacity-90`}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Anúncio
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
              <Input
                placeholder="Buscar serviços ou anúncios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setFilterVisible(!filterVisible)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filterVisible ? 'rotate-180' : ''}`} />
            </Button>

            <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3 text-white hover:bg-white/20"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3 text-white hover:bg-white/20"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filterVisible && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
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
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigos</SelectItem>
                    <SelectItem value="budget_high">Maior orçamento</SelectItem>
                    <SelectItem value="budget_low">Menor orçamento</SelectItem>
                    <SelectItem value="price_high">Maior preço</SelectItem>
                    <SelectItem value="price_low">Menor preço</SelectItem>
                    <SelectItem value="rating">Melhor avaliação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ads' | 'services')}>
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="ads" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
              <Zap className="h-4 w-4" />
              Anúncios ({filteredAds.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2 text-white data-[state=active]:bg-white/20">
              <TrendingUp className="h-4 w-4" />
              Serviços ({filteredServices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads">
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {sortedAds.map((ad, index) => renderAdCard(ad, index))}
            </div>

            {sortedAds.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <Search className="h-12 w-12 text-white/50" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum anúncio encontrado</h3>
                <p className="text-white/70">Tente ajustar seus filtros de busca</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="services">
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {sortedServices.map((service, index) => renderServiceCard(service, index))}
            </div>

            {sortedServices.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-white/50" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Nenhum serviço encontrado</h3>
                <p className="text-white/70">Tente ajustar seus filtros de busca</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
