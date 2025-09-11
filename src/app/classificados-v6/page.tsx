'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4
    }
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2
    }
  }
};

export default function ClassificadosV6() {
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('ads');
  const [filterVisible, setFilterVisible] = useState(false);

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

  const renderAdCard = (ad: ClassifiedAd, index: number) => (
    <motion.div
      key={ad.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
      className="group"
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {ad.title}
                </CardTitle>
              </motion.div>
              
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
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="text-gray-600 text-sm mb-4 line-clamp-2"
          >
            {ad.description}
          </motion.p>

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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="flex gap-2 mt-4"
          >
            <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contatar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderServiceCard = (service: ProfessionalService, index: number) => (
    <motion.div
      key={service.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
      className="group"
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {service.title}
                </CardTitle>
              </motion.div>
              
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
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="text-gray-600 text-sm mb-4 line-clamp-2"
          >
            {service.description}
          </motion.p>

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

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="flex gap-2 mt-4"
          >
            <Button size="sm" className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contatar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Carregando classificados...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Classificados Animados
                </h1>
                <p className="text-gray-600 text-sm">Encontre serviços com animações fluidas</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Novo Anúncio
              </Button>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 mb-4"
          >
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
          </motion.div>

          <AnimatePresence>
            {filterVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-4"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
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
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {sortedAds.map((ad, index) => renderAdCard(ad, index))}
              </AnimatePresence>
            </motion.div>

            {sortedAds.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum anúncio encontrado</h3>
                <p className="text-gray-600">Tente ajustar seus filtros de busca</p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="services">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {sortedServices.map((service, index) => renderServiceCard(service, index))}
              </AnimatePresence>
            </motion.div>

            {sortedServices.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-100 to-teal-100 flex items-center justify-center">
                  <TrendingUp className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço encontrado</h3>
                <p className="text-gray-600">Tente ajustar seus filtros de busca</p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
