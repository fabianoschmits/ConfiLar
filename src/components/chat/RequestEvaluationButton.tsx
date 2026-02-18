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

interface RequestEvaluationButtonProps {
  targetUserId: string;
  targetUserName: string;
  className?: string;
}

export function RequestEvaluationButton({
  targetUserId,
  targetUserName,
  className,
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
        icon: <Star className="h-3 w-3" />,
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
          icon: <CheckCircle className="h-3 w-3" />,
          onClick: handleAcceptRequest,
          variant: "default" as const,
          disabled: isLoading,
        };
      } else {
        // Usuário enviou uma solicitação pendente
        return {
          text: "Pendente",
          icon: <Clock className="h-3 w-3" />,
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
          icon: <CheckCircle className="h-3 w-3" />,
          onClick: () => {},
          variant: "ghost" as const,
          disabled: true,
        };
      }

      return {
        text: "Avaliar",
        icon: <Star className="h-3 w-3" />,
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
        icon: <CheckCircle className="h-3 w-3" />,
        onClick: () => {},
        variant: "ghost" as const,
        disabled: true,
      };
    }

    return {
      text: "Avaliar",
      icon: <Star className="h-3 w-3" />,
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
        className={`flex items-center gap-1 px-1 py-0.5 h-5 text-xs transition-opacity ${className} ${
          buttonState.variant === "ghost"
            ? "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 opacity-70 hover:opacity-100"
            : "text-white bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={buttonState.disabled}
      >
        {buttonState.icon}
        <span className="text-xs">{buttonState.text}</span>
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
