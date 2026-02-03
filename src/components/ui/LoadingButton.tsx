"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentProps, useEffect, useRef } from "react";

interface LoadingButtonProps extends ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  // Haptic feedback removido para simplificar
  const prevLoadingRef = useRef(isLoading);

  // Feedback háptico quando o loading termina com sucesso
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      // Loading acabou, dar feedback de sucesso
      // Haptic feedback removido
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading]);

  return (
    <Button
      className={cn(
        "transition-smooth",
        isLoading && "cursor-wait",
        "hover:scale-105 active:scale-95",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
