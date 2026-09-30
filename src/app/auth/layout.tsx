import { Suspense } from "react";
import { LightModeLayout } from "@/components/layout/LightModeLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LightModeLayout>
      <div className="min-h-screen bg-gradient-to-br from-[var(--cl-mist)] via-white to-[var(--cl-mist)]">
        <Suspense fallback={<div>Carregando...</div>}>{children}</Suspense>
      </div>
    </LightModeLayout>
  );
}
