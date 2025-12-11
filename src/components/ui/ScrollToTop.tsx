"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToTopProps {
  showAfter?: number; // Pixels de scroll para mostrar o botão
  className?: string;
}

export function ScrollToTop({ showAfter = 400, className }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={cn(
        "fixed bottom-24 right-4 z-40 p-3 bg-primary-600 dark:bg-primary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95",
        "min-h-[48px] min-w-[48px]", // Área de toque adequada
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
        className,
      )}
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
}
