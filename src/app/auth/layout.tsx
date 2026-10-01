import { Suspense } from "react";
import { LightModeLayout } from "@/components/layout/LightModeLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LightModeLayout>
      <div className="min-h-screen bg-[var(--cl-paper)]">
        <Suspense fallback={<div>Carregando...</div>}>{children}</Suspense>
      </div>
    </LightModeLayout>
  );
}
