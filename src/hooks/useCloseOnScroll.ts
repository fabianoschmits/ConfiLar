import { useEffect } from "react";

/**
 * Hook to close a menu or modal when the user scrolls the page.
 * Useful for mobile interfaces where dropdowns should close on scroll.
 */
export function useCloseOnScroll(
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    // Use capture: true to detect scroll on any element, not just window
    // Window scroll event does not bubble, but capture works.
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isOpen, setIsOpen]);
}
