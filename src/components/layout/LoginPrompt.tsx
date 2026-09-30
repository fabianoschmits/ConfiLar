"use client";

import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, ArrowRight } from "lucide-react";
import Link from "next/link";

export function LoginPrompt() {
  const { user, loading } = useAuthContext();

  // Não mostrar se estiver carregando ou se usuário estiver logado
  if (loading || user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-80">
      <Card className="bg-gradient-to-r from-[var(--cl-ink)] to-[var(--cl-ink)] text-white border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">
                Faça login para continuar
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Acesse sua conta para usar todos os recursos da plataforma
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link href="/auth">
                <Button
                  size="sm"
                  className="bg-white text-[var(--cl-teal)] hover:bg-[var(--cl-mist)] text-xs font-medium px-3 py-2 h-8"
                >
                  Entrar
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
