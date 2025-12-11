"use client";

import { cn } from "@/lib/utils";
import {
  Trophy,
  Star,
  Award,
  Crown,
  Zap,
  Target,
  Heart,
  MessageCircle,
} from "lucide-react";

export type AchievementType =
  | "first_post"
  | "first_like"
  | "first_comment"
  | "10_posts"
  | "50_likes"
  | "100_comments"
  | "verified"
  | "premium"
  | "top_contributor";

interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  achievement,
  size = "md",
  showProgress = false,
  onClick,
  className,
}: AchievementBadgeProps) {
  const Icon = achievement.icon;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer transition-transform hover:scale-110",
        className,
      )}
    >
      {/* Badge Circle */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center",
          sizeClasses[size],
          achievement.unlocked
            ? `bg-gradient-to-br ${achievement.color} shadow-lg`
            : "bg-gray-200 dark:bg-gray-800 opacity-50",
        )}
      >
        <Icon
          className={cn(
            iconSizeClasses[size],
            achievement.unlocked ? "text-white" : "text-gray-400",
          )}
        />
      </div>

      {/* Lock Overlay */}
      {!achievement.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🔒</span>
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
          <div className="font-semibold">{achievement.title}</div>
          <div className="text-gray-300">{achievement.description}</div>
          {showProgress &&
            achievement.progress !== undefined &&
            achievement.maxProgress && (
              <div className="mt-1 text-gray-400">
                {achievement.progress}/{achievement.maxProgress}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// Componente de Grid de Conquistas
interface AchievementsGridProps {
  achievements: Achievement[];
  className?: string;
}

export function AchievementsGrid({
  achievements,
  className,
}: AchievementsGridProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Conquistas
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {unlockedCount}/{achievements.length} desbloqueadas
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="md"
            showProgress
          />
        ))}
      </div>
    </div>
  );
}

// Conquistas pré-definidas
export const defaultAchievements: Achievement[] = [
  {
    id: "first_post",
    title: "Primeiro Post",
    description: "Publicou seu primeiro post",
    icon: MessageCircle,
    color: "from-blue-500 to-blue-600",
    unlocked: false,
  },
  {
    id: "first_like",
    title: "Primeira Curtida",
    description: "Curtiu um post pela primeira vez",
    icon: Heart,
    color: "from-red-500 to-pink-600",
    unlocked: false,
  },
  {
    id: "first_comment",
    title: "Primeiro Comentário",
    description: "Comentou em um post",
    icon: MessageCircle,
    color: "from-green-500 to-emerald-600",
    unlocked: false,
  },
  {
    id: "10_posts",
    title: "10 Posts",
    description: "Publicou 10 posts",
    icon: Target,
    color: "from-purple-500 to-purple-600",
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "50_likes",
    title: "50 Curtidas",
    description: "Recebeu 50 curtidas",
    icon: Star,
    color: "from-yellow-500 to-orange-600",
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: "100_comments",
    title: "100 Comentários",
    description: "Fez 100 comentários",
    icon: Zap,
    color: "from-cyan-500 to-blue-600",
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: "verified",
    title: "Verificado",
    description: "Conta verificada",
    icon: Award,
    color: "from-blue-600 to-indigo-600",
    unlocked: false,
  },
  {
    id: "premium",
    title: "Premium",
    description: "Membro Premium",
    icon: Crown,
    color: "from-yellow-600 to-amber-600",
    unlocked: false,
  },
  {
    id: "top_contributor",
    title: "Top Contribuidor",
    description: "Um dos melhores contribuidores",
    icon: Trophy,
    color: "from-amber-500 to-yellow-600",
    unlocked: false,
  },
];
