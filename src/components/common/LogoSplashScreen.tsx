"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function LogoSplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-950 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,176,176,0.15)_0%,transparent_70%)] animate-pulse" />

      {/* Decorative background pattern (same as hero to ensure smooth transition) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

      <div className="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700 ease-out">
        {/* Logo Container with glow effect */}
        <div className="relative">
          <div className="absolute -inset-4 bg-[var(--cl-teal)]/20 blur-2xl rounded-full animate-pulse" />
          <Image
            src="/imagens/logo/Logo azul - sem fundo - Vertical.png"
            alt="ConfiLar"
            width={300}
            height={300}
            quality={100}
            priority
            className="relative h-48 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,176,176,0.3)]"
          />
        </div>

        {/* Loading Indicator */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#00b0b0] to-transparent w-full animate-shimmer" />
          </div>
          <span className="text-[10px] font-bold text-[var(--cl-teal)]/60 uppercase tracking-[0.3em] animate-pulse">
            Carregando ambiente seguro
          </span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
}
