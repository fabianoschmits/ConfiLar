"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { RecommendationModal } from "./RecommendationModal";
import { cn } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface RecommendationButtonProps {
  userId: string;
  userName?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  showCount?: boolean;
  className?: string;
  customLabel?: string;
  activeLabel?: string;
  vertical?: boolean;
  onStatusChange?: (isRecommended: boolean) => void;
}

export function RecommendationButton({
  userId,
  userName = "Usuário",
  size = "default",
  variant = "outline",
  showCount = true,
  className = "",
  customLabel,
  activeLabel,
  vertical = false,
  onStatusChange,
}: RecommendationButtonProps) {
  const { user } = useAuthContext();
  const [isRecommended, setIsRecommended] = useState(false);
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Verificar se o usuário atual já recomendou
  useEffect(() => {
    if (user?.id && userId && user.id !== userId && !hasLoaded) {
      const timer = setTimeout(() => {
        checkCurrentRecommendation();
        loadRecommendationCount();
        setHasLoaded(true);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timer);
    }
  }, [user?.id, userId, hasLoaded]);

  const checkCurrentRecommendation = async () => {
    // Evitar auto-recomendação
    if (user?.id === userId) {
      setIsRecommended(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_recommendations")
        .select("id")
        .eq("recommender_id", user?.id)
        .eq("recommended_id", userId)
        .maybeSingle(); // Usar maybeSingle para evitar erro quando não encontra

      if (!error && data) {
        setIsRecommended(true);
      } else {
        setIsRecommended(false);
      }
    } catch (error) {
      // Silenciar erros e usar valor padrão
      setIsRecommended(false);
      // Não fazer log do erro para evitar poluição do console
    }
  };

  const loadRecommendationCount = async () => {
    // Evitar auto-recomendação
    if (user?.id === userId) {
      setRecommendationCount(0);
      return;
    }

    try {
      const { count, error } = await supabase
        .from("user_recommendations")
        .select("*", { count: "exact", head: true })
        .eq("recommended_id", userId);

      if (!error) {
        setRecommendationCount(count || 0);
      } else {
        setRecommendationCount(0);
      }
    } catch (error) {
      // Silenciar erros e usar valor padrão
      setRecommendationCount(0);
      // Não fazer log do erro para evitar poluição do console
    }
  };

  const handleShowRecommendationModal = () => {
    setShowRecommendationModal(true);
  };

  const handleCloseRecommendationModal = () => {
    setShowRecommendationModal(false);
    // Recarregar dados quando fechar o modal
    setHasLoaded(false); // Permite recarregar
    setTimeout(() => {
      checkCurrentRecommendation();
      loadRecommendationCount();
      setHasLoaded(true);
    }, 100);
  };

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(isRecommended);
    }
  }, [isRecommended, onStatusChange]);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShowRecommendationModal}
        disabled={isLoading || user?.id === userId}
        className={cn(
          "bg-transparent hover:bg-transparent shadow-none border-none p-0 h-auto transition-all ring-0 focus-visible:ring-0",
          vertical ? "flex-col gap-1.5" : "flex-row gap-2 items-center",
          isRecommended ? "text-[#00b0b0]" : "text-gray-400",
          className,
        )}
      >
        <div className="h-4 w-4 relative inline-flex items-center justify-center">
          <ThumbsUp
            className={cn(
              "h-4 w-4 transition-colors",
              isRecommended ? "fill-[#00b0b0] text-[#00b0b0]" : "",
            )}
          />
          {showCount && recommendationCount > 0 && (
            <span
              className={cn(
                "absolute -top-2.5 -right-3 font-bold text-gray-950 dark:text-white",
                vertical ? "text-[10px]" : "text-[11px]",
              )}
            >
              {recommendationCount}
            </span>
          )}
        </div>
        {(customLabel || activeLabel) && (
          <span
            className={cn(
              "text-[8px] sm:text-[9px] font-bold uppercase text-gray-500",
              !vertical && "ml-2",
            )}
          >
            {isRecommended
              ? activeLabel || "Indicado"
              : customLabel || "Ver/Indicar"}
          </span>
        )}
      </Button>

      <RecommendationModal
        userId={userId}
        userName={userName}
        isOpen={showRecommendationModal}
        onClose={handleCloseRecommendationModal}
      />
    </>
  );
}
