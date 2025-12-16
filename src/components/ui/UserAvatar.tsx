"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ReferralBadge } from "@/components/referral/ReferralBadge";
import { useReferralStats } from "@/hooks/useReferralStats";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  userId?: string;
  showReferralBadge?: boolean;
  badgePlacement?: "top-right" | "bottom-right";
}

export function UserAvatar({
  src,
  alt = "Usuário",
  fallback = "U",
  size = "md",
  className,
  userId,
  showReferralBadge = true,
  badgePlacement = "top-right",
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Carregar stats de referral se userId fornecido
  const { stats, loading: statsLoading } = useReferralStats(
    showReferralBadge && userId ? userId : undefined,
  );

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-32 h-32",
  };

  const fallbackSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-4xl",
  };

  // Tamanho do badge baseado no tamanho do avatar (smaller as requested)
  const badgeSize = size === "xl" ? "lg" : size === "lg" ? "md" : "xs";

  // Posicionamento do badge baseado no tamanho e preferência
  const getBadgePosition = () => {
    if (badgePlacement === "bottom-right") {
      return size === "xl"
        ? "bottom-0 right-0"
        : size === "lg"
          ? "-bottom-2 -right-2"
          : "-bottom-1.5 -right-1.5";
    }
    // Default top-right: Pushed further out as requested (-top-3 -right-3 to compensate for smaller badge and "more out")
    return size === "xl" ? "top-0 right-0" : "-top-3 -right-3";
  };

  const badgePosition = getBadgePosition();

  const handleImageError = () => {
    console.log("❌ Erro ao carregar avatar:", src);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log("✅ Avatar carregado com sucesso:", src);
    setImageLoaded(true);
  };

  // Se não há src ou houve erro, mostrar apenas o fallback
  if (!src || imageError) {
    return (
      <div className="relative inline-block">
        <Avatar className={cn(sizeClasses[size], className)}>
          <AvatarFallback
            className={cn(
              "bg-blue-100 text-blue-600 font-semibold border border-gray-300",
              fallbackSize[size],
            )}
          >
            {fallback}
          </AvatarFallback>
        </Avatar>
        {showReferralBadge &&
          stats &&
          stats.tier !== "none" &&
          !statsLoading && (
            <div className={cn("absolute", badgePosition)}>
              <ReferralBadge
                tier={stats.tier}
                totalReferrals={stats.totalReferrals}
                size={badgeSize}
                showCount={false}
              />
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage
          src={src}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        <AvatarFallback
          className={cn(
            "bg-blue-100 text-blue-600 font-semibold border border-gray-300",
            fallbackSize[size],
          )}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>
      {showReferralBadge && stats && stats.tier !== "none" && !statsLoading && (
        <div className={cn("absolute", badgePosition)}>
          <ReferralBadge
            tier={stats.tier}
            totalReferrals={stats.totalReferrals}
            size={badgeSize}
            showCount={false}
          />
        </div>
      )}
    </div>
  );
}
