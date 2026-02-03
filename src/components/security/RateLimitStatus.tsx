"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useRateLimit, RateLimitConfigs } from "@/hooks/useRateLimit";
import { useAuthContext } from "@/contexts/AuthContext";

interface RateLimitStatusProps {
  type:
    | "login"
    | "password_reset"
    | "email_verification"
    | "api_requests"
    | "message_sending"
    | "post_creation";
  identifier?: string;
  showDetails?: boolean;
  className?: string;
}

export function RateLimitStatus({
  type,
  identifier,
  showDetails = false,
  className = "",
}: RateLimitStatusProps) {
  const { user } = useAuthContext();
  const { getRateLimitState, resetRateLimit } = useRateLimit();
  const [state, setState] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const config =
    RateLimitConfigs[type.toUpperCase() as keyof typeof RateLimitConfigs];
  const currentIdentifier = identifier || user?.id || "anonymous";

  useEffect(() => {
    const updateState = () => {
      const currentState = getRateLimitState(currentIdentifier, type);
      setState(currentState);

      if (currentState) {
        const now = Date.now();
        const resetTime = currentState.resetTime;
        const blockExpiry = currentState.blockExpiry;

        if (currentState.isBlocked && blockExpiry) {
          setTimeLeft(Math.max(0, Math.ceil((blockExpiry - now) / 1000)));
        } else if (resetTime > now) {
          setTimeLeft(Math.max(0, Math.ceil((resetTime - now) / 1000)));
        } else {
          setTimeLeft(0);
        }
      }
    };

    updateState();
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, [currentIdentifier, type, getRateLimitState]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusIcon = () => {
    if (!state) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (state.isBlocked) return <Shield className="h-4 w-4 text-red-500" />;
    if (state.attempts > 0)
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (!state) return "green";
    if (state.isBlocked) return "red";
    if (state.attempts > 0) return "yellow";
    return "green";
  };

  const getStatusText = () => {
    if (!state) return "Sem limitações";
    if (state.isBlocked) return "Bloqueado";
    if (state.attempts > 0) return "Atenção";
    return "Normal";
  };

  const getProgressPercentage = () => {
    if (!state) return 0;
    return Math.min(100, (state.attempts / config.maxAttempts) * 100);
  };

  const handleReset = () => {
    resetRateLimit(currentIdentifier, type);
    setState(null);
    setTimeLeft(0);
  };

  if (!state && !showDetails) return null;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon()}
            Status de Limitação
          </CardTitle>
          <Badge
            variant={
              getStatusColor() === "red"
                ? "destructive"
                : getStatusColor() === "yellow"
                  ? "secondary"
                  : "default"
            }
          >
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {state && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  Tentativas: {state.attempts}/{config.maxAttempts}
                </span>
                <span>Restantes: {state.remainingAttempts}</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Time Information */}
            {timeLeft > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {state.isBlocked ? "Bloqueio expira em:" : "Reset em:"}{" "}
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}

            {/* Warning Message */}
            {state.attempts > 0 && !state.isBlocked && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você tem {state.remainingAttempts} tentativas restantes. Após{" "}
                  {config.maxAttempts} tentativas, será bloqueado por{" "}
                  {Math.ceil(((config as any).blockDurationMs || 0) / 60000)}{" "}
                  minutos.
                </AlertDescription>
              </Alert>
            )}

            {/* Blocked Message */}
            {state.isBlocked && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Você foi bloqueado por excesso de tentativas. Tente novamente
                  em {formatTime(timeLeft)}.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Reset Button */}
        {state && state.attempts > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full"
          >
            Resetar Limitações
          </Button>
        )}

        {/* Details */}
        {showDetails && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Tipo: {type}</div>
            <div>Identificador: {currentIdentifier}</div>
            <div>
              Configuração: {config.maxAttempts} tentativas em{" "}
              {Math.ceil(config.windowMs / 60000)} minutos
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
