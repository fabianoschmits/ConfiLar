"use client";

import { useState } from "react";
import {
  User,
  Briefcase,
  Check,
  X,
  Crown,
  Sparkles,
  Gem,
  Award,
  Shield,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReferralStats } from "@/hooks/useReferralStats";
import { useVipBadges } from "@/hooks/useVipBadges";

interface CompactUserBadgesProps {
  userType: "professional" | "client" | null;
  isAvailable?: boolean;
  isPremium?: boolean;
  showPremium?: boolean;
  userId?: string;
}

export function CompactUserBadges({
  userType,
  isAvailable,
  isPremium = false,
  showPremium = false,
  userId,
}: CompactUserBadgesProps) {
  const [showUserTypeTooltip, setShowUserTypeTooltip] = useState(false);
  const [showAvailabilityTooltip, setShowAvailabilityTooltip] = useState(false);
  const [showPremiumTooltip, setShowPremiumTooltip] = useState(false);
  const [showReferralTooltip, setShowReferralTooltip] = useState(false);
  const [showVipTooltip, setShowVipTooltip] = useState(false);

  // Buscar stats de referral se userId fornecido
  const { stats: referralStats } = useReferralStats(userId);
  // Buscar badges VIP se userId fornecido
  const { badges: vipBadges } = useVipBadges(userId);

  // Badge VIP ativa mais alta
  const activeVipBadge = vipBadges?.find((badge) => badge.is_active) || null;

  return (
    <div className="flex items-center -space-x-0.5 sm:gap-0">
      {/* Ícone de Tipo de Usuário */}
      <div
        className="relative"
        onMouseEnter={() => setShowUserTypeTooltip(true)}
        onMouseLeave={() => setShowUserTypeTooltip(false)}
      >
        <button
          className={`p-0 m-0 transition-smooth hover:scale-125 flex items-center justify-center ${
            userType === "professional"
              ? "text-[var(--cl-teal)] hover:text-[var(--cl-teal)]"
              : "text-[var(--cl-teal)] hover:text-[var(--cl-teal)]"
          }`}
          onClick={() => setShowUserTypeTooltip(!showUserTypeTooltip)}
        >
          {userType === "professional" ? (
            <Briefcase className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
          ) : (
            <User className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
          )}
        </button>

        {/* Tooltip */}
        {showUserTypeTooltip && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 whitespace-nowrap">
            <Badge
              className={`text-xs font-medium px-2 py-1 shadow-lg ${
                userType === "professional"
                  ? "bg-[var(--cl-cta)] hover:brightness-110"
                  : "bg-[var(--cl-teal)] hover:brightness-95"
              }`}
            >
              {userType === "professional" ? "Profissional" : "Cliente"}
            </Badge>
          </div>
        )}
      </div>

      {/* Ícone de Disponibilidade */}
      {isAvailable !== undefined && (
        <div
          className="relative"
          onMouseEnter={() => setShowAvailabilityTooltip(true)}
          onMouseLeave={() => setShowAvailabilityTooltip(false)}
        >
          <button
            className={`p-0 m-0 transition-smooth hover:scale-125 flex items-center justify-center ${
              isAvailable
                ? "text-green-600 hover:text-green-700"
                : "text-red-600 hover:text-red-700"
            }`}
            onClick={() => setShowAvailabilityTooltip(!showAvailabilityTooltip)}
          >
            {isAvailable ? (
              <Check className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
            ) : (
              <X className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
            )}
          </button>

          {/* Tooltip */}
          {showAvailabilityTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 whitespace-nowrap">
              <Badge
                className={`text-xs font-medium px-2 py-1 shadow-lg ${
                  isAvailable
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isAvailable ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Ícone Premium */}
      {showPremium && isPremium && (
        <div
          className="relative"
          onMouseEnter={() => setShowPremiumTooltip(true)}
          onMouseLeave={() => setShowPremiumTooltip(false)}
        >
          <button
            className="p-0 m-0 transition-all duration-200 hover:scale-125 flex items-center justify-center text-yellow-500 hover:text-yellow-600"
            onClick={() => setShowPremiumTooltip(!showPremiumTooltip)}
          >
            <Crown className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
          </button>

          {/* Tooltip */}
          {showPremiumTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 whitespace-nowrap">
              <Badge className="text-xs font-medium px-2 py-1 shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700">
                Post Premium
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Badge de Referral */}
      {userId && referralStats && referralStats.tier !== "none" && (
        <div
          className="relative"
          onMouseEnter={() => setShowReferralTooltip(true)}
          onMouseLeave={() => setShowReferralTooltip(false)}
        >
          <button
            className="p-0 m-0 transition-all duration-200 hover:scale-125 flex items-center justify-center"
            onClick={() => setShowReferralTooltip(!showReferralTooltip)}
          >
            {referralStats.tier === "diamond" && (
              <Sparkles className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-purple-500 hover:text-[var(--cl-teal)]" />
            )}
            {referralStats.tier === "platinum" && (
              <Gem className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-cyan-500 hover:text-cyan-600" />
            )}
            {referralStats.tier === "gold" && (
              <Crown className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-yellow-500 hover:text-yellow-600" />
            )}
            {referralStats.tier === "silver" && (
              <Award className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-gray-400 hover:text-gray-500" />
            )}
            {referralStats.tier === "bronze" && (
              <Shield className="h-2 w-2 sm:h-3.5 sm:w-3.5 text-amber-600 hover:text-amber-700" />
            )}
          </button>

          {/* Tooltip */}
          {showReferralTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 whitespace-nowrap">
              <Badge className="text-xs font-medium px-2 py-1 shadow-lg bg-gradient-to-r from-[var(--cl-teal)] to-[var(--cl-teal)]">
                {referralStats.tier === "diamond" && "💠 Super Embaixador"}
                {referralStats.tier === "platinum" && "💎 Embaixador Premium"}
                {referralStats.tier === "gold" && "🥇 Embaixador Gold"}
                {referralStats.tier === "silver" && "🥈 Embaixador ConfiLar"}
                {referralStats.tier === "bronze" && "🥉 Embaixador Iniciante"}
                {referralStats.totalReferrals > 0 &&
                  ` (${referralStats.totalReferrals})`}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Badge VIP */}
      {userId && activeVipBadge && (
        <div
          className="relative"
          onMouseEnter={() => setShowVipTooltip(true)}
          onMouseLeave={() => setShowVipTooltip(false)}
        >
          <button
            className="p-0 m-0 transition-all duration-200 hover:scale-125 flex items-center justify-center text-pink-500 hover:text-pink-600"
            onClick={() => setShowVipTooltip(!showVipTooltip)}
          >
            <Star className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
          </button>

          {/* Tooltip */}
          {showVipTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 whitespace-nowrap">
              <Badge className="text-xs font-medium px-2 py-1 shadow-lg bg-gradient-to-r from-pink-500 to-rose-500">
                {activeVipBadge.badge_name || "VIP"}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
