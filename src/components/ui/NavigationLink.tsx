"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  destination?: string;
  id?: string;
}

export function NavigationLink({
  href,
  children,
  className,
  onClick,
  destination,
  id,
}: NavigationLinkProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (onClick) {
      onClick();
    }

    try {
      console.log("🔗 Navegando para:", href);
      // Navegação direta com router.push
      router.push(href);
    } catch (error) {
      console.error("Erro na navegação:", error);
      // Fallback para window.location
      window.location.href = href;
    }
  };

  return (
    <button id={id} className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
