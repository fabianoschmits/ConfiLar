"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useStaticCache } from "@/hooks/useStaticCache";

interface CacheStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function CacheStatus({
  className,
  showDetails = false,
}: CacheStatusProps) {
  const {
    cacheStats,
    isSupported,
    isLoading,
    formatBytes,
    isOverLimit,
    usagePercentage,
  } = useStaticCache();

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Cache não suportado
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Status Principal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Cache Local</span>
          {isOverLimit && (
            <Badge variant="destructive" className="text-xs">
              Limite
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatBytes(cacheStats.totalSize)}
          </span>
          <Badge variant="outline" className="text-xs">
            {cacheStats.totalEntries} itens
          </Badge>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="space-y-1">
        <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Uso do Cache</span>
          <span>{usagePercentage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Detalhes Expandidos */}
      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Caches:</span>
              <span className="ml-1 font-medium">
                {cacheStats.cacheNames.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Atualizado:
              </span>
              <span className="ml-1 font-medium">
                {new Date(cacheStats.lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {isOverLimit && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-700 dark:text-yellow-300">
                Cache próximo do limite. Considere limpar dados antigos.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente compacto para header
export function CacheStatusCompact() {
  const { cacheStats, isSupported, formatBytes } = useStaticCache();

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <HardDrive className="h-3 w-3" />
      <span>{formatBytes(cacheStats.totalSize)}</span>
    </div>
  );
}

// Componente para status de conexão
export function ConnectionStatus() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}
