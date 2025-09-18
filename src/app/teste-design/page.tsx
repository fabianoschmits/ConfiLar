'use client'

import { useState } from 'react'
import { ModernMainLayout } from '@/components/layout/ModernMainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  User, 
  Settings, 
  Bell, 
  Heart, 
  Star, 
  MapPin, 
  Calendar,
  MessageCircle,
  Plus,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Edit,
  Trash2,
  Eye,
  Share2,
  Download,
  Upload,
  Lock,
  Unlock,
  Zap,
  Shield,
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Home,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  Tag,
  Bookmark,
  Flag,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Layout
} from 'lucide-react'

export default function TesteDesignPage() {
  const [selectedTab, setSelectedTab] = useState('components')
  const [isLoading, setIsLoading] = useState(false)

  const handleTestAction = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <ModernMainLayout requireAuth={false}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da Página */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teste do Novo Design System
            </h1>
            <p className="text-gray-600">
              Visualização dos componentes modernos e clean do ConfiLar
            </p>
          </div>

          {/* Tabs de Navegação */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'components', label: 'Componentes', icon: Grid3X3 },
                  { id: 'layout', label: 'Layout', icon: Layout },
                  { id: 'forms', label: 'Formulários', icon: Edit },
                  { id: 'data', label: 'Dados', icon: TrendingUp }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Conteúdo das Tabs */}
          {selectedTab === 'components' && (
            <div className="space-y-8">
              {/* Botões */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Botões</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Variantes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full">Primário</Button>
                      <Button variant="secondary" className="w-full">Secundário</Button>
                      <Button variant="outline" className="w-full">Outline</Button>
                      <Button variant="ghost" className="w-full">Ghost</Button>
                      <Button variant="destructive" className="w-full">Destrutivo</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tamanhos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button size="sm" className="w-full">Pequeno</Button>
                      <Button size="default" className="w-full">Padrão</Button>
                      <Button size="lg" className="w-full">Grande</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full">Normal</Button>
                      <Button disabled className="w-full">Desabilitado</Button>
                      <Button onClick={handleTestAction} disabled={isLoading} className="w-full">
                        {isLoading ? 'Carregando...' : 'Com Loading'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Cards */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Simples</CardTitle>
                      <CardDescription>
                        Descrição do card com informações adicionais
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Conteúdo do card com texto explicativo sobre a funcionalidade.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Card com Avatar</CardTitle>
                          <CardDescription>Usuário profissional</CardDescription>
                        </div>
                        <Avatar>
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                        <span className="text-sm text-gray-500">(127 avaliações)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>São Paulo, SP</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        Card com Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant="default">Ativo</Badge>
                        <Badge variant="secondary">Verificado</Badge>
                        <Badge variant="outline">Premium</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Badges e Status */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Badges e Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Badges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Padrão</Badge>
                        <Badge variant="secondary">Secundário</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Erro</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm">Away</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm">Offline</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          )}

          {selectedTab === 'layout' && (
            <div className="space-y-8">
              {/* Grid System */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sistema de Grid</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{i + 1}</span>
                          </div>
                          <p className="text-sm text-gray-600">Item {i + 1}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Espaçamentos */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Espaçamentos</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-2">
                      <div className="bg-blue-100 h-4 rounded"></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="bg-green-100 h-4 rounded"></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-purple-100 h-4 rounded"></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-8">
                      <div className="bg-orange-100 h-4 rounded"></div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          )}

          {selectedTab === 'forms' && (
            <div className="space-y-8">
              {/* Formulário de Exemplo */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Formulários</h2>
                <Card className="max-w-2xl">
                  <CardHeader>
                    <CardTitle>Formulário de Exemplo</CardTitle>
                    <CardDescription>
                      Demonstração dos componentes de formulário
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <Input placeholder="Digite seu nome" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <Input type="email" placeholder="seu@email.com" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="development">Desenvolvimento</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensagem
                      </label>
                      <Textarea placeholder="Digite sua mensagem..." rows={4} />
                    </div>

                    <div className="flex gap-2">
                      <Button>Enviar</Button>
                      <Button variant="outline">Cancelar</Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          )}

          {selectedTab === 'data' && (
            <div className="space-y-8">
              {/* Estatísticas */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Usuários</p>
                          <p className="text-2xl font-bold text-gray-900">1,234</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Briefcase className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Serviços</p>
                          <p className="text-2xl font-bold text-gray-900">567</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Star className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Avaliações</p>
                          <p className="text-2xl font-bold text-gray-900">4.8</p>
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
                          <p className="text-sm font-medium text-gray-600">Crescimento</p>
                          <p className="text-2xl font-bold text-gray-900">+12%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Lista de Itens */}
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Lista de Itens</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{`U${i + 1}`}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">Usuário {i + 1}</p>
                                <p className="text-sm text-gray-600">Descrição do usuário</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Ativo</Badge>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          )}
        </div>
      </div>
    </ModernMainLayout>
  )
}
