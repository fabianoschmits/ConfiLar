"use client";

import React from "react";
import Link from "next/link";
import { LogIn, UserPlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuestBlurOverlayProps {
  children: React.ReactNode;
  isGuest: boolean;
  className?: string;
  overlayClassName?: string;
}

export function GuestBlurOverlay({
  children,
  isGuest,
  className,
  overlayClassName,
}: GuestBlurOverlayProps) {
  if (!isGuest) return <>{children}</>;

  return (
    <div className={cn("relative group/blur overflow-hidden", className)}>
      {/* Conteúdo Desfocado */}
      <div className="blur-md pointer-events-none select-none filter">
        {children}
      </div>

      {/* Overlay com Mensagem */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-white/10 dark:bg-black/20 backdrop-blur-[2px] transition-all duration-300",
          overlayClassName,
        )}
      >
        <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-[280px] animate-in zoom-in-95 duration-300">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Ver mais detalhes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Cadastre-se ou Entre para acessar todas as informações e recursos da
            nossa comunidade.
          </p>

          <div className="space-y-3">
            <Button
              asChild
              className="w-full rounded-xl font-semibold"
              size="sm"
            >
              <Link href="/auth/login">
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl font-semibold border-gray-200 dark:border-gray-700"
              size="sm"
            >
              <Link href="/auth/register">
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Conta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
