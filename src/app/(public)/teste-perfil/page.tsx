"use client"

import * as React from "react"
import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ComboboxCategorias, 
  ComboboxEstados, 
  ComboboxTipoUsuario 
} from "@/components/ui/Combobox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Edit, 
  Trash2, 
  Star,
  Shield,
  Bell,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ChevronsUpDown
} from "lucide-react"

export default function TestePerfilPage() {
  const [activeTab, setActiveTab] = useState("perfil")
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true
  })

  const [profileData, setProfileData] = useState({
    fullName: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99999-9999",
    bio: "Profissional dedicado com mais de 5 anos de experiência na área. Especializado em soluções inovadoras e atendimento de qualidade.",
    category: "programador",
    state: "sp",
    city: "São Paulo",
    userType: "professional",
    isVerified: true,
    rating: 4.8,
    totalReviews: 127,
    isAvailable: true,
    hourlyRate: 150.00
  })

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const handleSave = () => {
    console.log('Salvando perfil:', profileData)
    // Aqui você implementaria a lógica de salvamento
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🧪 Página de Teste - Edição de Perfil
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Demonstração completa de todos os componentes do shadcn para edição de perfil
            </p>
          </div>

          {/* Tabs de Navegação */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="seguranca" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="preferencias" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Preferências
              </TabsTrigger>
            </TabsList>

            {/* Tab: Perfil */}
            <TabsContent value="perfil" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna Esquerda - Foto e Info Básica */}
                <div className="space-y-6">
                  {/* Card de Foto */}
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle>Foto do Perfil</CardTitle>
                      <CardDescription>
                        Clique para alterar sua foto
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="relative inline-block">
                        <Avatar className="h-32 w-32 mx-auto mb-4">
                          <AvatarImage src="/placeholder-avatar.jpg" alt="Foto do perfil" />
                          <AvatarFallback className="text-2xl">
                            {profileData.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          className="absolute bottom-6 right-0 rounded-full"
                          variant="secondary"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Alterar Foto
                        </Button>
                        <Button variant="destructive" size="sm" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card de Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status do Perfil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Verificado</span>
                        <Badge variant={profileData.isVerified ? "default" : "secondary"}>
                          {profileData.isVerified ? "✅ Verificado" : "❌ Não verificado"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Disponível</span>
                        <Switch
                          checked={profileData.isAvailable}
                          onCheckedChange={(checked) => 
                            setProfileData(prev => ({ ...prev, isAvailable: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{profileData.rating}</span>
                        <span className="text-sm text-gray-500">
                          ({profileData.totalReviews} avaliações)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Coluna Central - Informações Pessoais */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Pessoais</CardTitle>
                      <CardDescription>
                        Suas informações básicas de contato
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            value={profileData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="pl-10"
                            placeholder="Seu nome completo"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-10"
                            placeholder="seu@email.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="pl-10"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografia</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Conte um pouco sobre você..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Coluna Direita - Informações Profissionais */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Profissionais</CardTitle>
                      <CardDescription>
                        Suas especialidades e localização
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <ComboboxCategorias
                          value={profileData.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <ComboboxEstados
                          value={profileData.state}
                          onValueChange={(value) => handleInputChange('state', value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="city"
                            value={profileData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="pl-10"
                            placeholder="Sua cidade"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo de Usuário</Label>
                        <ComboboxTipoUsuario
                          value={profileData.userType}
                          onValueChange={(value) => handleInputChange('userType', value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Valor por Hora (R$)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={profileData.hourlyRate}
                          onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                          placeholder="150.00"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-4 pt-6">
                <Button variant="outline" size="lg">
                  Cancelar
                </Button>
                <Button onClick={handleSave} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </TabsContent>

            {/* Tab: Segurança */}
            <TabsContent value="seguranca" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                      Mantenha sua senha segura e atualizada
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha atual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Digite sua nova senha"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirme sua nova senha"
                      />
                    </div>

                    <Button className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Alterar Senha
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Autenticação de Dois Fatores</CardTitle>
                    <CardDescription>
                      Adicione uma camada extra de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">SMS</p>
                        <p className="text-sm text-gray-500">Receber código por SMS</p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Aplicativo</p>
                        <p className="text-sm text-gray-500">Google Authenticator, Authy</p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">E-mail</p>
                        <p className="text-sm text-gray-500">Receber código por e-mail</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Notificações */}
            <TabsContent value="notificacoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificações</CardTitle>
                  <CardDescription>
                    Escolha como e quando receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Notificações por E-mail</p>
                        <p className="text-sm text-gray-500">
                          Receba atualizações importantes por e-mail
                        </p>
                      </div>
                      <Switch
                        checked={notifications.email}
                        onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Notificações Push</p>
                        <p className="text-sm text-gray-500">
                          Receba notificações no navegador
                        </p>
                      </div>
                      <Switch
                        checked={notifications.push}
                        onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Notificações por SMS</p>
                        <p className="text-sm text-gray-500">
                          Receba mensagens importantes por SMS
                        </p>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Preferências */}
            <TabsContent value="preferencias" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Privacidade</CardTitle>
                    <CardDescription>
                      Controle quem pode ver suas informações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Perfil Público</p>
                        <p className="text-sm text-gray-500">Qualquer pessoa pode ver</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Mostrar Telefone</p>
                        <p className="text-sm text-gray-500">Exibir número de contato</p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Mostrar E-mail</p>
                        <p className="text-sm text-gray-500">Exibir endereço de e-mail</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Idioma</CardTitle>
                    <CardDescription>
                      Escolha seu idioma preferido
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Idioma Principal</Label>
                      <Combobox
                        options={[
                          { value: "pt", label: "Português (Brasil)" },
                          { value: "en", label: "English" },
                          { value: "es", label: "Español" }
                        ]}
                        value="pt"
                        onValueChange={() => {}}
                        placeholder="Selecionar idioma..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fuso Horário</Label>
                      <Combobox
                        options={[
                          { value: "utc-3", label: "UTC-3 (Brasília)" },
                          { value: "utc-4", label: "UTC-4 (Manaus)" },
                          { value: "utc-5", label: "UTC-5 (Acre)" }
                        ]}
                        value="utc-3"
                        onValueChange={() => {}}
                        placeholder="Selecionar fuso horário..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}

// Componente Combobox genérico para as preferências
function Combobox({
  options,
  value,
  onValueChange,
  placeholder
}: {
  options: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
}) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onValueChange(option.value)
                setOpen(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
