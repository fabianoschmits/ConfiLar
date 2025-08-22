'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface WorkSchedule {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
}

interface WeeklyAgendaViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  workSchedules: WorkSchedule[];
}

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
];

export const WeeklyAgendaView: React.FC<WeeklyAgendaViewProps> = ({
  selectedDate,
  appointments,
  workSchedules
}) => {
  // Obter semana atual
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Segunda-feira
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Domingo
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Obter agendamentos para uma data e hora específica
  const getAppointmentsForDateTime = (date: Date, time: string) => {
    return appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.requested_date);
      const appointmentTime = appointment.requested_time;
      
      return isSameDay(appointmentDate, date) && appointmentTime === time;
    });
  };

  // Verificar se há horário de trabalho para uma data
  const getWorkScheduleForDate = (date: Date) => {
    return workSchedules.find(schedule => 
      isSameDay(parseISO(schedule.date), date)
    );
  };

  // Verificar se um horário está dentro do período de trabalho
  const isWithinWorkHours = (date: Date, time: string) => {
    const workSchedule = getWorkScheduleForDate(date);
    if (!workSchedule || !workSchedule.is_available) return false;
    
    const timeValue = time;
    return timeValue >= workSchedule.start_time && timeValue <= workSchedule.end_time;
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
    <Card>
      <CardHeader>
        <CardTitle>Visualização Semanal</CardTitle>
        <div className="text-sm text-gray-600">
          {format(weekStart, 'dd/MM/yyyy', { locale: ptBR })} - {format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Cabeçalho dos dias */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="w-20"></div> {/* Espaço para horários */}
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="text-center p-2 border rounded-lg">
                  <div className="font-medium text-sm">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className="text-xs text-gray-600">
                    {format(day, 'dd/MM', { locale: ptBR })}
                  </div>
                </div>
              ))}
            </div>

            {/* Linhas de horários */}
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-1 mb-1">
                {/* Coluna de horário */}
                <div className="w-20 p-2 text-xs text-gray-600 font-medium border-r">
                  {time}
                </div>

                {/* Colunas dos dias */}
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDateTime(day, time);
                  const workSchedule = getWorkScheduleForDate(day);
                  const isWorkTime = isWithinWorkHours(day, time);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[60px] p-1 border rounded-lg ${
                        isWorkTime ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      {/* Indicador de horário de trabalho */}
                      {workSchedule && time === workSchedule.start_time && (
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          🕐 Trabalho
                        </div>
                      )}

                      {/* Agendamentos */}
                      {dayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`p-2 rounded text-xs border ${getStatusColor(appointment.status)} mb-1`}
                        >
                          <div className="font-medium truncate">
                            {appointment.client_name}
                          </div>
                          <div className="text-xs opacity-75 truncate">
                            {appointment.service_description}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                            <Clock className="h-3 w-3" />
                            {appointment.duration}h
                          </div>
                        </div>
                      ))}

                      {/* Indicador de disponibilidade */}
                      {isWorkTime && dayAppointments.length === 0 && (
                        <div className="text-xs text-blue-600 text-center mt-2">
                          Disponível
                        </div>
                      )}

                      {/* Indicador de fora do horário de trabalho */}
                      {!isWorkTime && (
                        <div className="text-xs text-gray-400 text-center mt-2">
                          Indisponível
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Legenda</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Confirmado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Cancelado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
              <span>Horário de Trabalho</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
              <span>Fora do Horário</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};




