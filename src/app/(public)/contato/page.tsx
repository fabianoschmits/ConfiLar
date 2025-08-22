'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  Building2,
  Users,
  Globe,
  Shield,
  Heart
} from 'lucide-react'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeIn } from '@/components/animations/FadeIn'

const contactMethods = [
  {
    title: 'Suporte Técnico',
    description: 'Para problemas técnicos e dúvidas sobre a plataforma',
    icon: <MessageCircle className="h-6 w-6" />,
    email: 'suporte@confilar.com.br',
    phone: '(11) 99999-9999',
    responseTime: 'Até 2 horas',
    color: 'bg-blue-500'
  },
  {
    title: 'Comercial',
    description: 'Para parcerias e oportunidades de negócio',
    icon: <Building2 className="h-6 w-6" />,
    email: 'comercial@confilar.com.br',
    phone: '(11) 99999-9998',
    responseTime: 'Até 24 horas',
    color: 'bg-green-500'
  },
  {
    title: 'Parcerias',
    description: 'Para profissionais e empresas interessadas',
    icon: <Users className="h-6 w-6" />,
    email: 'parcerias@confilar.com.br',
    phone: '(11) 99999-9997',
    responseTime: 'Até 48 horas',
    color: 'bg-purple-500'
  }
]

const officeInfo = {
  address: 'Rua das Flores, 123 - Centro',
  city: 'São Paulo, SP - CEP: 01234-567',
  phone: '(11) 99999-9999',
  email: 'contato@confilar.com.br',
  hours: 'Segunda a Sexta: 8h às 18h | Sábado: 9h às 13h'
}

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Aqui você implementaria o envio real do formulário
    console.log('Formulário enviado:', formData)
    
    setIsSubmitting(false)
    // Resetar formulário
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: ''
    })
    
    // Mostrar mensagem de sucesso
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <FadeIn>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Entre em Contato</h1>
              <p className="text-gray-600">
                Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo
              </p>
            </div>
          </FadeIn>

          {/* Informações de Contato */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {contactMethods.map((method, index) => (
              <FadeIn key={method.title} delay={0.1 + index * 0.1}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <div className="text-white">
                        {method.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{method.email}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{method.phone}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Resposta: {method.responseTime}
                    </Badge>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Endereço e Horários */}
          <FadeIn delay={0.4}>
            <Card className="mb-12 bg-gradient-to-r from-gray-50 to-blue-50">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <span>Nossa Sede</span>
                    </h3>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">{officeInfo.address}</p>
                          <p>{officeInfo.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <span>{officeInfo.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span>{officeInfo.email}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>Horário de Funcionamento</span>
                    </h3>
                    <div className="space-y-3 text-gray-600">
                      <p>{officeInfo.hours}</p>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-sm text-gray-500 mb-2">Status atual:</p>
                        <Badge className="bg-green-100 text-green-800">
                          Aberto
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Formulário de Contato */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <FadeIn delay={0.5}>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Envie uma Mensagem</h2>
                <p className="text-gray-600 mb-6">
                  Preencha o formulário abaixo e nossa equipe entrará em contato o mais breve possível.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Seus dados estão seguros conosco</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span>Atendimento personalizado e humanizado</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span>Suporte em português brasileiro</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="suporte">Suporte Técnico</SelectItem>
                            <SelectItem value="comercial">Comercial</SelectItem>
                            <SelectItem value="parcerias">Parcerias</SelectItem>
                            <SelectItem value="sugestoes">Sugestões</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Assunto *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Descreva sua dúvida, sugestão ou solicitação..."
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" style={{ animationDuration: '0.6s' }}></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          {/* Mapa ou Informações Adicionais */}
          <FadeIn delay={0.7}>
            <Card className="mt-12">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Prefere nos visitar pessoalmente?
                </h3>
                <p className="text-gray-600 mb-6">
                  Nossa sede está localizada no centro de São Paulo, com fácil acesso por transporte público.
                </p>
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4" />
                    <p>Mapa interativo será implementado aqui</p>
                    <p className="text-sm">Endereço: {officeInfo.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </PageTransition>
    </MainLayout>
  )
}




