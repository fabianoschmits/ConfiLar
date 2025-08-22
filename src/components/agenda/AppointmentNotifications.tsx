'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Clock, AlertTriangle, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  client_name: string;
  service_description: string;
  requested_date: string;
  requested_time: string;
  duration: string;
  address: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  client_phone?: string;
  client_email?: string;
  special_requirements?: string;
}

interface AppointmentNotificationsProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: string, newStatus: string) => Promise<void>;
}

export const AppointmentNotifications: React.FC<AppointmentNotificationsProps> = ({
  appointments,
  onStatusChange
}) => {
  const [notifications, setNotifications] = useState<{
    upcoming: Appointment[];
    overdue: Appointment[];
    pending: Appointment[];
    today: Appointment[];
  }>({
    upcoming: [],
    overdue: [],
    pending: [],
    today: []
  });

  // Organizar notificações
  useEffect(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.requested_date);
      const appointmentDateTime = new Date(appointmentDate);
      const [hours, minutes] = appointment.requested_time.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      return appointmentDateTime > now && appointment.status === 'confirmed';
    }).sort((a, b) => {
      const dateA = parseISO(a.requested_date + ' ' + a.requested_time);
      const dateB = parseISO(b.requested_date + ' ' + b.requested_time);
      return dateA.getTime() - dateB.getTime();
    });

    const overdue = appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.requested_date);
      const appointmentDateTime = new Date(appointmentDate);
      const [hours, minutes] = appointment.requested_time.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      return appointmentDateTime < now && appointment.status === 'confirmed';
    });

    const pending = appointments.filter(appointment => 
      appointment.status === 'pending'
    );

    const todayAppointments = appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.requested_date);
      return isToday(appointmentDate) && appointment.status === 'confirmed';
    });

    setNotifications({
      upcoming: upcoming.slice(0, 5), // Mostrar apenas os próximos 5
      overdue,
      pending,
      today: todayAppointments
    });
  }, [appointments]);

  // Marcar agendamento como concluído
  const handleComplete = async (appointmentId: string) => {
    try {
      await onStatusChange(appointmentId, 'completed');
      toast.success('Agendamento marcado como concluído!');
    } catch (error) {
      toast.error('Erro ao atualizar status do agendamento');
    }
  };

  // Cancelar agendamento
  const handleCancel = async (appointmentId: string) => {
    try {
      await onStatusChange(appointmentId, 'cancelled');
      toast.success('Agendamento cancelado!');
    } catch (error) {
      toast.error('Erro ao cancelar agendamento');
    }
  };

  // Obter tempo restante
  const getTimeRemaining = (date: string, time: string) => {
    const appointmentDateTime = parseISO(date + ' ' + time);
    const now = new Date();
    const diffHours = differenceInHours(appointmentDateTime, now);
    
    if (diffHours < 0) return 'Atrasado';
    if (diffHours === 0) return 'Agora';
    if (diffHours === 1) return 'Em 1 hora';
    if (diffHours < 24) return `Em ${diffHours} horas`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Amanhã';
    return `Em ${diffDays} dias`;
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Agendamentos de Hoje */}
      {notifications.today.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar className="h-5 w-5" />
              Agendamentos de Hoje ({notifications.today.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.today.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">{appointment.client_name}</h4>
                      <p className="text-sm text-blue-700">{appointment.service_description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-blue-600">
                        <span>{appointment.requested_time}</span>
                        <span>{appointment.duration}h</span>
                        <span>{appointment.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleComplete(appointment.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(appointment.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Agendamentos */}
      {notifications.upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.upcoming.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{appointment.client_name}</h4>
                      <p className="text-sm text-gray-600">{appointment.service_description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{format(parseISO(appointment.requested_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        <span>{appointment.requested_time}</span>
                        <span>{appointment.duration}h</span>
                        <Badge variant="outline" className="text-xs">
                          {getTimeRemaining(appointment.requested_date, appointment.requested_time)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(appointment.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agendamentos Pendentes */}
      {notifications.pending.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertTriangle className="h-5 w-5" />
              Agendamentos Pendentes ({notifications.pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.pending.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-900">{appointment.client_name}</h4>
                      <p className="text-sm text-yellow-700">{appointment.service_description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-yellow-600">
                        <span>{format(parseISO(appointment.requested_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        <span>{appointment.requested_time}</span>
                        <span>{appointment.duration}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onStatusChange(appointment.id, 'confirmed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(appointment.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agendamentos Atrasados */}
      {notifications.overdue.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Agendamentos Atrasados ({notifications.overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.overdue.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-red-900">{appointment.client_name}</h4>
                      <p className="text-sm text-red-700">{appointment.service_description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-red-600">
                        <span>{format(parseISO(appointment.requested_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        <span>{appointment.requested_time}</span>
                        <span>{appointment.duration}h</span>
                        <Badge variant="destructive" className="text-xs">
                          Atrasado
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleComplete(appointment.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(appointment.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sem Notificações */}
      {notifications.today.length === 0 && 
       notifications.upcoming.length === 0 && 
       notifications.pending.length === 0 && 
       notifications.overdue.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhuma notificação de agendamento</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};




