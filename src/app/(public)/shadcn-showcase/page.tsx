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
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  ChevronsUpDown,
  FileText,
  Navigation,
  BarChart3,
  ImageIcon,
  Layout,
  Info,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  LogOut
} from "lucide-react"

export default function ShadcnShowcasePage() {
  const [activeTab, setActiveTab] = useState("formularios")
  const [showPassword, setShowPassword] = useState(false)
  const [progressValue, setProgressValue] = useState(50)
  const [sliderValue, setSliderValue] = useState([50])

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🎨 Biblioteca Completa shadcn/ui
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Demonstração de todos os componentes disponíveis para transformar nosso projeto
            </p>
            <Badge variant="secondary" className="mt-4 text-lg px-4 py-2">
              27+ Componentes Disponíveis
            </Badge>
          </div>

          {/* Tabs de Navegação */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="formularios" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Formulários
              </TabsTrigger>
              <TabsTrigger value="navegacao" className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Navegação
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="dados" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dados
              </TabsTrigger>
            </TabsList>

            {/* Tab: Formulários */}
            <TabsContent value="formularios" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulário Básico */}
                <Card>
                  <CardHeader>
                    <CardTitle>Formulário Básico</CardTitle>
                    <CardDescription>
                      Componentes de entrada de dados fundamentais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea id="bio" placeholder="Conte sobre você..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <ComboboxCategorias
                        value=""
                        onValueChange={() => {}}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <ComboboxEstados
                        value=""
                        onValueChange={() => {}}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Usuário</Label>
                      <ComboboxTipoUsuario
                        value=""
                        onValueChange={() => {}}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms">Aceito os termos</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Notificações</Label>
                      <RadioGroup defaultValue="email">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email" />
                          <Label htmlFor="email">E-mail</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sms" id="sms" />
                          <Label htmlFor="sms">SMS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="push" id="push" />
                          <Label htmlFor="push">Push</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Preferências</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Progresso: {progressValue}%</Label>
                      <Progress value={progressValue} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor: {sliderValue[0]}</Label>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="notifications" />
                      <Label htmlFor="notifications">Receber notificações</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button>Salvar</Button>
                      <Button variant="outline">Cancelar</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Formulário Avançado */}
                <Card>
                  <CardHeader>
                    <CardTitle>Formulário Avançado</CardTitle>
                    <CardDescription>
                      Componentes mais complexos e interativos
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
              </div>
            </TabsContent>

            {/* Tab: Navegação */}
            <TabsContent value="navegacao" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Componentes de Navegação</CardTitle>
                  <CardDescription>
                    Menus, breadcrumbs e navegação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Aqui serão demonstrados os componentes de navegação como NavigationMenu, 
                    Menubar, ContextMenu, DropdownMenu, etc.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Feedback */}
            <TabsContent value="feedback" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                    <CardDescription>
                      Diferentes tipos de alertas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Este é um alerta informativo padrão.
                      </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Este é um alerta de erro.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Avatar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Avatar</CardTitle>
                    <CardDescription>
                      Avatares de usuário
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <Avatar>
                      <AvatarImage src="/avatars/01.png" alt="@usuario" />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarImage src="/avatars/02.png" alt="@maria" />
                      <AvatarFallback>MA</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Dados */}
            <TabsContent value="dados" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Componentes de Dados</CardTitle>
                  <CardDescription>
                    Tabelas, paginação, skeleton, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Aqui serão demonstrados os componentes de dados como Table, 
                    Pagination, Skeleton, Progress, etc.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
