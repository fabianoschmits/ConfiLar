'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, useTransition, animated, useChain } from '@react-spring/web';
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
  Layers,
  Grid3X3,
  List,
  SlidersHorizontal
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

export default function ClassificadosV7() {
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('ads');
  const [filterVisible, setFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Spring animations
  const headerSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 300, friction: 30 }
  });

  const searchSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 200,
    config: { tension: 300, friction: 30 }
  });

  const filterSpring = useSpring({
    height: filterVisible ? 120 : 0,
    opacity: filterVisible ? 1 : 0,
    config: { tension: 300, friction: 30 }
  });

  const tabSpring = useSpring({
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    delay: 400,
    config: { tension: 300, friction: 30 }
  });

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

  const cardHoverSpring = (isHovered: boolean) => useSpring({
    transform: isHovered ? 'scale(1.02) translateY(-8px)' : 'scale(1) translateY(0px)',
    boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.1)',
    config: { tension: 300, friction: 25 }
  });

  const renderAdCard = (ad: ClassifiedAd, index: number) => {
    const isHovered = hoveredCard === ad.id;
    const cardSpring = cardHoverSpring(isHovered);
    
    const cardTransition = useTransition(ad, {
      from: { opacity: 0, transform: 'translateY(30px) scale(0.9)' },
      enter: { opacity: 1, transform: 'translateY(0px) scale(1)' },
      config: { tension: 300, friction: 30 },
      delay: index * 50
    });

    return cardTransition((style, item) => (
      <animated.div
        key={item.id}
        style={style}
        onMouseEnter={() => setHoveredCard(item.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <animated.div style={cardSpring}>
          <Card className="relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                    {item.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getUrgencyColor(item.urgency)} text-white text-xs`}
                    >
                      {item.urgency === 'high' ? 'Urgente' : item.urgency === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {servicesList.find(s => s.id === item.category)?.name || item.category}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="relative">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.user_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.user_type}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(item.budget)}
                  </p>
                  <p className="text-xs text-gray-500">Orçamento</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contatar
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </animated.div>
      </animated.div>
    ));
  };

  const renderServiceCard = (service: ProfessionalService, index: number) => {
    const isHovered = hoveredCard === service.id;
    const cardSpring = cardHoverSpring(isHovered);
    
    const cardTransition = useTransition(service, {
      from: { opacity: 0, transform: 'translateY(30px) scale(0.9)' },
      enter: { opacity: 1, transform: 'translateY(0px) scale(1)' },
      config: { tension: 300, friction: 30 },
      delay: index * 50
    });

    return cardTransition((style, item) => (
      <animated.div
        key={item.id}
        style={style}
        onMouseEnter={() => setHoveredCard(item.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <animated.div style={cardSpring}>
          <Card className="relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                    {item.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getExperienceColor(item.experience_level)} text-white text-xs`}
                    >
                      {item.experience_level === 'expert' ? 'Especialista' : 
                       item.experience_level === 'advanced' ? 'Avançado' :
                       item.experience_level === 'intermediate' ? 'Intermediário' : 'Iniciante'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.service_type === 'hourly' ? 'Por hora' : 
                       item.service_type === 'fixed' ? 'Valor fixo' : 'Negociável'}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="relative">
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.rating.toFixed(1)} ({item.review_count} avaliações)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.user_name}</p>
                    <p className="text-xs text-gray-500">Profissional</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(item.price)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.service_type === 'hourly' ? '/hora' : 
                     item.service_type === 'fixed' ? 'valor fixo' : 'negociável'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contatar
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </animated.div>
      </animated.div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <animated.div
          style={{
            opacity: headerSpring.opacity,
            transform: headerSpring.transform
          }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando classificados...</p>
        </animated.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <animated.div
        style={headerSpring}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Classificados Spring
                </h1>
                <p className="text-gray-600 text-sm">Micro-interações suaves e fluidas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Novo Anúncio
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <animated.div style={searchSpring} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar serviços ou anúncios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 backdrop-blur-sm border-gray-200 focus:border-indigo-500"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setFilterVisible(!filterVisible)}
              className="bg-white/70 backdrop-blur-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${filterVisible ? 'rotate-180' : ''}`} />
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
          </animated.div>

          <animated.div
            style={filterSpring}
            className="overflow-hidden bg-white/50 backdrop-blur-sm rounded-lg mb-4"
          >
            <div className="p-4 flex gap-4">
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
          </animated.div>
        </div>
      </animated.div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <animated.div style={tabSpring}>
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
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center">
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
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço encontrado</h3>
                  <p className="text-gray-600">Tente ajustar seus filtros de busca</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </animated.div>
      </div>
    </div>
  );
}
