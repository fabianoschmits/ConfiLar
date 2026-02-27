"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyPlus, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";

interface ClaimReferralProps {
  onSuccess: () => void;
}

export function ClaimReferral({ onSuccess }: ClaimReferralProps) {
  const { user } = useAuthContext();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formattedCode = code.toUpperCase().trim();
    if (formattedCode.length < 6) {
      setErrorStatus("Código deve ter entre 6 e 12 caracteres");
      return;
    }

    setIsLoading(true);
    setErrorStatus(null);

    try {
      const response = await fetch("/api/referrals/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referredUserId: user.id,
          referralCode: formattedCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorStatus(data.error || "Código inválido ou não encontrado");
        toast.error(data.error || "Erro ao reivindicar código");
        return;
      }

      toast.success(data.message || "Código resgatado com sucesso!");
      // Sucesso: limpar input e reativar refresh do componente pai
      setCode("");
      onSuccess();
    } catch (error) {
      console.error("Erro ao fazer resgate do convite:", error);
      setErrorStatus("Erro de conexão. Tente novamente.");
      toast.error("Erro inesperado ao conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-teal-800 rounded-lg p-4 shadow-sm relative overflow-hidden">
      {/* Enfeite */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <CopyPlus className="w-24 h-24 text-teal-600" />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Você foi convidado?
            </h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 max-w-lg">
            <p>
              Insira o <strong>código do seu amigo</strong> para ganhar
              benefícios exclusivos.
              {!isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="ml-1 text-teal-600 dark:text-teal-400 font-medium hover:underline focus:outline-none"
                >
                  Ler mais...
                </button>
              )}
            </p>

            {isExpanded && (
              <div className="mt-2 text-gray-500 dark:text-gray-400 animate-in fade-in slide-in-from-top-2 duration-300">
                Se você chegou aqui por recomendação e perdeu o link de convite,
                ou se logou rapidamente com o Google, informe o código do seu
                indicado ao lado para ganhar{" "}
                <strong>7 dias de Anúncio Premium Grátis!</strong>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="block mt-1 text-teal-600 dark:text-teal-400 font-medium hover:underline focus:outline-none"
                >
                  Mostrar menos
                </button>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleClaim} className="flex-shrink-0 w-full md:w-auto">
          <div className="flex flex-col gap-2 relative min-w-[280px]">
            <div className="flex z-10">
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setErrorStatus(null);
                }}
                placeholder="Código (Ex: BRUNO123)"
                className={`rounded-r-none font-bold tracking-wider placeholder:font-normal placeholder:tracking-normal max-w-[200px] uppercase transition-all bg-white dark:bg-gray-900 ${
                  errorStatus
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-emerald-300"
                }`}
                maxLength={12}
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="rounded-l-none bg-teal-600 hover:bg-teal-700 text-white min-w-[100px] border border-teal-600 border-l-0"
                disabled={isLoading || code.length < 6}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Reivindicar"
                )}
              </Button>
            </div>

            <div className="min-h-[20px] absolute -bottom-6 w-full px-1">
              {errorStatus && (
                <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errorStatus}</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
