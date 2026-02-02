"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flag, AlertTriangle, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ConversationReportModalProps {
  conversationId: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  messages: any[];
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function ConversationReportModal({
  conversationId,
  clientId,
  clientName,
  professionalId,
  professionalName,
  messages,
  className,
  variant = "ghost",
  size = "sm",
}: ConversationReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    priority: "medium",
  });
  const { user } = useAuthContext();

  const textareaWrapperRef = useRef<HTMLFormElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Você precisa estar logado para fazer uma denúncia");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Por favor, preencha a descrição");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determinar quem é o usuário denunciado (o outro participante da conversa)
      const reportedUserId = user.id === clientId ? professionalId : clientId;

      const reportData = {
        type: "other", // Campo correto no banco de dados
        reason: "Denúncia de conversa completa",
        description: formData.description.trim(),
        priority: formData.priority,
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        status: "pending",
      };

      console.log("Enviando denúncia de conversa:", reportData);

      const { data: insertedReport, error } = await supabase
        .from("reports")
        .insert(reportData)
        .select()
        .single();

      if (error) {
        console.error("Erro ao enviar denúncia:", error);
        toast.error("Erro ao enviar denúncia. Tente novamente.");
        return;
      }

      // Criar notificação para o usuário sobre a denúncia criada
      if (insertedReport) {
        try {
          await supabase.from("notifications").insert({
            user_id: user.id,
            type: "system",
            title: "Denúncia Enviada",
            message: `Sua denúncia de conversa foi recebida e está sendo analisada. Você receberá atualizações sobre o status.`,
            action_url: "/minhas-denuncias",
            priority: "normal",
            metadata: {
              report_id: insertedReport.id,
              report_type: "other",
              type: "report_created",
            },
            is_read: false,
          });
        } catch (notifError) {
          console.warn(
            "⚠️ Erro ao criar notificação de denúncia criada (não crítico):",
            notifError,
          );
        }
      }

      toast.success(
        "Denúncia de conversa enviada com sucesso! Nossa equipe irá analisá-la.",
      );
      setIsOpen(false);
      setFormData({ description: "", priority: "medium" });
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      toast.error("Erro ao enviar denúncia. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          "flex items-center gap-2 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors",
          className,
        )}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Flag className="h-4 w-4" />
        <span className="text-sm">Denunciar Conversa</span>
      </Button>
      <ResponsiveModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        className="w-[95vw] max-w-lg p-0 overflow-hidden"
        title={
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            <span>Denunciar Conversa Completa</span>
          </div>
        }
      >
        <form
          ref={textareaWrapperRef}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <Label className="text-sm font-medium">
              Você está denunciando uma conversa completa
            </Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Conversa entre:</strong> {clientName} e{" "}
                  {professionalName}
                </p>
                <p>
                  <strong>Total de mensagens:</strong> {messages.length}
                </p>
                <p>
                  <strong>IDs dos usuários:</strong> Cliente: {clientId} |
                  Profissional: {professionalId}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição detalhada do problema *
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o problema encontrado na conversa..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="priority" className="text-sm font-medium">
              Prioridade
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Importante:</strong> Esta denúncia enviará toda a conversa
              para análise da administração. Denúncias falsas podem resultar em
              suspensão da sua conta.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.description.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Enviando..." : "Enviar Denúncia"}
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </>
  );
}
