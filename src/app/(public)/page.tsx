import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MainLayout } from '@/components/layout/MainLayout'
import { Search, Star, Shield, Users, MapPin, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Encontre os Melhores
              <span className="block text-yellow-400">Profissionais</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Conectamos você aos profissionais mais qualificados para qualquer serviço. 
              Rápido, seguro e confiável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/buscar">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar Serviços
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Users className="mr-2 h-5 w-5" />
                  Seja um Profissional
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Em apenas 3 passos simples, você encontra o profissional ideal para seu serviço
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">1. Busque</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Digite o que você precisa e onde está. Encontre profissionais próximos e qualificados.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">2. Compare</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Veja perfis, avaliações, preços e portfólios. Escolha o melhor para você.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">3. Contrate</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Entre em contato, combine os detalhes e aproveite um serviço de qualidade.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categorias de Serviços */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Categorias de Serviços
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encontre profissionais especializados em diversas áreas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: '🧹', name: 'Limpeza', color: 'bg-blue-100 text-blue-600' },
              { icon: '🔧', name: 'Manutenção', color: 'bg-green-100 text-green-600' },
              { icon: '💄', name: 'Beleza', color: 'bg-pink-100 text-pink-600' },
              { icon: '🚗', name: 'Transporte', color: 'bg-yellow-100 text-yellow-600' },
              { icon: '📚', name: 'Educação', color: 'bg-purple-100 text-purple-600' },
              { icon: '💻', name: 'Tecnologia', color: 'bg-indigo-100 text-indigo-600' },
              { icon: '🏥', name: 'Saúde', color: 'bg-red-100 text-red-600' },
              { icon: '🎉', name: 'Eventos', color: 'bg-orange-100 text-orange-600' },
              { icon: '🌱', name: 'Jardinagem', color: 'bg-emerald-100 text-emerald-600' },
              { icon: '🐕', name: 'Pet Care', color: 'bg-amber-100 text-amber-600' },
            ].map((category, index) => (
              <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 text-2xl`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/buscar">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Ver Todos os Serviços
                </Button>
              </Link>
              <Link href="/feed">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Ver Feed Social
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Por que Escolher */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que Escolher o Confilar?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece a melhor experiência para encontrar profissionais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Profissionais Verificados</h3>
              <p className="text-gray-600">
                Todos os profissionais passam por processo de verificação rigoroso
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Avaliações Reais</h3>
              <p className="text-gray-600">
                Sistema de avaliações transparente e confiável
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Profissionais Próximos</h3>
              <p className="text-gray-600">
                Encontre profissionais na sua região rapidamente
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Resposta Rápida</h3>
              <p className="text-gray-600">
                Profissionais respondem em até 2 horas em média
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Encontrar seu Profissional?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a milhares de pessoas que já encontraram os melhores profissionais através do Confilar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                Começar Agora
              </Button>
            </Link>
            <Link href="/sobre">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Saiba Mais
              </Button>
            </Link>
          </div>
                 </div>
       </section>
      </div>
    </MainLayout>
   )
 }
