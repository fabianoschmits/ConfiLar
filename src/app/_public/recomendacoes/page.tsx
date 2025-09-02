'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Star, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Users, 
  Target, 
  Zap,
  Shield,
  Award,
  CheckCircle,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  Sparkles,
  TrendingDown,
  UserCheck,
  ThumbsUp
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

interface Recommendation {
  id: string
  professional_id: string
  professional_name: string
  professional_avatar: string
  service_category: string
  match_score: number
  factors: {
    location: number
    rating: number
    availability: number
    response_time: number
    completion_rate: number
    trust_score: number
    specialization: number
  }
  total_factors: number
  is_verified: boolean
  badge: string
  rating: number
  total_reviews: number
  response_time_hours: number
  completion_rate: number
  location_distance: number
  last_active: string
  price_range: string
  availability: string[]
}

interface RecommendationFactors {
  location_weight: number
  rating_weight: number
  availability_weight: number
  response_time_weight: number
  completion_rate_weight: number
  trust_score_weight: number
  specialization_weight: number
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    professional_id: 'prof-1',
    professional_name: 'João Silva',
    professional_avatar: '/avatar1.jpg',
    service_category: 'Pedreiro',
    match_score: 94,
    factors: {
      location: 95,
      rating: 98,
      availability: 90,
      response_time: 92,
      completion_rate: 96,
      trust_score: 97,
      specialization: 88
    },
    total_factors: 7,
    is_verified: true,
    badge: 'gold',
    rating: 4.8,
    total_reviews: 45,
    response_time_hours: 1.5,
    completion_rate: 98,
    location_distance: 2.3,
    last_active: '2024-01-25T10:00:00Z',
    price_range: 'R$ 80-120/h',
    availability: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
  },
  {
    id: '2',
    professional_id: 'prof-2',
    professional_name: 'Maria Santos',
    professional_avatar: '/avatar2.jpg',
    service_category: 'Diarista',
    match_score: 87,
    factors: {
      location: 88,
      rating: 92,
      availability: 85,
      response_time: 90,
      completion_rate: 89,
      trust_score: 91,
      specialization: 82
    },
    total_factors: 7,
    is_verified: true,
    badge: 'silver',
    rating: 4.6,
    total_reviews: 32,
    response_time_hours: 2.1,
    completion_rate: 95,
    location_distance: 3.1,
    last_active: '2024-01-25T09:30:00Z',
    price_range: 'R$ 60-90/h',
    availability: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  },
  {
    id: '3',
    professional_id: 'prof-3',
    professional_name: 'Carlos Oliveira',
    professional_avatar: '/avatar3.jpg',
    service_category: 'Eletricista',
    match_score: 82,
    factors: {
      location: 85,
      rating: 88,
      availability: 78,
      response_time: 85,
      completion_rate: 90,
      trust_score: 86,
      specialization: 80
    },
    total_factors: 7,
    is_verified: false,
    badge: 'bronze',
    rating: 4.4,
    total_reviews: 18,
    response_time_hours: 3.2,
    completion_rate: 92,
    location_distance: 4.5,
    last_active: '2024-01-24T16:00:00Z',
    price_range: 'R$ 100-150/h',
    availability: ['Segunda', 'Terça', 'Quarta', 'Quinta']
  }
]

export default function RecomendacoesPage() {
  const { profile } = useAuthContext()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [factors, setFactors] = useState<RecommendationFactors>({
    location_weight: 25,
    rating_weight: 20,
    availability_weight: 15,
    response_time_weight: 15,
    completion_rate_weight: 10,
    trust_score_weight: 10,
    specialization_weight: 5
  })
  const [loading, setLoading] = useState(true)
  const [showFactors, setShowFactors] = useState(false)

  useEffect(() => {
    if (profile) {
      loadRecommendations()
    }
  }, [profile])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      
      // Em produção, carregaria recomendações reais do banco
      // Por enquanto, simulando dados
      setRecommendations(mockRecommendations)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error)
      setLoading(false)
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'gold': return 'text-yellow-700 bg-yellow-100'
      case 'silver': return 'text-gray-700 bg-gray-100'
      case 'bronze': return 'text-amber-700 bg-amber-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getBadgeText = (badge: string) => {
    switch (badge) {
      case 'gold': return 'Ouro'
      case 'silver': return 'Prata'
      case 'bronze': return 'Bronze'
      default: return 'Bronze'
    }
  }

  const calculateOverallScore = (recommendation: Recommendation) => {
    const weights = factors
    const scores = recommendation.factors
    
    return Math.round(
      (scores.location * weights.location_weight +
       scores.rating * weights.rating_weight +
       scores.availability * weights.availability_weight +
       scores.response_time * weights.response_time_weight +
       scores.completion_rate * weights.completion_rate_weight +
       scores.trust_score * weights.trust_score_weight +
       scores.specialization * weights.specialization_weight) / 100
    )
  }

  const updateFactors = (factor: keyof RecommendationFactors, value: number) => {
    setFactors(prev => ({
      ...prev,
      [factor]: value
    }))
  }

  const resetFactors = () => {
    setFactors({
      location_weight: 25,
      rating_weight: 20,
      availability_weight: 15,
      response_time_weight: 15,
      completion_rate_weight: 10,
      trust_score_weight: 10,
      specialization_weight: 5
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Recomendações Inteligentes
          </h1>
          <p className="text-gray-600">
            Nossa IA analisa múltiplos fatores para encontrar os melhores profissionais para você
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recomendações</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Score Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(recommendations.reduce((sum, r) => sum + r.match_score, 0) / recommendations.length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verificados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recommendations.filter(r => r.is_verified).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fatores Analisados</p>
                  <p className="text-2xl font-bold text-gray-900">7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuração de Fatores */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Configuração de Fatores
                </CardTitle>
                <CardDescription>
                  Ajuste a importância de cada fator para personalizar suas recomendações
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFactors(!showFactors)}
                >
                  {showFactors ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showFactors ? 'Ocultar' : 'Mostrar'} Fatores
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetFactors}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showFactors && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localização ({factors.location_weight}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={factors.location_weight}
                      onChange={(e) => updateFactors('location_weight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação ({factors.rating_weight}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={factors.rating_weight}
                      onChange={(e) => updateFactors('rating_weight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disponibilidade ({factors.availability_weight}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={factors.availability_weight}
                      onChange={(e) => updateFactors('availability_weight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo de Resposta ({factors.response_time_weight}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={factors.response_time_weight}
                      onChange={(e) => updateFactors('response_time_weight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Conclusão ({factors.completion_rate_weight}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={factors.completion_rate_weight}
                      onChange={(e) => updateFactors('completion_rate_weight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score de Confiança ({factors.trust_score_weight}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={factors.trust_score_weight}
                      onChange={(e) => updateFactors('trust_score_weight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialização ({factors.specialization_weight}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={factors.specialization_weight}
                      onChange={(e) => updateFactors('specialization_weight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <Badge variant="outline" className="text-sm">
                    Total: {Object.values(factors).reduce((sum, val) => sum + val, 0)}%
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs de Recomendações */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas as Recomendações</TabsTrigger>
            <TabsTrigger value="top">Top Recomendações</TabsTrigger>
            <TabsTrigger value="algorithm">Como Funciona</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recomendações Personalizadas</CardTitle>
                <CardDescription>
                  Profissionais ordenados por score de compatibilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recommendations
                    .sort((a, b) => b.match_score - a.match_score)
                    .map((recommendation) => (
                      <div key={recommendation.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                              👤
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {recommendation.professional_name}
                              </h3>
                              <p className="text-gray-600">{recommendation.service_category}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {recommendation.is_verified && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verificado
                                  </Badge>
                                )}
                                <Badge className={`text-xs ${getBadgeColor(recommendation.badge)}`}>
                                  {getBadgeText(recommendation.badge)}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">{recommendation.rating}</span>
                                  <span className="text-xs text-gray-500">({recommendation.total_reviews})</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge className={`text-lg px-4 py-2 ${getMatchScoreColor(recommendation.match_score)}`}>
                              {recommendation.match_score}%
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">Score de Match</p>
                          </div>
                        </div>
                        
                        {/* Fatores Detalhados */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                            <div className="text-sm font-medium text-gray-900">{recommendation.factors.location}%</div>
                            <div className="text-xs text-gray-500">Localização</div>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <Star className="h-5 w-5 text-green-600 mx-auto mb-1" />
                            <div className="text-sm font-medium text-gray-900">{recommendation.factors.rating}%</div>
                            <div className="text-xs text-gray-500">Avaliação</div>
                          </div>
                          
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                            <div className="text-sm font-medium text-gray-900">{recommendation.factors.availability}%</div>
                            <div className="text-xs text-gray-500">Disponibilidade</div>
                          </div>
                          
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <Zap className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                            <div className="text-sm font-medium text-gray-900">{recommendation.factors.response_time}%</div>
                            <div className="text-xs text-gray-500">Resposta</div>
                          </div>
                        </div>
                        
                        {/* Informações Adicionais */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Preço:</span>
                            <span className="ml-2 font-medium">{recommendation.price_range}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Distância:</span>
                            <span className="ml-2 font-medium">{recommendation.location_distance}km</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Taxa de Conclusão:</span>
                            <span className="ml-2 font-medium">{recommendation.completion_rate}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Última Atividade:</span>
                            <span className="ml-2 font-medium">
                              {new Date(recommendation.last_active).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Ações */}
                        <div className="flex gap-3 mt-4">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Enviar Mensagem
                          </Button>
                          <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </Button>
                          <Button variant="outline">
                            <Heart className="h-4 w-4 mr-2" />
                            Favoritar
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Recomendações</CardTitle>
                <CardDescription>
                  Os profissionais com melhor score de compatibilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations
                    .filter(r => r.match_score >= 85)
                    .sort((a, b) => b.match_score - a.match_score)
                    .map((recommendation, index) => (
                      <div key={recommendation.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-blue-600">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {recommendation.professional_name}
                            </h3>
                            <p className="text-sm text-gray-600">{recommendation.service_category}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`text-lg px-3 py-1 ${getMatchScoreColor(recommendation.match_score)}`}>
                              {recommendation.match_score}%
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">Score</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="algorithm" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Como Funciona Nosso Algoritmo</CardTitle>
                <CardDescription>
                  Entenda como calculamos suas recomendações personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">🧠 Inteligência Artificial</h4>
                    <p className="text-sm text-blue-800">
                      Nossa IA analisa mais de 50 variáveis para encontrar os profissionais mais compatíveis com suas necessidades.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Fatores Principais:</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span>Localização e distância</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <span>Avaliações e reputação</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span>Disponibilidade e horários</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-purple-600" />
                          <span>Tempo de resposta</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-orange-600" />
                          <span>Taxa de conclusão</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-indigo-600" />
                          <span>Score de confiança</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-red-600" />
                          <span>Especialização no serviço</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Processo de Cálculo:</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">1. Coleta de Dados</div>
                          <div className="text-xs text-gray-500">Analisamos histórico, preferências e comportamento</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">2. Análise de Compatibilidade</div>
                          <div className="text-xs text-gray-500">IA calcula score baseado nos fatores configurados</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">3. Ordenação Inteligente</div>
                          <div className="text-xs text-gray-500">Resultados ordenados por relevância e score</div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">4. Aprendizado Contínuo</div>
                          <div className="text-xs text-gray-500">Sistema melhora com cada interação</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Personalização</h4>
                    <p className="text-sm text-green-800">
                      Ajuste a importância de cada fator para receber recomendações ainda mais precisas para suas necessidades específicas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
