"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

// Redirecionar /confipoints para /confipoints/dashboard
export default function ConfiPointsRedirectPage() {
  const tCommon = useTranslations("common");
  const router = useRouter();

  useEffect(() => {
    router.replace("/confipoints/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cl-paper)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cl-teal)] mx-auto mb-4"></div>
        <p className="text-[var(--cl-ink-secondary)]">
          {tCommon("redirecting")}
        </p>
      </div>
    </div>
  );
}
