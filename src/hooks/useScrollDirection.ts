"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reappearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Clear any pending reappear timer since user is still scrolling
      if (reappearTimeoutRef.current) {
        clearTimeout(reappearTimeoutRef.current);
        reappearTimeoutRef.current = null;
      }

      // Se o usuário está no topo da página, mostrar o menu
      if (currentScrollY === 0) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
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

      // After 3s of no scrolling, show the menu again
      reappearTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
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
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (reappearTimeoutRef.current) clearTimeout(reappearTimeoutRef.current);
    };
  }, [lastScrollY]);

  return { isVisible };
}
