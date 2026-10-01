"use client";

interface LightModeLayoutProps {
  children: React.ReactNode;
}

/** Wrapper legado — não força mais tema claro (respeita preferência do usuário). */
export function LightModeLayout({ children }: LightModeLayoutProps) {
  return <>{children}</>;
}
