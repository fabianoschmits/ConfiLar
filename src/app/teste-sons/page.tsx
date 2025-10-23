'use client'

/**
 * Página de Teste de Sons de Notificações
 * ConfiLar - Teste de Sons
 */

import { useState } from 'react'
import { useNotificationSound } from '@/hooks/useNotificationSound'
import { 
  NotificationSoundType, 
  NOTIFICATION_SOUND_CONFIG,
  SoundConfig 
} from '@/types/sound'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Trophy,
  Bell
} from 'lucide-react'

export default function TesteSonsPage() {
  const {
    playSound,
    stopAllSounds,
    setVolume,
    setEnabled,
    isEnabled,
    volume,
    isPlaying,
    preferences,
    loading
  } = useNotificationSound()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [playingSound, setPlayingSound] = useState<NotificationSoundType | null>(null)

  // Agrupar notificações por categoria
  const groupedNotifications = Object.entries(NOTIFICATION_SOUND_CONFIG).reduce((acc, [key, config]) => {
    const category = config.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push({ key: key as NotificationSoundType, config })
    return acc
  }, {} as Record<string, Array<{ key: NotificationSoundType; config: SoundConfig }>>)

  const handlePlaySound = async (type: NotificationSoundType) => {
    setPlayingSound(type)
    try {
      await playSound(type)
      // Resetar após 2 segundos
      setTimeout(() => {
        setPlayingSound(null)
      }, 2000)
    } catch (error) {
      console.error('Erro ao tocar som:', error)
      setPlayingSound(null)
    }
  }

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0] / 100)
  }

  const handleToggleEnabled = () => {
    setEnabled(!isEnabled)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'notification':
        return <Bell className="w-5 h-5" />
      case 'achievement':
        return <Trophy className="w-5 h-5" />
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'notification':
        return 'bg-blue-500'
      case 'achievement':
        return 'bg-purple-500'
      case 'success':
        return 'bg-green-500'
      case 'alert':
        return 'bg-red-500'
      case 'info':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema de sons...</p>
        </div>
      </div>
    )
  }

  // Aviso se arquivos de som não existem
  const showSoundWarning = true // Sempre mostrar aviso para lembrar de adicionar sons

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            🔊 Teste de Sons de Notificações
          </h1>
          <p className="text-gray-600 text-lg">
            Teste todos os sons do sistema e configure suas preferências
          </p>
        </div>

        {/* Aviso: Adicionar Sons */}
        {showSoundWarning && (
          <Card className="mb-8 border-orange-300 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    ⚠️ Arquivos de Som Necessários
                  </h3>
                  <p className="text-orange-800 mb-3">
                    Os arquivos de som ainda não foram adicionados. Para o sistema funcionar completamente:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-orange-800 mb-4">
                    <li>
                      <strong>Execute o SQL:</strong> <code className="bg-orange-100 px-2 py-1 rounded">scripts/add-sound-preferences.sql</code> no Supabase
                    </li>
                    <li>
                      <strong>Baixe 35 sons MP3</strong> de{' '}
                      <a 
                        href="https://pixabay.com/sound-effects/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Pixabay Sounds
                      </a>
                    </li>
                    <li>
                      <strong>Renomeie e copie</strong> para <code className="bg-orange-100 px-2 py-1 rounded">public/sounds/</code>
                    </li>
                    <li>
                      <strong>Consulte:</strong> <code className="bg-orange-100 px-2 py-1 rounded">docs/COMO_ADICIONAR_SONS.md</code>
                    </li>
                  </ol>
                  <div className="flex gap-3">
                    <Badge className="bg-orange-200 text-orange-900">
                      📄 Ver: public/sounds/README.md
                    </Badge>
                    <Badge className="bg-orange-200 text-orange-900">
                      📚 Ver: docs/COMO_ADICIONAR_SONS.md
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controles Globais */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              Controles Globais
            </CardTitle>
            <CardDescription>
              Configure o volume e ative/desative os sons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle Ativar/Desativar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {isEnabled ? <Volume2 className="w-5 h-5 text-green-600" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sons de Notificações</p>
                  <p className="text-sm text-gray-500">
                    {isEnabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleEnabled}
              />
            </div>

            {/* Slider de Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <Badge variant="outline" className="text-xs">
                  {volume === 0 ? 'Mudo' : volume < 0.3 ? 'Baixo' : volume < 0.7 ? 'Médio' : 'Alto'}
                </Badge>
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                disabled={!isEnabled}
                className="w-full"
              />
            </div>

            {/* Botão Parar Todos */}
            <Button
              onClick={stopAllSounds}
              variant="outline"
              className="w-full"
              disabled={!isEnabled}
            >
              <Square className="w-4 h-4 mr-2" />
              Parar Todos os Sons
            </Button>
          </CardContent>
        </Card>

        {/* Tabs por Categoria */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="notification">Notificações</TabsTrigger>
            <TabsTrigger value="achievement">Conquistas</TabsTrigger>
            <TabsTrigger value="success">Sucesso</TabsTrigger>
            <TabsTrigger value="alert">Alertas</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          {/* Tab: Todos */}
          <TabsContent value="all" className="space-y-6">
            {Object.entries(groupedNotifications).map(([category, items]) => (
              <Card key={category} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                    </div>
                    {category === 'notification' && 'Notificações'}
                    {category === 'achievement' && 'Conquistas'}
                    {category === 'success' && 'Sucesso'}
                    {category === 'alert' && 'Alertas'}
                    {category === 'info' && 'Informações'}
                    <Badge variant="secondary">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(({ key, config }) => (
                      <div
                        key={key}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{config.emoji}</span>
                            <div>
                              <h3 className="font-semibold text-sm text-gray-900">
                                {config.label}
                              </h3>
                              <Badge className={getPriorityBadge(config.priority)}>
                                {config.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                          {config.description}
                        </p>
                        <Button
                          onClick={() => handlePlaySound(key)}
                          disabled={!isEnabled || playingSound === key}
                          className="w-full"
                          size="sm"
                        >
                          {playingSound === key ? (
                            <>
                              <Square className="w-3 h-3 mr-2 animate-pulse" />
                              Tocando...
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-2" />
                              Testar Som
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Tabs individuais por categoria */}
          {Object.entries(groupedNotifications).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                      {getCategoryIcon(category)}
                    </div>
                    {category === 'notification' && 'Notificações'}
                    {category === 'achievement' && 'Conquistas'}
                    {category === 'success' && 'Sucesso'}
                    {category === 'alert' && 'Alertas'}
                    {category === 'info' && 'Informações'}
                  </CardTitle>
                  <CardDescription>
                    {items.length} {items.length === 1 ? 'som disponível' : 'sons disponíveis'} nesta categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(({ key, config }) => (
                      <div
                        key={key}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{config.emoji}</span>
                            <div>
                              <h3 className="font-semibold text-sm text-gray-900">
                                {config.label}
                              </h3>
                              <Badge className={getPriorityBadge(config.priority)}>
                                {config.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                          {config.description}
                        </p>
                        <Button
                          onClick={() => handlePlaySound(key)}
                          disabled={!isEnabled || playingSound === key}
                          className="w-full"
                          size="sm"
                        >
                          {playingSound === key ? (
                            <>
                              <Square className="w-3 h-3 mr-2 animate-pulse" />
                              Tocando...
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-2" />
                              Testar Som
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Estatísticas */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>📊 Estatísticas do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {Object.keys(NOTIFICATION_SOUND_CONFIG).length}
                </p>
                <p className="text-sm text-gray-600">Total de Sons</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {Object.keys(groupedNotifications).length}
                </p>
                <p className="text-sm text-gray-600">Categorias</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(volume * 100)}%
                </p>
                <p className="text-sm text-gray-600">Volume Atual</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold text-orange-600">
                  {isEnabled ? 'ON' : 'OFF'}
                </p>
                <p className="text-sm text-gray-600">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

