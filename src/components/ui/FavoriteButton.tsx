"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Carregar contagem de favoritos
  const loadFavoriteCount = useCallback(async () => {
    if (!userId) return;
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
  }, [userId]);

  // Sincronizar estado com o hook useFavorites
  useEffect(() => {
    if (userId) {
      const status = isFavorite(userId);
      setIsFavorited(status);
      // Uma vez que tenhamos o status (mesmo que falso inicialmente),
      // podemos parar de mostrar o estado de checking inicial se desejado,
      // mas aqui o checking é mais para evitar saltos visuais.
      setChecking(false);
    }
  }, [userId, isFavorite]);

  // Carregar contagem inicial e quando o userId mudar
  useEffect(() => {
    if (userId) {
      loadFavoriteCount();
    }
  }, [userId, loadFavoriteCount]);

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

      // Recarregar contagem do banco para sincronizar em background
      setTimeout(loadFavoriteCount, 500);

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
      <div className="h-6 w-6 relative inline-flex items-center justify-center">
        {isFavorited ? (
          <HeartFilled className="h-6 w-6 stroke-gray-950 fill-red-500" />
        ) : (
          <Heart className="h-6 w-6 stroke-gray-950" />
        )}
        {showCount && favoriteCount > 0 && (
          <span
            className={cn(
              "absolute -top-3.5 -right-4 font-bold text-gray-950 dark:text-white",
              vertical ? "text-xs" : "text-[13px]",
            )}
          >
            {favoriteCount}
          </span>
        )}
      </div>
      {(showText || customLabel || activeLabel) && (
        <span
          className={cn(
            "text-[11px] sm:text-xs font-bold uppercase",
            isFavorited ? "text-gray-950" : "text-gray-500",
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
