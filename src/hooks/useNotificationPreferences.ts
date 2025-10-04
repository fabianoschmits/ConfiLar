'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

export interface NotificationPreferences {
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  sms_notifications: boolean
  message_notifications: boolean
  review_notifications: boolean
  booking_notifications: boolean
  achievement_notifications: boolean
  marketing_notifications: boolean
  system_notifications: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  timezone: string
  created_at: string
  updated_at: string
}

export function useNotificationPreferences() {
  const { user } = useAuthContext()
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar preferências do usuário
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Usuário não tem preferências, criar padrão
          await createDefaultPreferences()
          return
        }
        throw fetchError
      }

      setPreferences(data)
    } catch (err) {
      console.error('Erro ao carregar preferências:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Criar preferências padrão
  const createDefaultPreferences = useCallback(async () => {
    if (!user?.id) return

    try {
      const defaultPreferences: Omit<NotificationPreferences, 'user_id'> = {
        push_enabled: true,
        email_enabled: true,
        sms_notifications: false,
        message_notifications: true,
        review_notifications: true,
        booking_notifications: true,
        achievement_notifications: true,
        marketing_notifications: false,
        system_notifications: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'America/Sao_Paulo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error: createError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          ...defaultPreferences
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      setPreferences(data)
    } catch (err) {
      console.error('Erro ao criar preferências padrão:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar preferências')
    }
  }, [user?.id])

  // Salvar preferências
  const savePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user?.id || !preferences) return

    try {
      setSaving(true)
      setError(null)

      const updatedPreferences = {
        ...preferences,
        ...newPreferences,
        updated_at: new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('notification_preferences')
        .update(updatedPreferences)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      setPreferences(updatedPreferences)
      return { success: true, data: updatedPreferences }
    } catch (err) {
      console.error('Erro ao salvar preferências:', err)
      setError(err instanceof Error ? err.message : 'Erro ao salvar preferências')
      return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
    } finally {
      setSaving(false)
    }
  }, [user?.id, preferences])

  // Atualizar uma preferência específica
  const updatePreference = useCallback(async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return

    const updatedPreferences = {
      ...preferences,
      [key]: value,
      updated_at: new Date().toISOString()
    }

    return await savePreferences(updatedPreferences)
  }, [preferences, savePreferences])

  // Verificar se uma notificação deve ser enviada
  const shouldSendNotification = useCallback((type: 'message' | 'review' | 'booking' | 'achievement' | 'marketing' | 'system') => {
    if (!preferences) return true

    switch (type) {
      case 'message':
        return preferences.message_notifications && preferences.push_enabled
      case 'review':
        return preferences.review_notifications && preferences.push_enabled
      case 'booking':
        return preferences.booking_notifications && preferences.push_enabled
      case 'achievement':
        return preferences.achievement_notifications && preferences.push_enabled
      case 'marketing':
        return preferences.marketing_notifications && preferences.push_enabled
      case 'system':
        return preferences.system_notifications && preferences.push_enabled
      default:
        return true
    }
  }, [preferences])

  // Verificar se está em horário silencioso
  const isQuietHours = useCallback(() => {
    if (!preferences) return false

    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    
    const startTime = preferences.quiet_hours_start
    const endTime = preferences.quiet_hours_end

    // Se o horário de silêncio cruza a meia-noite
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    } else {
      return currentTime >= startTime && currentTime <= endTime
    }
  }, [preferences])

  // Carregar preferências quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      loadPreferences()
    }
  }, [user?.id, loadPreferences])

  return {
    preferences,
    loading,
    saving,
    error,
    loadPreferences,
    savePreferences,
    updatePreference,
    shouldSendNotification,
    isQuietHours,
    createDefaultPreferences
  }
}
