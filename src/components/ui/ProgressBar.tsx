"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "error";
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  current,
  max,
  label,
  showPercentage = true,
  size = "md",
  color = "primary",
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((current / max) * 100), 100);

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const colorClasses = {
    primary: "bg-primary-600 dark:bg-primary-500",
    success: "bg-green-600 dark:bg-green-500",
    warning: "bg-yellow-600 dark:bg-yellow-500",
    error: "bg-red-600 dark:bg-red-500",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden",
          sizeClasses[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorClasses[color],
            animated && "animate-pulse",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {current !== undefined && max !== undefined && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {current.toLocaleString("pt-BR")} / {max.toLocaleString("pt-BR")}
          </span>
        </div>
      )}
    </div>
  );
}

// Componente de XP/Level Progress
interface LevelProgressProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}

export function LevelProgress({
  currentXP,
  nextLevelXP,
  level,
  className,
}: LevelProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white font-bold text-sm">
            {level}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nível {level}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {currentXP} / {nextLevelXP} XP
        </span>
      </div>

      <ProgressBar
        current={currentXP}
        max={nextLevelXP}
        showPercentage={false}
        color="warning"
        animated={false}
      />
    </div>
  );
}
