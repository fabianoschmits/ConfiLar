'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
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
  BarChart3,
  PieChart,
  Activity,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Award,
  Target,
  Briefcase,
  Layers,
  Grid3X3,
  List,
  SlidersHorizontal,
  RefreshCw
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

export default function ClassificadosV9() {
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'ads' | 'services'>('ads');
  const [filterVisible, setFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [stats, setStats] = useState({
    totalAds: 0,
    totalServices: 0,
    totalBudget: 0,
    totalRevenue: 0,
    avgRating: 0,
    activeUsers: 0
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

      // Calculate stats
      const totalBudget = adsData?.reduce((sum, ad) => sum + ad.budget, 0) || 0;
      const totalRevenue = transformedServices.reduce((sum, service) => sum + service.price, 0);
      const avgRating = transformedServices.reduce((sum, service) => sum + (service.rating || 0), 0) / transformedServices.length || 0;
      const uniqueUsers = new Set([
        ...(adsData?.map(ad => ad.user_id) || []),
        ...transformedServices.map(service => service.user_id)
      ]).size;

      setStats({
        totalAds: adsData?.length || 0,
        totalServices: transformedServices.length,
        totalBudget,
        totalRevenue,
        avgRating,
        activeUsers: uniqueUsers
      });
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

  // Chart data
  const categoryData = {
    labels: servicesList.slice(0, 6).map(service => service.name),
    datasets: [
      {
        label: 'Anúncios',
        data: servicesList.slice(0, 6).map(service => 
          ads.filter(ad => ad.category === service.id).length
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Serviços',
        data: servicesList.slice(0, 6).map(service => 
          services.filter(s => s.title.includes(service.name)).length
        ),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Anúncios',
        data: [12, 19, 8, 15, 22, 18],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Serviços',
        data: [8, 15, 12, 20, 25, 22],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const urgencyData = {
    labels: ['Baixa', 'Média', 'Alta'],
    datasets: [
      {
        data: [
          ads.filter(ad => ad.urgency === 'low').length,
          ads.filter(ad => ad.urgency === 'medium').length,
          ads.filter(ad => ad.urgency === 'high').length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Estatísticas dos Classificados',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderAdCard = (ad: ClassifiedAd, index: number) => (
    <Card key={ad.id} className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
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
    <Card key={service.id} className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard Classificados
                </h1>
                <p className="text-gray-600 text-sm">Analytics e insights em tempo real</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-white/70 backdrop-blur-sm"
              >
                {showAnalytics ? <Eye className="h-4 w-4 mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
                {showAnalytics ? 'Ocultar' : 'Mostrar'} Analytics
              </Button>
              
              <Button
                variant="outline"
                onClick={loadData}
                className="bg-white/70 backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Novo Anúncio
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {showAnalytics && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Anúncios</p>
                      <p className="text-2xl font-bold">{stats.totalAds}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Serviços</p>
                      <p className="text-2xl font-bold">{stats.totalServices}</p>
                    </div>
                    <Layers className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Orçamento Total</p>
                      <p className="text-2xl font-bold">{formatPrice(stats.totalBudget)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Receita Total</p>
                      <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">Avaliação Média</p>
                      <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm">Usuários Ativos</p>
                      <p className="text-2xl font-bold">{stats.activeUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-pink-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          {showAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Anúncios por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar data={categoryData} options={chartOptions} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Tendência Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Line data={monthlyData} options={chartOptions} />
                </CardContent>
              </Card>
            </div>
          )}

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
      </div>

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
    </div>
  );
}
