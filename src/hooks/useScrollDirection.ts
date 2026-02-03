"use client";

import { useState, useEffect } from "react";

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Se o usuário está no topo da página, mostrar o menu
      if (currentScrollY === 0) {
        setIsVisible(true);
        return;
      }

      // Detectar direção do scroll
      if (currentScrollY > lastScrollY) {
        // Rolando para baixo - esconder
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Rolando para cima - mostrar
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle com requestAnimationFrame para melhor performance
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [lastScrollY]);

  return { isVisible };
}
