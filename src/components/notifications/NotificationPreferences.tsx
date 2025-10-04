'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageCircle, 
  Star, 
  Calendar, 
  Shield, 
  Settings,
  Clock,
  Globe,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/hooks/useUnifiedAuth'
import { supabase } from '@/lib/supabase'

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  chat_notifications: boolean
  review_notifications: boolean
  booking_notifications: boolean
  system_notifications: boolean
  marketing_notifications: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  timezone: string
}

export function NotificationPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    chat_notifications: true,
    review_notifications: true,
    booking_notifications: true,
    system_notifications: true,
    marketing_notifications: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'America/Sao_Paulo'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadPreferences()
    }
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar preferências:', error)
        return
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false,
          chat_notifications: data.chat_notifications ?? true,
          review_notifications: data.review_notifications ?? true,
          booking_notifications: data.booking_notifications ?? true,
          system_notifications: data.system_notifications ?? true,
          marketing_notifications: data.marketing_notifications ?? false,
          quiet_hours_start: data.quiet_hours_start ?? '22:00',
          quiet_hours_end: data.quiet_hours_end ?? '08:00',
          timezone: data.timezone ?? 'America/Sao_Paulo'
        })
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePreferences = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erro ao salvar preferências:', error)
        return
      }

      console.log('✅ Preferências salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Canais de notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>
            Escolha como você quer receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-gray-500">Receber notificações por email</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-sm text-gray-500">Receber notificações no navegador</p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-gray-500" />
              <div>
                <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                <p className="text-sm text-gray-500">Receber notificações por SMS (premium)</p>
              </div>
            </div>
            <Switch
              id="sms-notifications"
              checked={preferences.sms_notifications}
              onCheckedChange={(checked) => updatePreference('sms_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tipos de notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Tipos de Notificação
          </CardTitle>
          <CardDescription>
            Escolha quais tipos de notificação você quer receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <div>
                <Label htmlFor="chat-notifications">Mensagens de Chat</Label>
                <p className="text-sm text-gray-500">Notificações de novas mensagens</p>
              </div>
            </div>
            <Switch
              id="chat-notifications"
              checked={preferences.chat_notifications}
              onCheckedChange={(checked) => updatePreference('chat_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <Label htmlFor="review-notifications">Avaliações</Label>
                <p className="text-sm text-gray-500">Notificações de novas avaliações</p>
              </div>
            </div>
            <Switch
              id="review-notifications"
              checked={preferences.review_notifications}
              onCheckedChange={(checked) => updatePreference('review_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-green-500" />
              <div>
                <Label htmlFor="booking-notifications">Agendamentos</Label>
                <p className="text-sm text-gray-500">Notificações de agendamentos</p>
              </div>
            </div>
            <Switch
              id="booking-notifications"
              checked={preferences.booking_notifications}
              onCheckedChange={(checked) => updatePreference('booking_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-purple-500" />
              <div>
                <Label htmlFor="system-notifications">Sistema</Label>
                <p className="text-sm text-gray-500">Notificações importantes do sistema</p>
              </div>
            </div>
            <Switch
              id="system-notifications"
              checked={preferences.system_notifications}
              onCheckedChange={(checked) => updatePreference('system_notifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-orange-500" />
              <div>
                <Label htmlFor="marketing-notifications">Marketing</Label>
                <p className="text-sm text-gray-500">Promoções e ofertas especiais</p>
              </div>
            </div>
            <Switch
              id="marketing-notifications"
              checked={preferences.marketing_notifications}
              onCheckedChange={(checked) => updatePreference('marketing_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Horários silenciosos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horários Silenciosos
          </CardTitle>
          <CardDescription>
            Configure horários em que você não quer receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet-start">Início do silêncio</Label>
              <Input
                id="quiet-start"
                type="time"
                value={preferences.quiet_hours_start}
                onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quiet-end">Fim do silêncio</Label>
              <Input
                id="quiet-end"
                type="time"
                value={preferences.quiet_hours_end}
                onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fuso horário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Fuso Horário
          </CardTitle>
          <CardDescription>
            Selecione seu fuso horário para notificações precisas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.timezone}
            onValueChange={(value) => updatePreference('timezone', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fuso horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
              <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
              <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
              <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Botão salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={savePreferences} 
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  )
}

