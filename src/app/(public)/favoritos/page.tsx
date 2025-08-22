'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Star, MapPin, Phone, Mail, MessageCircle, Calendar, Clock } from 'lucide-react'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'

// Dados mockados para demonstração
const mockFavorites = [
  {
    id: 1,
    name: 'Maria Silva',
    profession: 'Limpeza Residencial',
    rating: 4.8,
    totalReviews: 127,
    location: 'São Paulo, SP',
    phone: '(11) 99999-9999',
    email: 'maria@email.com',
    isAvailable: true,
    lastContact: '2024-01-10',
    avatar: null,
    specialties: ['Limpeza Residencial', 'Limpeza Comercial', 'Organização'],
    experience: '5 anos'
  },
  {
    id: 2,
    name: 'João Santos',
    profession: 'Eletricista',
    rating: 4.9,
    totalReviews: 89,
    location: 'Campinas, SP',
    phone: '(19) 88888-8888',
    email: 'joao@email.com',
    isAvailable: true,
    lastContact: '2024-01-08',
    avatar: null,
    specialties: ['Instalação Elétrica', 'Manutenção', 'Reparos'],
    experience: '8 anos'
  },
  {
    id: 3,
    name: 'Pedro Costa',
    profession: 'Pintor',
    rating: 4.7,
    totalReviews: 156,
    location: 'Santos, SP',
    phone: '(13) 77777-7777',
    email: 'pedro@email.com',
    isAvailable: false,
    lastContact: '2024-01-05',
    avatar: null,
    specialties: ['Pintura Residencial', 'Pintura Comercial', 'Texturas'],
    experience: '12 anos'
  }
]

export default function FavoritosPage() {
  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <FadeIn>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Favoritos</h1>
              <p className="text-gray-600">
                Profissionais que você salvou para contatos futuros
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Favoritos */}
            <div className="lg:col-span-2 space-y-6">
              <FadeIn delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span>Profissionais Favoritos</span>
                    </CardTitle>
                    <CardDescription>
                      {mockFavorites.length} profissional(is) salvo(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mockFavorites.map((professional) => (
                        <div
                          key={professional.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start space-x-4">
                            {/* Avatar */}
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={professional.avatar || ''} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                                {professional.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            {/* Informações */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {professional.name}
                                  </h3>
                                  <p className="text-gray-600 text-lg">
                                    {professional.profession}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={professional.isAvailable ? "default" : "secondary"}>
                                    {professional.isAvailable ? 'Disponível' : 'Indisponível'}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Avaliação */}
                              <div className="flex items-center space-x-2 mb-3">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(professional.rating)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {professional.rating} ({professional.totalReviews} avaliações)
                                </span>
                              </div>

                              {/* Especialidades */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {professional.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>

                              {/* Detalhes */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{professional.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{professional.experience} de experiência</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{professional.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{professional.email}</span>
                                </div>
                              </div>

                              {/* Último Contato */}
                              <div className="text-xs text-gray-500 mb-4">
                                Último contato: {new Date(professional.lastContact).toLocaleDateString('pt-BR')}
                              </div>

                              {/* Ações */}
                              <div className="flex space-x-2">
                                <Button size="sm" className="flex-1">
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Enviar Mensagem
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Agendar
                                </Button>
                                <Button size="sm" variant="outline">
                                  Ver Perfil
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* Sidebar com Estatísticas */}
            <div className="space-y-6">
              <FadeIn delay={0.2}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span>Resumo</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total de Favoritos</span>
                      <span className="font-semibold text-gray-900">{mockFavorites.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Disponíveis</span>
                      <span className="font-semibold text-green-600">
                        {mockFavorites.filter(p => p.isAvailable).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Indisponíveis</span>
                      <span className="font-semibold text-gray-600">
                        {mockFavorites.filter(p => !p.isAvailable).length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>Melhores Avaliados</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockFavorites
                        .sort((a, b) => b.rating - a.rating)
                        .slice(0, 3)
                        .map((professional) => (
                          <div key={professional.id} className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={professional.avatar || ''} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                                {professional.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {professional.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {professional.rating} ⭐
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.4}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Por Localização</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from(new Set(mockFavorites.map(p => p.location))).map((location) => (
                        <div key={location} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{location}</span>
                          <Badge variant="outline">
                            {mockFavorites.filter(p => p.location === location).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  )
}

