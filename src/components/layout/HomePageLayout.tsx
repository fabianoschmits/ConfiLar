"use client";

interface HomePageLayoutProps {
  children: React.ReactNode;
}

/** Wrapper legado — não força mais tema claro (respeita preferência do usuário). */
export function HomePageLayout({ children }: HomePageLayoutProps) {
  return <>{children}</>;
}
