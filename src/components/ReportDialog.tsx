"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
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
import { Flag, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";

export type ReportType =
  | "user"
  | "post"
  | "message"
  | "review"
  | "classified"
  | "comment"
  | "story";

export interface ReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: ReportType;
  targetId: string;
  targetName?: string;
  reportedUserId?: string;
}

const getTypeLabel = (type: ReportType) => {
  switch (type) {
    case "user":
      return "Usuário";
    case "post":
      return "Post";
    case "message":
      return "Mensagem";
    case "review":
      return "Avaliação";
    case "classified":
      return "Anúncio";
    case "comment":
      return "Comentário";
    case "story":
      return "Story";
    default:
      return "Item";
  }
};

export function ReportDialog({
  isOpen,
  onOpenChange,
  type,
  targetId,
  targetName,
  reportedUserId,
}: ReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    priority: "medium",
  });
  const { user } = useAuthContext();
  const textareaWrapperRef = useRef<HTMLFormElement>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ description: "", priority: "medium" });
    }
  }, [isOpen]);

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
      const reportData = {
        type: type,
        reason: "Denúncia de conteúdo",
        description: formData.description.trim(),
        priority: formData.priority,
        reporter_id: user.id,
        // Usar reportedUserId se fornecido, senão usar targetId para tipo 'user'
        reported_user_id: reportedUserId || (type === "user" ? targetId : null),
        // IDs específicos de conteúdo
        ...(type === "post" && { reported_post_id: targetId }),
        ...(type === "message" && { reported_message_id: targetId }),
        ...(type === "review" && { reported_message_id: targetId }),
        ...(type === "classified" && { reported_classified_id: targetId }),
        ...(type === "story" && { reported_story_id: targetId }),
      };

      console.log("Enviando dados da denúncia:", reportData);

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
            message: `Sua denúncia foi recebida e está sendo analisada. Você receberá atualizações sobre o status.`,
            action_url: "/minhas-denuncias",
            priority: "normal",
            metadata: {
              report_id: insertedReport.id,
              report_type: type,
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
        "Denúncia enviada com sucesso! Nossa equipe irá analisá-la.",
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao enviar denúncia:", error);
      toast.error("Erro ao enviar denúncia. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="w-[95vw] max-w-lg p-0 overflow-hidden"
      title={
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-red-500" />
          <span>Denunciar {getTypeLabel(type)}</span>
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
            Você está denunciando:{" "}
            <span className="text-gray-600">
              {targetName || getTypeLabel(type)}
            </span>
          </Label>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Descrição detalhada *
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva o problema encontrado..."
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
            <strong>Importante:</strong> Denúncias falsas podem resultar em
            suspensão da sua conta. Use este recurso com responsabilidade.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            disabled={isSubmitting || !formData.description.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700"
            isLoading={isSubmitting}
            loadingText="Enviando..."
          >
            Enviar Denúncia
          </LoadingButton>
        </div>
      </form>
    </ResponsiveModal>
  );
}
