"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface LoadingState {
  isLoading: boolean;
  message: string;
  type: "navigation" | "auth" | "general";
}

interface LoadingContextType {
  loadingState: LoadingState;
  setLoading: (
    isLoading: boolean,
    message?: string,
    type?: LoadingState["type"],
  ) => void;
  setNavigationLoading: (isLoading: boolean, destination?: string) => void;
  setAuthLoading: (isLoading: boolean, action?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    message: "Carregando...",
    type: "general",
  });

  const setLoading = useCallback(
    (
      isLoading: boolean,
      message: string = "Carregando...",
      type: LoadingState["type"] = "general",
    ) => {
      setLoadingState({
        isLoading,
        message,
        type,
      });
    },
    [],
  );

  const setNavigationLoading = useCallback(
    (isLoading: boolean, destination?: string) => {
      setLoading(
        isLoading,
        destination ? `Navegando para ${destination}...` : "Navegando...",
        "navigation",
      );
    },
    [setLoading],
  );

  const setAuthLoading = useCallback(
    (isLoading: boolean, action: string = "Autenticando...") => {
      setLoading(isLoading, action, "auth");
    },
    [setLoading],
  );

  return (
    <LoadingContext.Provider
      value={{
        loadingState,
        setLoading,
        setNavigationLoading,
        setAuthLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

// Hook para navegação com loading
export function useNavigationWithLoading() {
  const { setNavigationLoading } = useLoading();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateWithLoading = useCallback(
    async (destination: string, navigateFn: () => void | Promise<void>) => {
      try {
        setIsNavigating(true);
        setNavigationLoading(true, destination);

        // Pequeno delay para mostrar o loading
        await new Promise((resolve) => setTimeout(resolve, 300));

        await navigateFn();
      } finally {
        // Delay adicional para garantir que a navegação seja visível
        setTimeout(() => {
          setIsNavigating(false);
          setNavigationLoading(false);
        }, 500);
      }
    },
    [setNavigationLoading],
  );

  return {
    isNavigating,
    navigateWithLoading,
  };
}
