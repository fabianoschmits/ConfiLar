'use client';

import React from 'react';
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AppointmentMessageProps {
  message: {
    id: string;
    content: string;
    metadata: {
      type: 'appointment_request' | 'appointment_response';
      appointmentData: {
        requestedDate: string;
        requestedTime: string;
        duration: string;
        serviceDescription: string;
        address: string;
        specialRequirements?: string;
        status?: 'pending' | 'accepted' | 'rejected';
        responseMessage?: string;
        responseReason?: string;
      };
    };
    sender_id: string;
    created_at: string;
  };
  isOwnMessage: boolean;
  onViewDetails?: () => void;
}

const durationLabels: Record<string, string> = {
  '1': '1 hora',
  '1.5': '1 hora e 30 min',
  '2': '2 horas',
  '2.5': '2 horas e 30 min',
  '3': '3 horas',
  '3.5': '3 horas e 30 min',
  '4': '4 horas',
  '4.5': '4 horas e 30 min',
  '5': '5 horas',
  '6': '6 horas',
  '8': '8 horas (dia completo)'
};

export const AppointmentMessage: React.FC<AppointmentMessageProps> = ({
  message,
  isOwnMessage,
  onViewDetails
}) => {
  const { type, appointmentData } = message.metadata;
  const isRequest = type === 'appointment_request';
  const isResponse = type === 'appointment_response';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 text-xs">Pendente</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 text-xs">Confirmado</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Recusado</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  if (isRequest) {
    return (
      <div className={cn(
        "flex w-full",
        isOwnMessage ? "justify-end" : "justify-start"
      )}>
        <Card className={cn(
          "max-w-md",
          isOwnMessage 
            ? "bg-blue-600 dark:bg-white dark:text-gray-900 text-white border-blue-600 dark:border-gray-300" 
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
        )}>
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-sm">Solicitação de Agendamento</span>
              </div>
              {appointmentData.status && getStatusBadge(appointmentData.status)}
            </div>

            {/* Detalhes do Agendamento */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(appointmentData.requestedDate), 'PPP', { locale: ptBR })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{appointmentData.requestedTime} ({durationLabels[appointmentData.duration]})</span>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 mt-0.5" />
                <span className="text-xs">{appointmentData.address}</span>
              </div>
            </div>

            {/* Descrição do Serviço */}
            <div className="mt-3 p-2 bg-white/10 rounded border border-white/20">
              <p className="text-sm font-medium mb-1">Serviço:</p>
              <p className="text-xs">{appointmentData.serviceDescription}</p>
            </div>

            {/* Requisitos Especiais */}
            {appointmentData.specialRequirements && (
              <div className="mt-2 p-2 bg-white/10 rounded border border-white/20">
                <p className="text-sm font-medium mb-1">Requisitos:</p>
                <p className="text-xs">{appointmentData.specialRequirements}</p>
              </div>
            )}

            {/* Status e Ações */}
            {appointmentData.status === 'pending' && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-xs text-yellow-200">
                  <AlertCircle className="h-3 w-3" />
                  Aguardando resposta do profissional
                </div>
              </div>
            )}

            {appointmentData.status && appointmentData.status !== 'pending' && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-xs">
                  {getStatusIcon(appointmentData.status)}
                  <span>
                    {appointmentData.status === 'accepted' ? 'Agendamento confirmado!' : 'Agendamento recusado'}
                  </span>
                </div>
                {appointmentData.responseMessage && (
                  <p className="text-xs mt-1 opacity-90">{appointmentData.responseMessage}</p>
                )}
                {appointmentData.responseReason && (
                  <p className="text-xs mt-1 opacity-90 text-red-200">{appointmentData.responseReason}</p>
                )}
              </div>
            )}

            {/* Botão de Detalhes */}
            {onViewDetails && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewDetails}
                  className="w-full text-xs h-7 border-white/30 text-white hover:bg-white/10"
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isResponse) {
    return (
      <div className={cn(
        "flex w-full",
        isOwnMessage ? "justify-end" : "justify-start"
      )}>
        <Card className={cn(
          "max-w-md",
          isOwnMessage 
            ? "bg-green-600 dark:bg-white dark:text-gray-900 text-white border-green-600 dark:border-gray-300" 
            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
        )}>
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-sm">Resposta ao Agendamento</span>
              </div>
              {getStatusBadge(appointmentData.status || 'pending')}
            </div>

            {/* Status da Resposta */}
            <div className="flex items-center gap-2 mb-3">
              {getStatusIcon(appointmentData.status || 'pending')}
              <span className="text-sm font-medium">
                {appointmentData.status === 'accepted' ? 'Agendamento Confirmado!' : 'Agendamento Recusado'}
              </span>
            </div>

            {/* Detalhes do Agendamento */}
            <div className="space-y-2 text-sm mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(appointmentData.requestedDate), 'PPP', { locale: ptBR })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{appointmentData.requestedTime} ({durationLabels[appointmentData.duration]})</span>
              </div>
            </div>

            {/* Mensagem de Resposta */}
            {appointmentData.responseMessage && (
              <div className="p-2 bg-white/10 rounded border border-white/20">
                <p className="text-sm font-medium mb-1">Mensagem:</p>
                <p className="text-xs">{appointmentData.responseMessage}</p>
              </div>
            )}

            {/* Motivo da Recusa */}
            {appointmentData.responseReason && (
              <div className="mt-2 p-2 bg-red-500/20 rounded border border-red-500/30">
                <p className="text-sm font-medium mb-1 text-red-200">Motivo:</p>
                <p className="text-xs text-red-100">{appointmentData.responseReason}</p>
              </div>
            )}

            {/* Botão de Detalhes */}
            {onViewDetails && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewDetails}
                  className="w-full text-xs h-7 border-white/30 text-white hover:bg-white/10"
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};




