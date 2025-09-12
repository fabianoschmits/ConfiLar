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
  budget?: number;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
  user_name: string;
  user_type: 'client' | 'professional';
  user_avatar?: string;
  is_favorited?: boolean;
}

export default function ClassificadosV4Page() {
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
  const renderAdCard = (ad: ClassifiedAd, index: number) => (
    <motion.div
      key={ad.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white overflow-hidden h-full">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                  {ad.user_type === 'professional' ? 'OFERECENDO' : 'PROCURANDO'}
                </span>
              </div>
              
              <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
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
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{ad.location}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{ad.user_name}</span>
            </div>
          </div>

          {/* Urgência */}
          <div className="mb-6">
            <Badge className={`text-xs font-medium px-3 py-1 rounded-full ${getUrgencyColor(ad.urgency)}`}>
              <Zap className="h-3 w-3 mr-1" />
              {getUrgencyLabel(ad.urgency)}
            </Badge>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-green-600">
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
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
          </div>
          <h2 className="text-xl font-medium text-gray-800 mb-2">Carregando classificados...</h2>
          <p className="text-gray-600">Preparando a experiência mais dinâmica</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                Classificados
              </h1>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md"
            >
              Descubra oportunidades incríveis com animações fluidas e interativas
            </motion.p>
            
            {/* Estatísticas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{ads.length}</div>
                <div className="text-sm text-white/80">Anúncios Ativos</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{filteredAds.length}</div>
                <div className="text-sm text-white/80">Resultados</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{favorites.size}</div>
                <div className="text-sm text-white/80">Favoritos</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 p-6 mb-8 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Buscar anúncios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-white/50 border-gray-200 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
        </motion.div>

        {/* Botão Criar Anúncio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mb-8"
        >
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
            <Plus className="h-5 w-5 mr-2" />
            Criar Anúncio
          </Button>
        </motion.div>

        {/* Grid de Anúncios */}
        <AnimatePresence mode="wait">
          {filteredAds.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredAds.map((ad, index) => renderAdCard(ad, index))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

