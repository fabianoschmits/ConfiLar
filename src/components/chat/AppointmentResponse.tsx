"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Check,
  X,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface AppointmentResponseProps {
  appointmentRequest: {
    id: string;
    clientId: string;
    clientName: string;
    requestedDate: Date;
    requestedTime: string;
    duration: string;
    serviceDescription: string;
    address: string;
    specialRequirements: string;
    status: "pending" | "accepted" | "rejected";
  };
  onAccept: (appointmentId: string, message: string) => Promise<void>;
  onReject: (appointmentId: string, reason: string) => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
}

const durationLabels: Record<string, string> = {
  "1": "1 hora",
  "1.5": "1 hora e 30 min",
  "2": "2 horas",
  "2.5": "2 horas e 30 min",
  "3": "3 horas",
  "3.5": "3 horas e 30 min",
  "4": "4 horas",
  "4.5": "4 horas e 30 min",
  "5": "5 horas",
  "6": "6 horas",
  "8": "8 horas (dia completo)",
};

export const AppointmentResponse: React.FC<AppointmentResponseProps> = ({
  appointmentRequest,
  onAccept,
  onReject,
  onSendMessage,
}) => {
  const [acceptMessage, setAcceptMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [quickMessage, setQuickMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuickMessage, setShowQuickMessage] = useState(false);

  const textareaWrapperRef = useRef<HTMLDivElement>(null);

  // Efeito para scroll automático em dispositivos móveis quando o teclado aparece
  useEffect(() => {
    const wrapper = textareaWrapperRef.current;
    if (!wrapper) return;

    const handleFocusIn = () => {
      // Detectar se é mobile (largura < 768px)
      if (window.innerWidth < 768) {
        // Aguardar um pouco para o teclado aparecer
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (activeElement && wrapper.contains(activeElement)) {
            activeElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 300);
      }
    };

    wrapper.addEventListener("focusin", handleFocusIn);
    return () => wrapper.removeEventListener("focusin", handleFocusIn);
  }, []);

  const handleAccept = async () => {
    if (!acceptMessage.trim()) {
      toast.error("Mensagem de confirmação obrigatória", {
        description:
          "Por favor, adicione uma mensagem de confirmação antes de aceitar o agendamento.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAccept(appointmentRequest.id, acceptMessage);
      toast.success("Agendamento aceito com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao aceitar agendamento", {
        description:
          error?.message ||
          "Não foi possível aceitar o agendamento. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Motivo da recusa obrigatório", {
        description:
          "Por favor, informe o motivo da recusa antes de continuar.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(appointmentRequest.id, rejectReason);
      toast.success("Agendamento recusado");
    } catch (error: any) {
      toast.error("Erro ao recusar agendamento", {
        description:
          error?.message ||
          "Não foi possível recusar o agendamento. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickMessage = async () => {
    if (!quickMessage.trim()) return;

    try {
      await onSendMessage(quickMessage);
      setQuickMessage("");
      setShowQuickMessage(false);
      toast.success("Mensagem enviada!");
    } catch (error: any) {
      toast.error("Erro ao enviar mensagem", {
        description:
          error?.message ||
          "Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700"
          >
            Pendente
          </Badge>
        );
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Aceito</Badge>;
      case "rejected":
        return <Badge variant="destructive">Recusado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (appointmentRequest.status !== "pending") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Solicitação de Agendamento
            {getStatusBadge(appointmentRequest.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {appointmentRequest.status === "accepted"
                ? "Agendamento Confirmado!"
                : "Agendamento Recusado"}
            </p>
            <p className="text-sm">
              {appointmentRequest.status === "accepted"
                ? "O cliente foi notificado da confirmação."
                : "O cliente foi notificado da recusa."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          Solicitação de Agendamento
          {getStatusBadge(appointmentRequest.status)}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>
            Cliente: <strong>{appointmentRequest.clientName}</strong>
          </span>
        </div>
      </CardHeader>

      <CardContent ref={textareaWrapperRef} className="space-y-6">
        {/* Detalhes da Solicitação */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Detalhes da Solicitação
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Data:</span>
                <span>
                  {format(appointmentRequest.requestedDate, "PPP", {
                    locale: ptBR,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Horário:</span>
                <span>{appointmentRequest.requestedTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Duração:</span>
                <span>
                  {durationLabels[appointmentRequest.duration] ||
                    appointmentRequest.duration}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <span className="font-medium">Endereço:</span>
                  <p className="text-xs mt-1">{appointmentRequest.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div>
              <span className="font-medium">Serviço Solicitado:</span>
              <p className="text-sm mt-1 bg-white p-2 rounded border">
                {appointmentRequest.serviceDescription}
              </p>
            </div>

            {appointmentRequest.specialRequirements && (
              <div>
                <span className="font-medium">Requisitos Especiais:</span>
                <p className="text-sm mt-1 bg-white p-2 rounded border">
                  {appointmentRequest.specialRequirements}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mensagem Rápida */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Mensagem Rápida</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickMessage(!showQuickMessage)}
              className="text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              {showQuickMessage ? "Ocultar" : "Mostrar"}
            </Button>
          </div>

          {showQuickMessage && (
            <div className="space-y-2">
              <Textarea
                placeholder="Digite uma mensagem rápida para o cliente..."
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <div className="flex justify-end">
                <LoadingButton
                  size="sm"
                  onClick={handleQuickMessage}
                  disabled={!quickMessage.trim()}
                  className="transition-smooth"
                >
                  Enviar Mensagem
                </LoadingButton>
              </div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="space-y-4">
          {/* Aceitar */}
          <div className="space-y-2">
            <Label
              htmlFor="acceptMessage"
              className="text-sm font-medium text-green-700"
            >
              Mensagem de Confirmação *
            </Label>
            <Textarea
              id="acceptMessage"
              placeholder="Confirme o agendamento e adicione detalhes importantes..."
              value={acceptMessage}
              onChange={(e) => setAcceptMessage(e.target.value)}
              rows={3}
              className="resize-none border-green-200 focus:border-green-500"
            />
            <LoadingButton
              onClick={handleAccept}
              disabled={!acceptMessage.trim() || isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 transition-smooth"
              isLoading={isSubmitting}
              loadingText="Confirmando..."
            >
              <Check className="h-4 w-4 mr-2" />
              Aceitar e Confirmar Agendamento
            </LoadingButton>
          </div>

          {/* Recusar */}
          <div className="space-y-2">
            <Label
              htmlFor="rejectReason"
              className="text-sm font-medium text-red-700"
            >
              Motivo da Recusa *
            </Label>
            <Textarea
              id="rejectReason"
              placeholder="Informe o motivo da recusa de forma profissional..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="resize-none border-red-200 focus:border-red-500"
            />
            <LoadingButton
              variant="outline"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isSubmitting}
              className="w-full border-red-500 text-red-600 hover:bg-red-50 transition-smooth"
              isLoading={isSubmitting}
              loadingText="Recusando..."
            >
              <X className="h-4 w-4 mr-2" />
              Recusar Agendamento
            </LoadingButton>
          </div>
        </div>

        {/* Informações Importantes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Lembre-se:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • Responda em até 24h para manter a qualidade do serviço
                </li>
                <li>• Seja claro e profissional na comunicação</li>
                <li>
                  • O cliente será notificado automaticamente da sua resposta
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
