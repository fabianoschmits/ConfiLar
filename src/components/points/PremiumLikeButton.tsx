import React from "react";
import { Zap, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePremiumLikes, usePremiumLikesStats } from "@/hooks/usePremiumLikes";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePoints } from "@/hooks/usePoints";
import { cn } from "@/lib/utils";
import { PREMIUM_PRICES } from "@/constants/premiumPrices";
import { toast } from "sonner";

// CSS para animação de batida do coração
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes heartBeat {
      0%, 100% {
        transform: scale(1);
      }
      25% {
        transform: scale(1.3) rotate(-5deg);
      }
      50% {
        transform: scale(1.2) rotate(5deg);
      }
      75% {
        transform: scale(1.15) rotate(-3deg);
      }
    }
  `;
  if (!document.head.querySelector("#premium-like-animations")) {
    style.id = "premium-like-animations";
    document.head.appendChild(style);
  }
}

interface PremiumLikeButtonProps {
  postId: string;
  postCreatorId: string;
  className?: string;
  size?: "sm" | "lg" | "default";
  showStats?: boolean;
  onPremiumLikeClick?: () => void; // Callback para notificar quando o like premium é clicado
}

export function PremiumLikeButton({
  postId,
  postCreatorId,
  className,
  size = "default",
  showStats = true,
  onPremiumLikeClick,
}: PremiumLikeButtonProps) {
  const { user } = useAuthContext();
  const { balance } = usePoints(user?.id); // Passar o userId
  const {
    likes,
    stats,
    userPremiumLiked,
    userPremiumLikesCount,
    premiumLike,
    normalLike,
    unlike,
    isPremiumLiking,
    isNormalLiking,
    isUnliking,
  } = usePremiumLikes(postId);

  const [isAnimating, setIsAnimating] = React.useState(false);
  // Haptic feedback removido para simplificar

  const isOwnPost = user?.id === postCreatorId;
  const hasLiked = likes.some((like) => like.user_id === user?.id);

  // Calcular total de premium likes do post
  // Usar stats se disponível, caso contrário calcular diretamente dos likes
  const premiumLikesCount = React.useMemo(() => {
    if (stats?.premium_likes !== undefined) {
      return stats.premium_likes;
    }
    // Fallback: calcular diretamente dos likes
    if (likes) {
      return likes.filter((like) => like.is_premium === true).length;
    }
    return 0;
  }, [stats?.premium_likes, likes]);

  const totalLikesCount = stats?.total_likes || likes?.length || 0;
  const pointsReceived = stats?.total_points_received || 0;
  // Verificação de saldo: permite cliques múltiplos se tiver pelo menos o valor necessário
  const hasEnoughPoints = (balance?.balance ?? 0) >= PREMIUM_PRICES.LIKE.POINTS;

  const handlePremiumLike = () => {
    if (isOwnPost) {
      return; // Não pode curtir próprio post
    }

    // Verificar se tem pontos suficientes (verificação otimista baseada no saldo atual)
    if (!hasEnoughPoints) {
      toast.error(
        `Saldo insuficiente! Você precisa de ${PREMIUM_PRICES.LIKE.POINTS} ConfiPoints para curtir premium. Você tem ${balance?.balance || 0} ConfiPoints.`,
        {
          duration: 4000,
        },
      );
      return;
    }

    // Ativar animação no botão
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600); // Duração da animação

    // Chamar callback para mostrar animação no overlay do post (apenas se tiver pontos)
    if (onPremiumLikeClick && hasEnoughPoints) {
      onPremiumLikeClick();
    }

    // Permitir múltiplos cliques - o hook vai processar em background
    premiumLike();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handlePremiumLike}
            disabled={isOwnPost || !hasEnoughPoints}
            className={cn(
              "transition-transform active:scale-125 disabled:opacity-50 flex items-center gap-1.5",
              isOwnPost && "cursor-not-allowed",
              !hasEnoughPoints && "cursor-not-allowed",
              className,
            )}
          >
            <div className="relative h-[1.1rem] w-[1.1rem]">
              {/* Ícone dourado preenchido - camada de fundo quando há like premium */}
              {userPremiumLiked && (
                <Coins
                  className={cn(
                    "h-[1.1rem] w-[1.1rem] absolute inset-0 transition-all",
                    "text-yellow-500",
                    isAnimating && "animate-[heartBeat_0.6s_ease-in-out]",
                    !hasEnoughPoints && "opacity-50",
                  )}
                  style={{
                    fill: "#eab308",
                    stroke: "none",
                    zIndex: 1,
                  }}
                />
              )}
              {/* Ícone cinza (contorno) - sempre por cima, formando a borda */}
              <Coins
                className={cn(
                  "h-[1.1rem] w-[1.1rem] absolute inset-0 transition-all",
                  "text-gray-700 dark:text-gray-300",
                  isAnimating && "animate-[heartBeat_0.6s_ease-in-out]",
                  !hasEnoughPoints && "opacity-50",
                )}
                style={{
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  zIndex: 2,
                }}
              />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {premiumLikesCount > 0
                ? premiumLikesCount.toLocaleString("pt-BR")
                : "0"}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">🎉 Curtida Premium</p>
            <p className="text-xs">
              💰 Gasta {PREMIUM_PRICES.LIKE.POINTS} ConfiPoints
            </p>

            {!hasEnoughPoints ? (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-600 font-semibold">
                  ❌ Saldo Insuficiente
                </p>
                <p className="text-xs text-red-500">
                  Você tem {balance?.balance || 0} ConfiPoints
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-green-400 mt-1">
                  ✨ Incentiva criação de conteúdo de qualidade
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  💰 Saldo: {balance?.balance || 0} ConfiPoints
                </p>
              </>
            )}

            {premiumLikesCount > 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                ⚡ {premiumLikesCount} curtidas premium neste post
              </p>
            )}
            {userPremiumLikesCount > 0 && (
              <p className="text-xs text-green-400 mt-1">
                ✓ Você deu {userPremiumLikesCount} likes premium aqui
              </p>
            )}
            {hasEnoughPoints && (
              <p className="text-xs text-blue-400 mt-1">
                💡 Clique várias vezes para enviar mais!
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para mostrar ranking de posts com mais curtidas premium
export function PremiumLikesRanking() {
  const { stats, loading } = usePremiumLikesStats();

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Zap className="text-yellow-500" size={20} />
        Posts Mais Curtidos Premium
      </h3>

      {stats.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum post com curtidas premium ainda
        </p>
      ) : (
        <div className="space-y-2">
          {stats.slice(0, 10).map((stat, index) => (
            <div
              key={stat.post_id}
              className="flex items-center justify-between p-3 bg-card rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="w-6 h-6 flex items-center justify-center text-xs"
                >
                  {index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {stat.content.length > 50
                      ? `${stat.content.substring(0, 50)}...`
                      : stat.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{stat.premium_likes} curtidas premium</span>
                    <span>•</span>
                    <span>{stat.total_points_received} pontos recebidos</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap size={12} />
                  {stat.premium_likes}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Coins size={12} />
                  {stat.total_points_received}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
