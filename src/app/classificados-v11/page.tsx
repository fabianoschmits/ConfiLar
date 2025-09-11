'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
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
  Layers,
  Grid3X3,
  List,
  Mountain,
  Waves,
  Sparkles,
  Zap,
  TrendingUp
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

export default function ClassificadosV11() {
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('ads');
  const [filterVisible, setFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
                           services.find(s => s.id === service.title)?.id === selectedCategory;
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

  const renderAdCard = (ad: ClassifiedAd, index: number) => (
    <Card key={ad.id} className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {ad.title}
            </CardTitle>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`${getUrgencyColor(ad.urgency)} text-white text-xs`}
              >
                {ad.urgency === 'high' ? 'Urgente' : ad.urgency === 'medium' ? 'Médio' : 'Baixo'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {servicesList.find(s => s.id === ad.category)?.name || ad.category}
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {ad.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{ad.user_name}</p>
              <p className="text-xs text-gray-500 capitalize">{ad.user_type}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {formatPrice(ad.budget)}
            </p>
            <p className="text-xs text-gray-500">Orçamento</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contatar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderServiceCard = (service: ProfessionalService, index: number) => (
    <Card key={service.id} className="relative overflow-hidden border-0 bg-white/90 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
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
              <Badge variant="outline" className="text-xs">
                {service.service_type === 'hourly' ? 'Por hora' : 
                 service.service_type === 'fixed' ? 'Valor fixo' : 'Negociável'}
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{service.user_name}</p>
              <p className="text-xs text-gray-500">Profissional</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {formatPrice(service.price)}
            </p>
            <p className="text-xs text-gray-500">
              {service.service_type === 'hourly' ? '/hora' : 
               service.service_type === 'fixed' ? 'valor fixo' : 'negociável'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contatar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando parallax...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <Parallax pages={3}>
        {/* Hero Section */}
        <ParallaxLayer offset={0} speed={0.5} className="flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          </div>
          
          <div className="relative z-10 text-center text-white px-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Mountain className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Classificados
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold mb-6 text-blue-100">
              Parallax Experience
            </h2>
            <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Descubra uma experiência imersiva com efeitos de profundidade e animações suaves
            </p>
            
            <Button size="lg" className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30">
              <Plus className="h-5 w-5 mr-2" />
              Explorar Classificados
            </Button>
          </div>
        </ParallaxLayer>

        {/* Background Elements */}
        <ParallaxLayer offset={0} speed={-0.3} className="flex items-center justify-center">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-500/20 blur-xl" />
          <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-purple-500/20 blur-xl" />
          <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-indigo-500/20 blur-xl" />
        </ParallaxLayer>

        <ParallaxLayer offset={1} speed={-0.2} className="flex items-center justify-center">
          <div className="absolute top-32 right-10 w-28 h-28 rounded-full bg-green-500/20 blur-xl" />
          <div className="absolute bottom-20 left-20 w-36 h-36 rounded-full bg-teal-500/20 blur-xl" />
        </ParallaxLayer>

        {/* Main Content */}
        <ParallaxLayer offset={1} speed={0.3} className="flex items-start justify-center pt-20">
          <div className="w-full max-w-7xl px-4">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-6 mb-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Classificados Parallax
                    </h3>
                    <p className="text-gray-600 text-sm">Efeitos de profundidade imersivos</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Anúncio
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar serviços ou anúncios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/70 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setFilterVisible(!filterVisible)}
                  className="bg-white/70 backdrop-blur-sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filterVisible ? 'rotate-180' : ''}`} />
                </Button>

                <div className="flex gap-1 bg-white/70 backdrop-blur-sm rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {filterVisible && (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-4">
                  <div className="flex gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48 bg-white/70">
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
                      <SelectTrigger className="w-48 bg-white/70">
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ads' | 'services')}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/70 backdrop-blur-sm">
                <TabsTrigger value="ads" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Anúncios ({filteredAds.length})
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
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
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      <Search className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum anúncio encontrado</h3>
                    <p className="text-gray-600">Tente ajustar seus filtros de busca</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="services">
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {sortedServices.map((service, index) => renderServiceCard(service, index))}
                </div>

                {sortedServices.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-teal-100 flex items-center justify-center">
                      <TrendingUp className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço encontrado</h3>
                    <p className="text-gray-600">Tente ajustar seus filtros de busca</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ParallaxLayer>

        {/* Footer Section */}
        <ParallaxLayer offset={2} speed={0.5} className="flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-blue-900 to-purple-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          </div>
          
          <div className="relative z-10 text-center text-white px-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Waves className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Explore o Futuro
            </h2>
            <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Uma experiência única de navegação com efeitos parallax modernos e fluidos
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30">
                <Sparkles className="h-5 w-5 mr-2" />
                Voltar ao Topo
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Share2 className="h-5 w-5 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </ParallaxLayer>
      </Parallax>
    </div>
  );
}
