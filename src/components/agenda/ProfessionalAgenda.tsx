'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, Eye, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { WeeklyAgendaView } from './WeeklyAgendaView';
import { WorkScheduleManager } from './WorkScheduleManager';
import { AppointmentNotifications } from './AppointmentNotifications';

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
  created_at: string;
}

interface WorkSchedule {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
}

export const ProfessionalAgenda: React.FC = () => {
  const { profile } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'schedule'>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddWorkSchedule, setShowAddWorkSchedule] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para formulários
  const [newAppointment, setNewAppointment] = useState({
    client_name: '',
    service_description: '',
    requested_date: '',
    requested_time: '',
    duration: '2',
    address: '',
    client_phone: '',
    client_email: '',
    special_requirements: ''
  });

  const [newWorkSchedule, setNewWorkSchedule] = useState({
    date: '',
    start_time: '08:00',
    end_time: '18:00',
    is_available: true,
    notes: ''
  });

  // Carregar agendamentos e horários de trabalho
  useEffect(() => {
    if (profile?.id) {
      loadAppointments();
      loadWorkSchedules();
    }
  }, [profile?.id]);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('professional_id', profile?.id)
        .order('requested_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    }
  };

  const loadWorkSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('work_schedules')
        .select('*')
        .eq('professional_id', profile?.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setWorkSchedules(data || []);
    } catch (error) {
      console.error('Erro ao carregar horários de trabalho:', error);
      toast.error('Erro ao carregar horários de trabalho');
    }
  };

  // Filtrar agendamentos
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesSearch = appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service_description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Obter agendamentos para uma data específica
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(parseISO(appointment.requested_date), date)
    );
  };

  // Verificar se uma data tem horários de trabalho
  const getWorkScheduleForDate = (date: Date) => {
    return workSchedules.find(schedule => 
      isSameDay(parseISO(schedule.date), date)
    );
  };

  // Adicionar novo agendamento
  const handleAddAppointment = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          ...newAppointment,
          professional_id: profile?.id,
          status: 'confirmed'
        });

      if (error) throw error;

      toast.success('Agendamento adicionado com sucesso!');
      setShowAddAppointment(false);
      setNewAppointment({
        client_name: '',
        service_description: '',
        requested_date: '',
        requested_time: '',
        duration: '2',
        address: '',
        client_phone: '',
        client_email: '',
        special_requirements: ''
      });
      loadAppointments();
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      toast.error('Erro ao adicionar agendamento');
    }
  };

  // Adicionar horário de trabalho
  const handleAddWorkSchedule = async () => {
    try {
      const { error } = await supabase
        .from('work_schedules')
        .insert({
          ...newWorkSchedule,
          professional_id: profile?.id
        });

      if (error) throw error;

      toast.success('Horário de trabalho adicionado com sucesso!');
      setShowAddWorkSchedule(false);
      setNewWorkSchedule({
        date: '',
        start_time: '08:00',
        end_time: '18:00',
        is_available: true,
        notes: ''
      });
      loadWorkSchedules();
    } catch (error) {
      console.error('Erro ao adicionar horário de trabalho:', error);
      toast.error('Erro ao adicionar horário de trabalho');
    }
  };

  // Atualizar status do agendamento
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast.success('Status do agendamento atualizado com sucesso!');
      loadAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status do agendamento:', error);
      toast.error('Erro ao atualizar status do agendamento');
    }
  };

  // Renderizar indicadores no calendário
  const renderCalendarDay = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date);
    const workSchedule = getWorkScheduleForDate(date);
    
    return (
      <div className="relative min-h-[80px] p-2">
        <span className="text-sm font-medium">
          {format(date, 'd')}
        </span>
        
        {/* Indicador de horário de trabalho */}
        {workSchedule && (
          <div className="mt-1">
            <Badge 
              variant={workSchedule.is_available ? "default" : "secondary"}
              className="text-xs"
            >
              {workSchedule.start_time} - {workSchedule.end_time}
            </Badge>
          </div>
        )}
        
        {/* Indicadores de agendamentos */}
        {dayAppointments.slice(0, 2).map((appointment, index) => (
          <div 
            key={appointment.id}
            className={`mt-1 p-1 rounded text-xs truncate ${
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {appointment.client_name} - {appointment.requested_time}
          </div>
        ))}
        
        {/* Indicador de mais agendamentos */}
        {dayAppointments.length > 2 && (
          <div className="mt-1 text-xs text-gray-500">
            +{dayAppointments.length - 2} mais
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controles da Agenda */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Controles da Agenda</CardTitle>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddAppointment(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
              <Button
                onClick={() => setShowAddWorkSchedule(true)}
                variant="outline"
              >
                <Clock className="h-4 w-4 mr-2" />
                Horário de Trabalho
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Filtros */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Status:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Busca */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            {/* Modo de Visualização */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Visualização:</Label>
              <Select value={viewMode} onValueChange={(value: string) => setViewMode(value as 'month' | 'week' | 'day' | 'schedule')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="day">Dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendário Principal com Abas */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Agendamentos</CardTitle>
          <CardDescription>
            Visualize e gerencie seus agendamentos e horários de trabalho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'month' | 'week' | 'day' | 'schedule')} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="month">Visualização Mensal</TabsTrigger>
              <TabsTrigger value="week">Visualização Semanal</TabsTrigger>
              <TabsTrigger value="day">Visualização Diária</TabsTrigger>
              <TabsTrigger value="schedule">Gerenciar Horários</TabsTrigger>
            </TabsList>
            
            <TabsContent value="month" className="mt-6">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                locale={ptBR}
                // Removido: DayContent não existe no shadcn/ui Calendar
              />
            </TabsContent>
            
            <TabsContent value="week" className="mt-6">
              <WeeklyAgendaView
                selectedDate={selectedDate}
                appointments={appointments}
                workSchedules={workSchedules}
              />
            </TabsContent>
            
            <TabsContent value="day" className="mt-6">
              <div className="text-center py-8">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Visualização Diária
                </h3>
                <p className="text-gray-500">
                  Visualização detalhada por dia será implementada em breve
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="mt-6">
              <WorkScheduleManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

                  {/* Notificações e Agendamentos */}
            <div className="space-y-6">
              {/* Notificações de Agendamentos */}
              <AppointmentNotifications
                appointments={appointments}
                onStatusChange={handleStatusChange}
              />
              
              {/* Lista de Agendamentos do Dia */}
              <Card>
                <CardHeader>
                  <CardTitle>Agendamentos do Dia</CardTitle>
                  <CardDescription>
                    {format(selectedDate, 'PPP', { locale: ptBR })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getAppointmentsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Nenhum agendamento para esta data</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getAppointmentsForDate(selectedDate).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{appointment.client_name}</h4>
                              <p className="text-sm text-gray-600">{appointment.service_description}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>{appointment.requested_time}</span>
                                <span>{appointment.duration}h</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {appointment.address}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                appointment.status === 'confirmed' ? 'default' :
                                appointment.status === 'pending' ? 'secondary' :
                                appointment.status === 'cancelled' ? 'destructive' :
                                'outline'
                              }
                            >
                              {appointment.status === 'confirmed' ? 'Confirmado' :
                               appointment.status === 'pending' ? 'Confirmado' :
                               appointment.status === 'cancelled' ? 'Cancelado' :
                               'Concluído'}
                            </Badge>
                            
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

      {/* Modal para Adicionar Agendamento */}
      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Agendamento</DialogTitle>
            <DialogDescription>
              Crie um novo agendamento manualmente
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nome do Cliente *</Label>
              <Input
                id="client_name"
                value={newAppointment.client_name}
                onChange={(e) => setNewAppointment({...newAppointment, client_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requested_date">Data *</Label>
              <Input
                id="requested_date"
                type="date"
                value={newAppointment.requested_date}
                onChange={(e) => setNewAppointment({...newAppointment, requested_date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requested_time">Horário *</Label>
              <Input
                id="requested_time"
                type="time"
                value={newAppointment.requested_time}
                onChange={(e) => setNewAppointment({...newAppointment, requested_time: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (horas)</Label>
              <Select value={newAppointment.duration} onValueChange={(value) => setNewAppointment({...newAppointment, duration: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="3">3 horas</SelectItem>
                  <SelectItem value="4">4 horas</SelectItem>
                  <SelectItem value="5">5 horas</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="8">8 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service_description">Descrição do Serviço *</Label>
            <Textarea
              id="service_description"
              value={newAppointment.service_description}
              onChange={(e) => setNewAppointment({...newAppointment, service_description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={newAppointment.address}
              onChange={(e) => setNewAppointment({...newAppointment, address: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_phone">Telefone do Cliente</Label>
              <Input
                id="client_phone"
                value={newAppointment.client_phone}
                onChange={(e) => setNewAppointment({...newAppointment, client_phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_email">Email do Cliente</Label>
              <Input
                id="client_email"
                type="email"
                value={newAppointment.client_email}
                onChange={(e) => setNewAppointment({...newAppointment, client_email: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="special_requirements">Requisitos Especiais</Label>
            <Textarea
              id="special_requirements"
              value={newAppointment.special_requirements}
              onChange={(e) => setNewAppointment({...newAppointment, special_requirements: e.target.value})}
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddAppointment(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddAppointment}>
              Adicionar Agendamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Adicionar Horário de Trabalho */}
      <Dialog open={showAddWorkSchedule} onOpenChange={setShowAddWorkSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Definir Horário de Trabalho</DialogTitle>
            <DialogDescription>
              Configure sua disponibilidade para uma data específica
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work_date">Data *</Label>
              <Input
                id="work_date"
                type="date"
                value={newWorkSchedule.date}
                onChange={(e) => setNewWorkSchedule({...newWorkSchedule, date: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Horário de Início</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={newWorkSchedule.start_time}
                  onChange={(e) => setNewWorkSchedule({...newWorkSchedule, start_time: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_time">Horário de Fim</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={newWorkSchedule.end_time}
                  onChange={(e) => setNewWorkSchedule({...newWorkSchedule, end_time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="work_notes">Observações</Label>
              <Textarea
                id="work_notes"
                value={newWorkSchedule.notes}
                onChange={(e) => setNewWorkSchedule({...newWorkSchedule, notes: e.target.value})}
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddWorkSchedule(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddWorkSchedule}>
              Definir Horário
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
