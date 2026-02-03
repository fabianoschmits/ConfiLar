"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, HeartFilled } from "@/components/ui/icons";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  userId: string;
  userName?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  showText?: boolean;
  className?: string;
}

export function FavoriteButton({
  userId,
  userName = "usuário",
  size = "default",
  variant = "outline",
  showText = false,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Verificar se está nos favoritos
  useEffect(() => {
    const checkFavoriteStatus = () => {
      try {
        const favoriteStatus = isFavorite(userId);
        setIsFavorited(favoriteStatus);
      } catch (error) {
        console.error("Erro ao verificar favorito:", error);
      } finally {
        setChecking(false);
      }
    };

    checkFavoriteStatus();
  }, [userId, isFavorite]);

  const handleToggleFavorite = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const newStatus = await toggleFavorite(userId);
      setIsFavorited(newStatus);

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
        "transition-all duration-200",
        isFavorited && "text-red-600 hover:text-red-700",
        className,
      )}
    >
      {isFavorited ? (
        <HeartFilled className="h-4 w-4 fill-current" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {isFavorited ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        </span>
      )}
    </Button>
  );
}
