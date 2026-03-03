"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Star, Loader2, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEvaluationRequests } from "@/hooks/useEvaluationRequests";
import { useAuthContext } from "@/contexts/AuthContext";
import { EvaluationModal } from "./EvaluationModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RequestEvaluationButtonProps {
  targetUserId: string;
  targetUserName: string;
  className?: string;
  evaluationCount?: number;
  showCount?: boolean;
}

export function RequestEvaluationButton({
  targetUserId,
  targetUserName,
  className,
  evaluationCount = 0,
  showCount = true,
}: RequestEvaluationButtonProps) {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const { createRequest, requests, acceptRequest, loadRequests } =
    useEvaluationRequests();
  const [hasReviewed, setHasReviewed] = useState(false);

  // Verificar se existe uma solicitação entre os usuários
  const existingRequest = requests.find(
    (req) =>
      (req.requester_id === user?.id && req.target_id === targetUserId) ||
      (req.requester_id === targetUserId && req.target_id === user?.id),
  );

  // Verificar se o usuário atual já avaliou este alvo
  useEffect(() => {
    async function checkExistingReview() {
      if (!user?.id || !targetUserId) return;

      const { data, error } = await supabase
        .from("reviews")
        .select("id")
        .eq("reviewer_id", user.id)
        .eq("reviewed_id", targetUserId)
        .maybeSingle();

      if (!error && data) {
        setHasReviewed(true);
      }
    }

    checkExistingReview();
  }, [user?.id, targetUserId]);

  const handleRequestEvaluation = async () => {
    try {
      setIsLoading(true);
      await createRequest(targetUserId);
      toast.success(`Solicitação de avaliação enviada para ${targetUserName}`);
      setShowDialog(false);
    } catch (error) {
      console.error("Erro ao solicitar avaliação:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao solicitar avaliação",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!existingRequest) return;

    try {
      setIsLoading(true);
      await acceptRequest(existingRequest.id);
      toast.success(
        `Solicitação aceita! Agora você pode avaliar ${targetUserName}`,
      );
      setCurrentRequest(existingRequest);
      setShowEvaluationModal(true);
    } catch (error) {
      console.error("Erro ao aceitar solicitação:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao aceitar solicitação",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluationComplete = () => {
    loadRequests(); // Recarregar solicitações
    setCurrentRequest(null);
  };

  // Determinar o estado do botão
  const getButtonState = () => {
    if (!existingRequest) {
      return {
        text: "Avaliar",
        icon: <Star className="h-6 w-6" />,
        onClick: () => setShowDialog(true),
        variant: "ghost" as const,
        disabled: isLoading,
      };
    }

    if (existingRequest.status === "pending") {
      if (existingRequest.target_id === user?.id) {
        // Usuário recebeu uma solicitação pendente
        return {
          text: "Aceitar",
          icon: <CheckCircle className="h-6 w-6" />,
          onClick: handleAcceptRequest,
          variant: "default" as const,
          disabled: isLoading,
        };
      } else {
        // Usuário enviou uma solicitação pendente
        return {
          text: "Pendente",
          icon: <Clock className="h-6 w-6" />,
          onClick: () => {},
          variant: "ghost" as const,
          disabled: true,
        };
      }
    }

    if (existingRequest.status === "accepted") {
      // Ambos os usuários podem avaliar quando aceito
      if (hasReviewed) {
        return {
          text: "Avaliado",
          icon: <CheckCircle className="h-6 w-6" />,
          onClick: () => {},
          variant: "ghost" as const,
          disabled: true,
        };
      }

      return {
        text: "Avaliar",
        icon: <Star className="h-6 w-6" />,
        onClick: () => {
          setCurrentRequest(existingRequest);
          setShowEvaluationModal(true);
        },
        variant: "default" as const,
        disabled: isLoading,
      };
    }

    if (existingRequest.status === "completed") {
      return {
        text: "Concluída",
        icon: <CheckCircle className="h-6 w-6" />,
        onClick: () => {},
        variant: "ghost" as const,
        disabled: true,
      };
    }

    return {
      text: "Avaliar",
      icon: <Star className="h-6 w-6" />,
      onClick: () => setShowDialog(true),
      variant: "ghost" as const,
      disabled: isLoading,
    };
  };

  const buttonState = getButtonState();

  return (
    <>
      <Button
        variant={buttonState.variant}
        size="sm"
        onClick={buttonState.onClick}
        className={cn(
          "bg-transparent hover:bg-transparent shadow-none border-none p-0 h-auto transition-all ring-0 focus-visible:ring-0",
          "flex flex-col items-center gap-1.5 group/eval",
          buttonState.variant === "ghost"
            ? "text-gray-950 group-hover/eval:text-gray-950"
            : "text-gray-950 group-hover/eval:text-gray-950",
          className,
        )}
        disabled={buttonState.disabled}
      >
        <div className="h-6 w-6 relative inline-flex items-center justify-center">
          {React.isValidElement(buttonState.icon) &&
            React.cloneElement(buttonState.icon as React.ReactElement<any>, {
              className: cn(
                (buttonState.icon as React.ReactElement<any>).props.className,
                "stroke-gray-950",
                buttonState.text === "Avaliar" &&
                  buttonState.variant === "default" &&
                  "fill-yellow-400",
                buttonState.text === "Aceitar" && "fill-emerald-400",
                buttonState.text === "Avaliado" && "fill-emerald-400",
                buttonState.text === "Concluída" && "fill-emerald-400",
              ),
            })}
          {showCount && evaluationCount > 0 && (
            <span
              className={cn(
                "absolute -top-3.5 -right-4 font-bold text-gray-950 dark:text-white text-xs",
              )}
            >
              {evaluationCount}
            </span>
          )}
        </div>
        <span
          className={cn(
            "text-[11px] sm:text-xs font-bold uppercase",
            buttonState.variant === "default" ||
              buttonState.text === "Avaliado" ||
              buttonState.text === "Concluída"
              ? "text-gray-950"
              : "text-gray-500",
          )}
        >
          {buttonState.text}
        </span>
      </Button>

      {/* Modal para solicitar avaliação */}
      <ResponsiveModal
        isOpen={showDialog}
        onOpenChange={setShowDialog}
        title="Solicitar Avaliação"
        description={`Você deseja solicitar uma avaliação de ${targetUserName}?`}
        footer={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <LoadingButton
              onClick={handleRequestEvaluation}
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Enviando..."
              className="flex-1 sm:flex-none"
            >
              Solicitar
            </LoadingButton>
          </div>
        }
      >
        <div className="text-gray-600 space-y-3 pb-4">
          <p className="text-sm">
            Ao solicitar, uma notificação será enviada para o usuário. Assim que
            ele aceitar, ambos poderão avaliar um ao outro.
          </p>
        </div>
      </ResponsiveModal>

      {/* Modal de avaliação */}
      {showEvaluationModal && currentRequest && (
        <EvaluationModal
          isOpen={showEvaluationModal}
          onClose={() => setShowEvaluationModal(false)}
          targetUserId={targetUserId}
          targetUserName={targetUserName}
          requestId={currentRequest.id}
          onEvaluationComplete={handleEvaluationComplete}
          isMutual={currentRequest.status === "accepted"}
        />
      )}
    </>
  );
}
