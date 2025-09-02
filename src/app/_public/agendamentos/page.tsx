'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'

// Dados mockados para demonstração
const mockAppointments = [
  {
    id: 1,
    title: 'Limpeza Residencial',
    professional: 'Maria Silva',
    date: '2024-01-15',
    time: '14:00',
    duration: '2 horas',
    status: 'confirmed',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 99999-9999',
    email: 'maria@email.com'
  },
  {
    id: 2,
    title: 'Manutenção Elétrica',
    professional: 'João Santos',
    date: '2024-01-18',
    time: '09:00',
    duration: '3 horas',
    status: 'pending',
    address: 'Av. Principal, 456 - Jardim',
    phone: '(11) 88888-8888',
    email: 'joao@email.com'
  },
  {
    id: 3,
    title: 'Pintura Residencial',
    professional: 'Pedro Costa',
    date: '2024-01-20',
    time: '16:00',
    duration: '4 horas',
    status: 'cancelled',
    address: 'Rua do Comércio, 789 - Vila',
    phone: '(11) 77777-7777',
    email: 'pedro@email.com'
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
    default:
      return <Badge variant="outline">Desconhecido</Badge>
  }
}

export default function AgendamentosPage() {
  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <FadeIn>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Agendamentos</h1>
              <p className="text-gray-600">
                Gerencie todos os seus agendamentos de serviços
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Agendamentos */}
            <div className="lg:col-span-2 space-y-6">
              <FadeIn delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Agendamentos Ativos</span>
                    </CardTitle>
                    <CardDescription>
                      Visualize e gerencie seus próximos compromissos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {appointment.title}
                              </h3>
                              <p className="text-gray-600">
                                Profissional: {appointment.professional}
                              </p>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time} ({appointment.duration})</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{appointment.address}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{appointment.professional}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{appointment.email}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {appointment.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline">
                                  Confirmar
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600">
                                  Cancelar
                                </Button>
                              </>
                            )}
                            {appointment.status === 'confirmed' && (
                              <Button size="sm" variant="outline">
                                Reagendar
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              Detalhes
                            </Button>
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
                      <Calendar className="h-5 w-5" />
                      <span>Resumo</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total de Agendamentos</span>
                      <span className="font-semibold text-gray-900">{mockAppointments.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confirmados</span>
                      <span className="font-semibold text-green-600">
                        {mockAppointments.filter(a => a.status === 'confirmed').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pendentes</span>
                      <span className="font-semibold text-yellow-600">
                        {mockAppointments.filter(a => a.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cancelados</span>
                      <span className="font-semibold text-red-600">
                        {mockAppointments.filter(a => a.status === 'cancelled').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Próximos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockAppointments
                        .filter(a => a.status === 'confirmed')
                        .slice(0, 2)
                        .map((appointment) => (
                          <div key={appointment.id} className="border-l-4 border-blue-500 pl-3">
                            <p className="font-medium text-gray-900 text-sm">
                              {appointment.title}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                            </p>
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







