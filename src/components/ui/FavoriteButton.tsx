"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, HeartFilled } from "@/components/ui/icons";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface FavoriteButtonProps {
  userId: string;
  userName?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  showText?: boolean;
  showCount?: boolean;
  className?: string;
  customLabel?: string;
  activeLabel?: string;
  vertical?: boolean;
  onStatusChange?: (isFavorited: boolean) => void;
}

export function FavoriteButton({
  userId,
  userName = "usuário",
  size = "default",
  variant = "outline",
  showText = false,
  showCount = true,
  className,
  customLabel,
  activeLabel,
  vertical = false,
  onStatusChange,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Carregar contagem de favoritos
  const loadFavoriteCount = async () => {
    try {
      const { count, error } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", userId);

      if (!error) {
        setFavoriteCount(count || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar contagem de favoritos:", error);
    }
  };

  // Verificar se está nos favoritos e carregar contagem
  useEffect(() => {
    if (userId && !hasLoaded) {
      const checkFavoriteStatus = () => {
        try {
          const favoriteStatus = isFavorite(userId);
          setIsFavorited(favoriteStatus);
          loadFavoriteCount();
          setHasLoaded(true);
        } catch (error) {
          console.error("Erro ao verificar favorito:", error);
        } finally {
          setChecking(false);
        }
      };

      checkFavoriteStatus();
    }
  }, [userId, isFavorite, hasLoaded]);

  const handleToggleFavorite = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const newStatus = await toggleFavorite(userId);
      setIsFavorited(newStatus);

      // Atualizar contagem localmente para feedback imediato
      setFavoriteCount((prev) =>
        newStatus ? prev + 1 : Math.max(0, prev - 1),
      );

      if (newStatus) {
        toast.success(`${userName.toUpperCase()} ADICIONADO AOS FAVORITOS!`);
      } else {
        toast.success(`${userName.toUpperCase()} REMOVIDO DOS FAVORITOS!`);
      }
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
      toast.error("ERRO AO ATUALIZAR FAVORITOS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(isFavorited);
    }
  }, [isFavorited, onStatusChange]);

  if (checking) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={cn("opacity-50", className)}
      >
        <Heart className="h-4 w-4" />
        {showText && <span className="ml-2">Carregando...</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={loading}
      className={cn(
        "bg-transparent hover:bg-transparent shadow-none border-none p-0 h-auto transition-all ring-0 focus-visible:ring-0",
        vertical ? "flex-col gap-1.5" : "flex-row gap-1.5 items-center",
        isFavorited ? "text-red-600 hover:text-red-700" : "text-gray-400",
        className,
      )}
    >
      <div className="h-5 w-5 relative inline-flex items-center justify-center">
        {isFavorited ? (
          <HeartFilled className="h-5 w-5 fill-current" />
        ) : (
          <Heart className="h-5 w-5" />
        )}
        {showCount && favoriteCount > 0 && (
          <span
            className={cn(
              "absolute -top-3 -right-3.5 font-bold text-gray-950 dark:text-white",
              vertical ? "text-[11px]" : "text-[12px]",
            )}
          >
            {favoriteCount}
          </span>
        )}
      </div>
      {(showText || customLabel || activeLabel) && (
        <span
          className={cn(
            "text-[10px] sm:text-[11px] font-bold uppercase text-gray-500",
            !vertical && "ml-2",
          )}
        >
          {isFavorited
            ? activeLabel || "Favoritado"
            : customLabel || "Favoritar"}
        </span>
      )}
    </Button>
  );
}
