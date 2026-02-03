"use client";

import { Badge } from "@/components/ui/badge";
import { useUserAvailability } from "@/hooks/useUserAvailability";

interface DynamicAvailabilityBadgeProps {
  userId: string;
  className?: string;
}

export function DynamicAvailabilityBadge({
  userId,
  className = "",
}: DynamicAvailabilityBadgeProps) {
  const { isAvailable, loading, error } = useUserAvailability(userId);

  if (loading) {
    return (
      <Badge
        variant="secondary"
        className={`text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 bg-gray-100 text-gray-600 border border-gray-200 ${className}`}
      >
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400 animate-pulse"></div>
        <span className="hidden sm:inline">Carregando...</span>
        <span className="sm:hidden">...</span>
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge
        variant="secondary"
        className={`text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 bg-gray-100 text-gray-600 border border-gray-200 ${className}`}
      >
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400"></div>
        <span className="hidden sm:inline">Status</span>
        <span className="sm:hidden">Status</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant={isAvailable ? "default" : "secondary"}
      className={`text-[9px] sm:text-xs font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 transition-all duration-300 ${
        isAvailable
          ? "bg-green-100 text-green-800 border border-green-200 shadow-sm"
          : "bg-red-100 text-red-800 border border-red-200 shadow-sm"
      } ${className}`}
    >
      <div
        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
          isAvailable ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
      {isAvailable ? "Disponível" : "Ocupado"}
    </Badge>
  );
}
