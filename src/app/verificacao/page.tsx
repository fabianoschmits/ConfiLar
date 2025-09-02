'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Star, 
  Award, 
  FileText, 
  Camera,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  MessageSquare,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface VerificationScore {
  overall: number
  identity: number
  documents: number
  reviews: number
  activity: number
  community: number
}

interface VerificationStatus {
  is_verified: boolean
  verification_level: 'none' | 'basic' | 'verified' | 'premium'
  verification_date?: string
  documents_verified: number
  total_documents: number
  next_verification_step: string
}

interface TrustMetrics {
  response_rate: number
  average_response_time: number
  completion_rate: number
  dispute_rate: number
  community_trust_score: number
}

export default function VerificacaoPage() {
  const { profile, user } = useAuthContext()
  const [verificationScore, setVerificationScore] = useState<VerificationScore>({
    overall: 0,
    identity: 0,
    documents: 0,
    reviews: 0,
    activity: 0,
    community: 0
  })
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    is_verified: false,
    verification_level: 'none',
    documents_verified: 0,
    total_documents: 3,
    next_verification_step: 'Verificar identidade'
  })
  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics>({
    response_rate: 0,
    average_response_time: 0,
    completion_rate: 0,
    dispute_rate: 0,
    community_trust_score: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      calculateVerificationScore()
      loadTrustMetrics()
    }
  }, [profile])

  const calculateVerificationScore = async () => {
    if (!profile) return

    const score = {
      overall: 0,
      identity: 0,
      documents: 0,
      reviews: 0,
      activity: 0,
      community: 0
    }

    // 1. Identity Score (25%)
    if (profile.full_name && profile.email && profile.phone) score.identity += 25
    if (profile.location_state && profile.location_city) score.identity += 15
    if (profile.bio) score.identity += 10
    score.identity = Math.min(score.identity, 50)

    // 2. Documents Score (20%)
    if (profile.cpf_cnpj) score.documents += 20
    if (profile.avatar_url) score.documents += 10
    score.documents = Math.min(score.documents, 30)

    // 3. Reviews Score (25%)
    if (profile.total_reviews > 0) {
      score.reviews += Math.min(profile.total_reviews * 2, 15)
      score.reviews += Math.min(profile.rating * 2, 10)
    }
    score.reviews = Math.min(score.reviews, 25)

    // 4. Activity Score (15%)
    if (profile.created_at) {
      const daysSinceCreation = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceCreation > 30) score.activity += 15
      else if (daysSinceCreation > 7) score.activity += 10
      else score.activity += 5
    }

    // 5. Community Score (15%)
    if (profile.is_verified) score.community += 15
    if (profile.badge === 'gold') score.community += 10
    else if (profile.badge === 'silver') score.community += 5

    // Calculate overall score
    score.overall = Math.round((score.identity + score.documents + score.reviews + score.activity + score.community) * 2)

    setVerificationScore(score)

    // Update verification status
    let level: 'none' | 'basic' | 'verified' | 'premium' = 'none'
    if (score.overall >= 80) level = 'premium'
    else if (score.overall >= 60) level = 'verified'
    else if (score.overall >= 30) level = 'basic'

    setVerificationStatus(prev => ({
      ...prev,
      verification_level: level,
      is_verified: level === 'verified' || level === 'premium'
    }))

    setLoading(false)
  }

  const loadTrustMetrics = async () => {
    if (!profile) return

    // Simular métricas de confiança (em produção, viriam do banco)
    const metrics: TrustMetrics = {
      response_rate: Math.random() * 40 + 60, // 60-100%
      average_response_time: Math.random() * 2 + 1, // 1-3 horas
      completion_rate: Math.random() * 20 + 80, // 80-100%
      dispute_rate: Math.random() * 5, // 0-5%
      community_trust_score: Math.random() * 30 + 70 // 70-100%
    }

    setTrustMetrics(metrics)
  }

  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case 'premium': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'
      case 'verified': return 'bg-gradient-to-r from-green-400 to-green-600 text-green-900'
      case 'basic': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-gray-900'
    }
  }

  const getVerificationLevelIcon = (level: string) => {
    switch (level) {
      case 'premium': return <Award className="h-5 w-5" />
      case 'verified': return <CheckCircle className="h-5 w-5" />
      case 'basic': return <UserCheck className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getVerificationLevelName = (level: string) => {
    switch (level) {
      case 'premium': return 'Verificado Premium'
      case 'verified': return 'Verificado'
      case 'basic': return 'Verificação Básica'
      default: return 'Não Verificado'
    }
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
            Sistema de Verificação e Confiança
          </h1>
          <p className="text-gray-600">
            Construa sua reputação e ganhe a confiança da comunidade
          </p>
        </div>

        {/* Score Geral */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Score de Verificação</CardTitle>
                <CardDescription>
                  Quanto maior o score, maior a confiança da comunidade
                </CardDescription>
              </div>
              <Badge className={`text-lg px-4 py-2 ${getVerificationLevelColor(verificationStatus.verification_level)}`}>
                {getVerificationLevelIcon(verificationStatus.verification_level)}
                <span className="ml-2">{getVerificationLevelName(verificationStatus.verification_level)}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {verificationScore.overall}
              </div>
              <div className="text-gray-600">de 100 pontos</div>
            </div>
            
            <Progress value={verificationScore.overall} className="h-3 mb-6" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{verificationScore.identity}</div>
                <div className="text-sm text-gray-600">Identidade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{verificationScore.documents}</div>
                <div className="text-sm text-gray-600">Documentos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{verificationScore.reviews}</div>
                <div className="text-sm text-gray-600">Avaliações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{verificationScore.activity}</div>
                <div className="text-sm text-gray-600">Atividade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{verificationScore.community}</div>
                <div className="text-sm text-gray-600">Comunidade</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Confiança */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Métricas de Confiança
            </CardTitle>
            <CardDescription>
              Indicadores que mostram sua confiabilidade na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{trustMetrics.response_rate.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Taxa de Resposta</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{trustMetrics.average_response_time.toFixed(1)}h</div>
                <div className="text-sm text-gray-600">Tempo de Resposta</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{trustMetrics.completion_rate.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Taxa de Conclusão</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{trustMetrics.dispute_rate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Taxa de Disputas</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{trustMetrics.community_trust_score.toFixed(0)}</div>
                <div className="text-sm text-gray-600">Confiança da Comunidade</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Verificação */}
        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="steps">Passos para Verificação</TabsTrigger>
            <TabsTrigger value="benefits">Benefícios</TabsTrigger>
            <TabsTrigger value="tips">Dicas de Confiança</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Passos para Verificação Completa</CardTitle>
                <CardDescription>
                  Complete estes passos para aumentar seu score e confiança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Verificar Identidade', description: 'Confirme seu nome, email e telefone', completed: verificationScore.identity > 0, points: 50 },
                    { step: 2, title: 'Upload de Documentos', description: 'Envie CPF/CNPJ e foto de perfil', completed: verificationScore.documents > 0, points: 30 },
                    { step: 3, title: 'Receber Avaliações', description: 'Complete serviços e receba feedback', completed: verificationScore.reviews > 0, points: 25 },
                    { step: 4, title: 'Atividade na Plataforma', description: 'Use a plataforma regularmente', completed: verificationScore.activity > 0, points: 15 },
                    { step: 5, title: 'Reconhecimento da Comunidade', description: 'Ganhe badges e verificação', completed: verificationScore.community > 0, points: 15 }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center p-4 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                        item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {item.completed ? <CheckCircle className="h-5 w-5" /> : item.step}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">{item.points} pontos</div>
                        {item.completed && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Concluído
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Benefícios da Verificação</CardTitle>
                <CardDescription>
                  O que você ganha ao ser verificado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600">Para Profissionais</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Aparece primeiro nas buscas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Badge de verificação visível
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Mais propostas de clientes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Acesso a recursos premium
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-600">Para Clientes</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Identidade confirmada
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Mais confiança dos profissionais
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Melhor experiência de contratação
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        Suporte prioritário
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dicas para Aumentar sua Confiança</CardTitle>
                <CardDescription>
                  Como construir uma reputação sólida na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">📱 Resposta Rápida</h4>
                    <p className="text-sm text-blue-800">
                      Responda mensagens em até 2 horas para mostrar que você é confiável e ativo.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">⭐ Qualidade do Serviço</h4>
                    <p className="text-sm text-green-800">
                      Sempre entregue o que prometeu. A qualidade do seu trabalho é sua melhor propaganda.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">📸 Portfólio Atualizado</h4>
                    <p className="text-sm text-purple-800">
                      Mantenha seu portfólio atualizado com fotos dos seus melhores trabalhos.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">🤝 Comunicação Clara</h4>
                    <p className="text-sm text-orange-800">
                      Seja transparente sobre preços, prazos e expectativas desde o início.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-2">📅 Pontualidade</h4>
                    <p className="text-sm text-indigo-800">
                      Chegue sempre no horário combinado. A pontualidade é um sinal de profissionalismo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <FileText className="mr-2 h-5 w-5" />
            Enviar Documentos
          </Button>
          <Button size="lg" variant="outline">
            <Camera className="mr-2 h-5 w-5" />
            Atualizar Foto
          </Button>
          <Button size="lg" variant="outline">
            <TrendingUp className="mr-2 h-5 w-5" />
            Ver Histórico
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
