"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface LightModeLayoutProps {
  children: React.ReactNode;
}

export function LightModeLayout({ children }: LightModeLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [hasForced, setHasForced] = useState(false);

  useEffect(() => {
    // Forçar modo claro APENAS uma vez quando componente montar
    if (!hasForced && theme !== "light") {
      setTheme("light");
      setHasForced(true);
    }
  }, [theme, setTheme, hasForced]);

  return <>{children}</>;
}
