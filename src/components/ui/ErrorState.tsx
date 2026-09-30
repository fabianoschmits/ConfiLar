"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message: string;
  error?: Error | string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "full";
}

export function ErrorState({
  title = "Ops! Algo deu errado",
  message,
  error,
  onRetry,
  showHomeButton = true,
  className,
  variant = "default",
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg",
          className,
        )}
      >
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {title}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {message}
          </p>
          {errorMessage && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-mono truncate">
              {errorMessage}
            </p>
          )}
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="flex-shrink-0"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
          className,
        )}
      >
        <div className="bg-[var(--cl-surface)] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          {errorMessage && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-6 text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Detalhes do erro:
              </p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="transition-smooth hover:scale-105 active:scale-95"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            )}
            {showHomeButton && (
              <Link href="/">
                <Button
                  variant="outline"
                  className="transition-smooth hover:scale-105 active:scale-95"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para início
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Variant default
  return (
    <div
      className={cn(
        "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center",
        className,
      )}
    >
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>

      {errorMessage && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-[var(--cl-ink)] hover:brightness-110 text-white shadow-lg hover:shadow-xl transition-smooth hover:scale-105 active:scale-95"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
        {showHomeButton && !onRetry && (
          <Link href="/">
            <Button
              variant="outline"
              className="transition-smooth hover:scale-105 active:scale-95"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para início
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
