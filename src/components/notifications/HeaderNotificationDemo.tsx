'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { HeaderNotificationBell } from './HeaderNotificationBell'
import { 
  Bell, 
  Settings, 
  Code, 
  Eye,
  Smartphone,
  Monitor,
  Zap
} from 'lucide-react'

export function HeaderNotificationDemo() {
  const [activeVariant, setActiveVariant] = useState<'default' | 'minimal' | 'detailed'>('default')

  const variants = [
    {
      id: 'default',
      name: 'Padrão',
      description: 'Sino com contador, sem label',
      icon: Bell,
      color: 'bg-blue-500'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Versão compacta para headers',
      icon: Settings,
      color: 'bg-green-500'
    },
    {
      id: 'detailed',
      name: 'Detalhado',
      description: 'Com label e mais informações',
      icon: Code,
      color: 'bg-purple-500'
    }
  ]

  const renderVariant = () => {
    switch (activeVariant) {
      case 'minimal':
        return <HeaderNotificationBell />
      case 'detailed':
        return <HeaderNotificationBell />
      default:
        return <HeaderNotificationBell />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Demonstração do Header Notification Bell
        </h2>
        <p className="text-gray-600">
          Teste diferentes variações do componente de notificações do header
        </p>
      </div>

      {/* Seletor de Variantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Variantes Disponíveis
          </CardTitle>
          <CardDescription>
            Escolha uma variação para testar o comportamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map((variant) => (
              <Button
                key={variant.id}
                variant={activeVariant === variant.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-3"
                onClick={() => setActiveVariant(variant.id as any)}
              >
                <div className={`p-2 rounded-full ${variant.color} text-white`}>
                  <variant.icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-xs text-gray-500">{variant.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview da Variante Ativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview - {variants.find(v => v.id === activeVariant)?.name}
          </CardTitle>
          <CardDescription>
            Como o componente aparece no header
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Simulação do Header */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="text-xl font-bold text-blue-600">
                ConfiLar
              </div>
              
              {/* Navegação */}
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="sm">Home</Button>
                <Button variant="ghost" size="sm">Feed</Button>
                <Button variant="ghost" size="sm">Buscar</Button>
              </div>
              
              {/* Área de Ações */}
              <div className="flex items-center space-x-2">
                {/* Componente de Notificação */}
                {renderVariant()}
                
                {/* Outros botões */}
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  Perfil
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Informações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Funcionalidades</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ Contador de notificações não lidas</li>
                <li>✅ Ícone dinâmico baseado no tipo</li>
                <li>✅ Menu dropdown com ações</li>
                <li>✅ Sheet lateral para visualização</li>
                <li>✅ Controles de push notifications</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">Tipos de Notificação</h4>
              <div className="flex flex-wrap gap-1">
                {['message', 'review', 'booking', 'system', 'achievement', 'verification', 'success', 'warning', 'error', 'header'].map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              <span>Desktop: Layout horizontal</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-500" />
              <span>Mobile: Layout compacto</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>Performance: Otimizado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Código de Exemplo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Como Usar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <div className="text-green-400">// Importar o componente</div>
            <div className="text-blue-400">import</div> <span className="text-yellow-300">{'{ HeaderNotificationBell }'}</span> <div className="text-blue-400">from</div> <span className="text-green-300">'@/components/notifications/HeaderNotificationBell'</span>
            <br /><br />
            <div className="text-green-400">// Usar no header</div>
            <div className="text-gray-300">&lt;<span className="text-red-400">div</span> <span className="text-yellow-300">className</span>=<span className="text-green-300">"flex items-center space-x-4"</span>&gt;</div>
            <div className="text-gray-300 ml-4">&lt;<span className="text-red-400">HeaderNotificationBell</span> /&gt;</div>
            <div className="text-gray-300">&lt;/<span className="text-red-400">div</span>&gt;</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
