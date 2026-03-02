"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminStatsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/gestao-confi/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-muted-foreground font-medium">
        Redirecionando para o novo Dashboard...
      </div>
    </div>
  );
}
