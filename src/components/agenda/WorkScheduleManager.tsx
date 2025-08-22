'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Settings, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface WorkSchedule {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
  professional_id: string;
}

interface WeeklyTemplate {
  day_of_week: number; // 0 = Domingo, 1 = Segunda, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const WorkScheduleManager: React.FC = () => {
  const { profile } = useAuthContext();
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showWeeklyTemplate, setShowWeeklyTemplate] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Estados para formulários
  const [newSchedule, setNewSchedule] = useState({
    date: '',
    start_time: '08:00',
    end_time: '18:00',
    is_available: true,
    notes: ''
  });

  const [weeklyTemplate, setWeeklyTemplate] = useState<WeeklyTemplate[]>([
    { day_of_week: 1, start_time: '08:00', end_time: '18:00', is_available: true }, // Segunda
    { day_of_week: 2, start_time: '08:00', end_time: '18:00', is_available: true }, // Terça
    { day_of_week: 3, start_time: '08:00', end_time: '18:00', is_available: true }, // Quarta
    { day_of_week: 4, start_time: '08:00', end_time: '18:00', is_available: true }, // Quinta
    { day_of_week: 5, start_time: '08:00', end_time: '18:00', is_available: true }, // Sexta
    { day_of_week: 6, start_time: '08:00', end_time: '18:00', is_available: true }, // Sábado
    { day_of_week: 0, start_time: '08:00', end_time: '18:00', is_available: false }, // Domingo
  ]);

  // Carregar horários de trabalho
  useEffect(() => {
    if (profile?.id) {
      loadWorkSchedules();
    }
  }, [profile?.id]);

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

  // Adicionar horário de trabalho
  const handleAddSchedule = async () => {
    try {
      const { error } = await supabase
        .from('work_schedules')
        .insert({
          ...newSchedule,
          professional_id: profile?.id
        });

      if (error) throw error;

      toast.success('Horário de trabalho adicionado com sucesso!');
      setShowAddSchedule(false);
      setNewSchedule({
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

  // Aplicar template semanal
  const applyWeeklyTemplate = async () => {
    setIsLoading(true);
    try {
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ 
        start: weekStart, 
        end: addDays(weekStart, 6) 
      });

      // Criar horários para cada dia da semana
      const schedulesToInsert = weekDays.map(day => {
        const template = weeklyTemplate.find(t => t.day_of_week === day.getDay());
        return {
          date: format(day, 'yyyy-MM-dd'),
          start_time: template?.start_time || '08:00',
          end_time: template?.end_time || '18:00',
          is_available: template?.is_available || false,
          notes: `Template semanal aplicado em ${format(day, 'dd/MM/yyyy', { locale: ptBR })}`,
          professional_id: profile?.id
        };
      });

      const { error } = await supabase
        .from('work_schedules')
        .insert(schedulesToInsert);

      if (error) throw error;

      toast.success('Template semanal aplicado com sucesso!');
      setShowWeeklyTemplate(false);
      loadWorkSchedules();
    } catch (error) {
      console.error('Erro ao aplicar template semanal:', error);
      toast.error('Erro ao aplicar template semanal');
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir horário de trabalho
  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('work_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast.success('Horário de trabalho excluído com sucesso!');
      loadWorkSchedules();
    } catch (error) {
      console.error('Erro ao excluir horário de trabalho:', error);
      toast.error('Erro ao excluir horário de trabalho');
    }
  };

  // Obter horários para uma semana específica
  const getWeekSchedules = (weekStart: Date) => {
    const weekEnd = addDays(weekStart, 6);
    return workSchedules.filter(schedule => {
      const scheduleDate = parseISO(schedule.date);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    });
  };

  // Obter nome do dia da semana
  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayOfWeek];
  };

  const currentWeekSchedules = getWeekSchedules(startOfWeek(selectedWeek, { weekStartsOn: 1 }));

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gerenciar Horários de Trabalho</CardTitle>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAddSchedule(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Horário
              </Button>
              <Button
                onClick={() => setShowWeeklyTemplate(true)}
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Template Semanal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Semana:</Label>
              <Input
                type="date"
                value={format(selectedWeek, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                className="w-40"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedWeek(new Date())}
            >
              Hoje
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualização da Semana */}
      <Card>
        <CardHeader>
          <CardTitle>Horários da Semana</CardTitle>
          <div className="text-sm text-gray-600">
            {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: ptBR })} - {format(addDays(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 6), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {eachDayOfInterval({ 
              start: startOfWeek(selectedWeek, { weekStartsOn: 1 }), 
              end: addDays(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 6) 
            }).map((day) => {
              const daySchedule = currentWeekSchedules.find(schedule => 
                isSameDay(parseISO(schedule.date), day)
              );
              
              return (
                <div key={day.toISOString()} className="text-center">
                  <div className="font-medium text-sm mb-2">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {format(day, 'dd/MM', { locale: ptBR })}
                  </div>
                  
                  {daySchedule ? (
                    <div className="space-y-2">
                      <Badge 
                        variant={daySchedule.is_available ? "default" : "secondary"}
                        className="text-xs w-full"
                      >
                        {daySchedule.start_time} - {daySchedule.end_time}
                      </Badge>
                      {daySchedule.notes && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {daySchedule.notes}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(daySchedule.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      Sem horário definido
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal para Adicionar Horário */}
      <Dialog open={showAddSchedule} onOpenChange={setShowAddSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Horário de Trabalho</DialogTitle>
            <DialogDescription>
              Configure sua disponibilidade para uma data específica
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule_date">Data *</Label>
              <Input
                id="schedule_date"
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule_start">Horário de Início</Label>
                <Input
                  id="schedule_start"
                  type="time"
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule_end">Horário de Fim</Label>
                <Input
                  id="schedule_end"
                  type="time"
                  value={newSchedule.end_time}
                  onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="schedule_available"
                checked={newSchedule.is_available}
                onCheckedChange={(checked) => setNewSchedule({...newSchedule, is_available: checked})}
              />
              <Label htmlFor="schedule_available">Disponível para agendamentos</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule_notes">Observações</Label>
              <Textarea
                id="schedule_notes"
                value={newSchedule.notes}
                onChange={(e) => setNewSchedule({...newSchedule, notes: e.target.value})}
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddSchedule(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSchedule}>
              Adicionar Horário
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Template Semanal */}
      <Dialog open={showWeeklyTemplate} onOpenChange={setShowWeeklyTemplate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Semanal de Horários</DialogTitle>
            <DialogDescription>
              Configure um padrão semanal de horários de trabalho
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Configure os horários padrão para cada dia da semana. Este template será aplicado para a semana selecionada.
            </div>
            
            {weeklyTemplate.map((day, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-24 font-medium">
                  {getDayName(day.day_of_week)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => {
                      const newTemplate = [...weeklyTemplate];
                      newTemplate[index].start_time = e.target.value;
                      setWeeklyTemplate(newTemplate);
                    }}
                    className="w-24"
                  />
                  <span className="text-gray-500">até</span>
                  <Input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => {
                      const newTemplate = [...weeklyTemplate];
                      newTemplate[index].end_time = e.target.value;
                      setWeeklyTemplate(newTemplate);
                    }}
                    className="w-24"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={day.is_available}
                    onCheckedChange={(checked) => {
                      const newTemplate = [...weeklyTemplate];
                      newTemplate[index].is_available = checked;
                      setWeeklyTemplate(newTemplate);
                    }}
                  />
                  <span className="text-sm">Disponível</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowWeeklyTemplate(false)}>
              Cancelar
            </Button>
            <Button onClick={applyWeeklyTemplate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Aplicando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Aplicar Template
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};




