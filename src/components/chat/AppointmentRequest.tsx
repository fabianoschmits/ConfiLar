'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Send, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface AppointmentRequestProps {
  professionalId: string;
  professionalName: string;
  onSendRequest: (request: AppointmentRequestData) => void;
  onCancel: () => void;
}

export interface AppointmentRequestData {
  professionalId: string;
  professionalName: string;
  requestedDate: Date;
  requestedTime: string;
  duration: string;
  serviceDescription: string;
  address: string;
  specialRequirements: string;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const durationOptions = [
  { value: '1', label: '1 hora' },
  { value: '1.5', label: '1 hora e 30 min' },
  { value: '2', label: '2 horas' },
  { value: '2.5', label: '2 horas e 30 min' },
  { value: '3', label: '3 horas' },
  { value: '3.5', label: '3 horas e 30 min' },
  { value: '4', label: '4 horas' },
  { value: '4.5', label: '4 horas e 30 min' },
  { value: '5', label: '5 horas' },
  { value: '6', label: '6 horas' },
  { value: '8', label: '8 horas (dia completo)' }
];

export const AppointmentRequest: React.FC<AppointmentRequestProps> = ({
  professionalId,
  professionalName,
  onSendRequest,
  onCancel
}) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('2');
  const [serviceDescription, setServiceDescription] = useState('');
  const [address, setAddress] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time || !serviceDescription || !address) {
      toast.error('POR FAVOR, PREENCHA TODOS OS CAMPOS OBRIGATÓRIOS');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: AppointmentRequestData = {
        professionalId,
        professionalName,
        requestedDate: date,
        requestedTime: time,
        duration,
        serviceDescription,
        address,
        specialRequirements
      };

      await onSendRequest(requestData);
      toast.success('SOLICITAÇÃO DE AGENDAMENTO ENVIADA COM SUCESSO!');
    } catch (error) {
      toast.error('ERRO AO ENVIAR SOLICITAÇÃO DE AGENDAMENTO');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateValid = (selectedDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const getAvailableTimeSlots = () => {
    // Aqui você pode implementar lógica para filtrar horários disponíveis
    // Por exemplo, baseado em agendamentos existentes
    return timeSlots;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Solicitar Agendamento
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>Profissional: <strong>{professionalName}</strong></span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seleção de Data */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Data do Serviço *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => !isDateValid(date)}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seleção de Hora */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium">
              Horário *
            </Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableTimeSlots().map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {slot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Duração */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium">
            Duração Estimada
          </Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descrição do Serviço */}
        <div className="space-y-2">
          <Label htmlFor="serviceDescription" className="text-sm font-medium">
            Descrição do Serviço *
          </Label>
          <Textarea
            id="serviceDescription"
            placeholder="Descreva detalhadamente o serviço que você precisa..."
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Endereço */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Endereço do Serviço *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="address"
              placeholder="Digite o endereço completo..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Requisitos Especiais */}
        <div className="space-y-2">
          <Label htmlFor="specialRequirements" className="text-sm font-medium">
            Requisitos Especiais (opcional)
          </Label>
          <Textarea
            id="specialRequirements"
            placeholder="Alguma observação especial, material necessário, etc..."
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Resumo da Solicitação */}
        {date && time && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Resumo da Solicitação
            </h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Data:</strong> {format(date, 'PPP', { locale: ptBR })}</p>
              <p><strong>Horário:</strong> {time}</p>
              <p><strong>Duração:</strong> {durationOptions.find(d => d.value === duration)?.label}</p>
              <p><strong>Serviço:</strong> {serviceDescription}</p>
              <p><strong>Endereço:</strong> {address}</p>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!date || !time || !serviceDescription || !address || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitação
              </>
            )}
          </Button>
        </div>

        {/* Informações Importantes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Informações Importantes:</p>
              <ul className="space-y-1 text-xs">
                <li>• O profissional receberá sua solicitação e responderá em até 24h</li>
                <li>• Você será notificado quando o agendamento for confirmado ou recusado</li>
                <li>• Mantenha os dados atualizados para facilitar o contato</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};




