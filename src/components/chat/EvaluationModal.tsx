"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  requestId: string;
  onEvaluationComplete: () => void;
  isMutual?: boolean; // Se é uma avaliação mútua
}

export function EvaluationModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  requestId,
  onEvaluationComplete,
  isMutual = false,
}: EvaluationModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Função para verificar se ambos avaliaram e marcar como concluído
  const checkAndCompleteMutualEvaluation = async (
    requestId: string,
    currentUserId: string,
    targetUserId: string,
  ) => {
    try {
      // Verificar se existem avaliações de ambos os lados
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("reviewer_id, reviewed_id")
        .or(
          `and(reviewer_id.eq.${currentUserId},reviewed_id.eq.${targetUserId}),and(reviewer_id.eq.${targetUserId},reviewed_id.eq.${currentUserId})`,
        );

      if (reviewsError) {
        console.error("Erro ao verificar avaliações mútuas:", reviewsError);
        return;
      }

      // Verificar se ambos avaliaram
      const currentUserReviewed = reviews?.some(
        (r) =>
          r.reviewer_id === currentUserId && r.reviewed_id === targetUserId,
      );
      const targetUserReviewed = reviews?.some(
        (r) =>
          r.reviewer_id === targetUserId && r.reviewed_id === currentUserId,
      );

      if (currentUserReviewed && targetUserReviewed) {
        // Ambos avaliaram, marcar como concluído
        const { error: requestError } = await supabase
          .from("evaluation_requests")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        if (requestError) {
          console.error(
            "Erro ao marcar avaliação mútua como concluída:",
            requestError,
          );
        } else {
          console.log("✅ Avaliação mútua concluída - ambos avaliaram");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar avaliação mútua:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Obter dados do usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Criar a avaliação
      console.log("📝 Criando avaliação:", {
        reviewer_id: user.id,
        reviewed_id: targetUserId,
        rating: rating,
        comment: comment.trim() || null,
      });

      const { error: reviewError } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        reviewed_id: targetUserId,
        rating_person: rating,
        comment: comment.trim() || null,
        created_at: new Date().toISOString(),
      });

      if (reviewError) {
        console.error("❌ Erro ao criar avaliação:", reviewError);
        throw new Error(`Erro ao salvar avaliação: ${reviewError.message}`);
      }

      console.log("✅ Avaliação criada com sucesso!");

      // ✅ VERIFICAR SE É A PRIMEIRA AVALIAÇÃO DO USUÁRIO (para referral milestone)
      try {
        // Contar quantas avaliações o usuário fez
        const { count, error: countError } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("reviewer_id", user.id);

        if (!countError && count === 1) {
          console.log(
            "🎉 [Avaliação] Esta é a PRIMEIRA avaliação do usuário! Marcando milestone...",
          );

          // Marcar milestone de primeira avaliação
          const { error: milestoneError } = await supabase
            .from("referrals")
            .update({
              first_review_made: true,
              last_activity_at: new Date().toISOString(),
            })
            .eq("referred_id", user.id)
            .eq("first_review_made", false);

          if (milestoneError) {
            console.warn(
              "⚠️ [Avaliação] Erro ao marcar milestone (usuário pode não ter sido indicado):",
              milestoneError.message,
            );
          } else {
            console.log(
              "✅ [Avaliação] Milestone first_review_made marcado! (+100 pontos para indicador)",
            );
          }
        } else {
          console.log(
            "📝 [Avaliação] Avaliação criada. Total de avaliações do usuário:",
            count,
          );
        }
      } catch (milestoneError) {
        console.warn(
          "⚠️ [Avaliação] Erro ao processar milestone de primeira avaliação:",
          milestoneError,
        );
        // Não falhar a criação da avaliação se houver erro no milestone
      }

      // Se for mútua, verificar se ambos já avaliaram
      if (isMutual) {
        await checkAndCompleteMutualEvaluation(
          requestId,
          user.id,
          targetUserId,
        );
      } else {
        // Marcar solicitação como concluída se não for mútua
        const { error: requestError } = await supabase
          .from("evaluation_requests")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        if (requestError) {
          console.error(
            "Erro ao marcar solicitação como concluída:",
            requestError,
          );
        }
      }

      toast.success(`Avaliação enviada para ${targetUserName} com sucesso!`);
      onEvaluationComplete();
      onClose();

      // Reset form
      setRating(5);
      setComment("");
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao enviar avaliação",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      fullContent={true}
      showCloseButton={false}
      className="max-sm:max-h-[96vh]"
    >
      <div className="flex flex-col h-full bg-white dark:bg-black overflow-hidden">
        {/* HEADER FIXO */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black flex-shrink-0 z-10">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate px-2">
            {isMutual
              ? `Avaliar ${targetUserName}`
              : `Avaliar ${targetUserName}`}
          </h2>
          <LoadingButton
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black min-w-[80px] transition-colors"
          >
            Avaliar
          </LoadingButton>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-6">
          <div ref={textareaWrapperRef} className="space-y-4 pb-4">
            {/* Rating */}
            <div>
              <Label
                htmlFor="rating"
                className="text-gray-700 dark:text-gray-300"
              >
                Avaliação (1-5 estrelas)
              </Label>
              <div className="flex items-center space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 rounded-full transition-colors ${
                      star <= rating
                        ? "text-yellow-400 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300"
                        : "text-gray-300 hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500"
                    }`}
                    disabled={isSubmitting}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {rating} de 5 estrelas
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <Label
                htmlFor="comment"
                className="text-gray-700 dark:text-gray-300"
              >
                Comentário (opcional)
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Deixe um comentário sobre sua experiência..."
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
