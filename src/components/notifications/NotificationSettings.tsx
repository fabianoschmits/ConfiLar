'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, Mail, Settings } from 'lucide-react';
import { useNotifications } from './NotificationProviderSimple';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface NotificationPreferences {
  id?: string;
  user_id?: string;
  push: boolean;
  email: boolean;
  inApp: boolean;
  messages: boolean;
  reviews: boolean;
  updates: boolean;
  marketing: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const NotificationSettings: React.FC = () => {
  const { hasPermission, requestPermission } = useNotifications();
  const { user } = useAuthContext();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push: hasPermission,
    email: true,
    inApp: true,
    messages: true,
    reviews: true,
    updates: true,
    marketing: false,
  });
  const [loading, setLoading] = useState(false);

  // Carregar preferências do banco de dados
  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setPreferences({
          ...preferences,
          ...data,
          push: hasPermission
        });
      }
    } catch (error) {
      console.log('Usando preferências padrão');
    }
  };

  // Salvar preferências no banco de dados
  const savePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Erro ao salvar preferências:', error);
        toast.error('ERRO AO SALVAR PREFERÊNCIAS');
        return;
      }

      toast.success('PREFERÊNCIAS SALVAS COM SUCESSO!');
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast.error('ERRO AO SALVAR PREFERÊNCIAS');
    } finally {
      setLoading(false);
    }
  };

  // Carregar preferências quando o componente montar
  useEffect(() => {
    loadPreferences();
  }, [user]);

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    setPreferences(prev => ({ ...prev, push: granted }));
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    // Salvar no banco de dados
    await savePreferences(newPreferences);
  };

  const handleSaveAll = async () => {
    await savePreferences(preferences);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Configurações de Notificação</h2>
      </div>

      {/* Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Permissões
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-notifications">Notificações Push</Label>
              <p className="text-sm text-gray-500">
                Receber notificações mesmo quando o site não está aberto
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasPermission ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Ativado</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePermissionRequest}
                >
                  Ativar
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications">Notificações por Email</Label>
              <p className="text-sm text-gray-500">
                Receber notificações importantes por email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email}
              onCheckedChange={(checked) => handlePreferenceChange('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="in-app-notifications">Notificações no App</Label>
              <p className="text-sm text-gray-500">
                Mostrar notificações dentro do aplicativo
              </p>
            </div>
            <Switch
              id="in-app-notifications"
              checked={preferences.inApp}
              onCheckedChange={(checked) => handlePreferenceChange('inApp', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificação</CardTitle>
          <CardDescription>
            Escolha quais tipos de notificação você deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="messages"
              checked={preferences.messages}
              onCheckedChange={(checked) => handlePreferenceChange('messages', checked as boolean)}
            />
            <Label htmlFor="messages" className="flex-1">
              <div className="font-medium">Mensagens</div>
              <div className="text-sm text-gray-500">
                Novas mensagens de clientes ou profissionais
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="reviews"
              checked={preferences.reviews}
              onCheckedChange={(checked) => handlePreferenceChange('reviews', checked as boolean)}
            />
            <Label htmlFor="reviews" className="flex-1">
              <div className="font-medium">Avaliações</div>
              <div className="text-sm text-gray-500">
                Novas avaliações e comentários sobre seus serviços
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="updates"
              checked={preferences.updates}
              onCheckedChange={(checked) => handlePreferenceChange('updates', checked as boolean)}
            />
            <Label htmlFor="updates" className="flex-1">
              <div className="font-medium">Atualizações</div>
              <div className="text-sm text-gray-500">
                Atualizações importantes sobre o sistema e funcionalidades
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="marketing"
              checked={preferences.marketing}
              onCheckedChange={(checked) => handlePreferenceChange('marketing', checked as boolean)}
            />
            <Label htmlFor="marketing" className="flex-1">
              <div className="font-medium">Marketing</div>
              <div className="text-sm text-gray-500">
                Ofertas especiais e novidades (opcional)
              </div>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Horários */}
      <Card>
        <CardHeader>
          <CardTitle>Horários de Notificação</CardTitle>
          <CardDescription>
            Configure quando você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário de Início</Label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Horário de Fim</Label>
              <input
                type="time"
                defaultValue="22:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="quiet-hours" defaultChecked />
            <Label htmlFor="quiet-hours">
              Respeitar horário de silêncio (não receber notificações fora do horário)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
        <Button onClick={handleSaveAll}>
          Salvar Todas as Configurações
        </Button>
      </div>
    </div>
  );
};










