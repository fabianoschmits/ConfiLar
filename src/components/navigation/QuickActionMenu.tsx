"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Search,
  Briefcase,
  User,
  LogIn,
  UserPlus,
  Mail,
  FileText,
  Info,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useAuthContext } from "@/contexts/AuthContext";

interface QuickActionItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function QuickActionMenu() {
  const pathname = usePathname();
  const { isVisible } = useScrollDirection();
  const { user, profile } = useAuthContext();

  // Ocultar menu se o usuário estiver logado mas não tiver completado o onboarding
  if (user && profile && !profile.profile_completed) {
    return null;
  }

  // Menu para usuários não logados (página inicial e outras públicas)
  const publicQuickActions: QuickActionItem[] = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      id: "login",
      label: "Login",
      href: "/auth",
      icon: LogIn,
    },
    {
      id: "about",
      label: "Sobre",
      href: "/sobre",
      icon: Info,
    },
    {
      id: "help",
      label: "Ajuda",
      href: "/ajuda",
      icon: HelpCircle,
    },
    {
      id: "terms",
      label: "Termos",
      href: "/termos",
      icon: FileText,
    },
    {
      id: "contact",
      label: "Contato",
      href: "mailto:contato@appconfilar.com.br",
      icon: Mail,
    },
  ];

  // Menu para usuários logados
  const loggedInQuickActions: QuickActionItem[] = [
    {
      id: "home",
      label: "Home",
      href: "/home",
      icon: Home,
    },
    {
      id: "feed",
      label: "Feed",
      href: "/feed",
      icon: Users,
    },
    {
      id: "search",
      label: "Buscar",
      href: "/buscar",
      icon: Search,
    },
    {
      id: "classifieds",
      label: "Classificados",
      href: "/classificados",
      icon: Briefcase,
    },
    {
      id: "profile",
      label: "Perfil",
      href: profile ? `/perfil/${profile.id}` : "/home",
      icon: User,
    },
  ];

  // Usar ações públicas se não estiver logado, senão usar ações de logado
  const quickActions =
    !user || !profile ? publicQuickActions : loggedInQuickActions;

  return (
    <div
      className={cn(
        "lg:hidden fixed left-1/2 -translate-x-1/2 z-[90] transition-all duration-300 ease-out",
        // Using pb-safe + 1rem (approx 16px) for bottom spacing
        "bottom-[calc(1rem+env(safe-area-inset-bottom))]",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[150%] opacity-0 pointer-events-none",
      )}
    >
      <nav className="bg-white/40 dark:bg-black/40 rounded-3xl px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/60 dark:border-white/20 ring-1 ring-black/5 dark:ring-white/5 overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-center gap-2 sm:gap-4 nowrap min-w-max">
          {quickActions.map((action) => {
            const Icon = action.icon;
            // Para contato (mailto), usar <a> em vez de <Link>
            const isContact = action.id === "contact";
            // Para mailto, não verificar pathname
            const isActive = isContact
              ? false
              : pathname === action.href || pathname.startsWith(action.href);

            const content = (
              <div className="flex flex-col items-center gap-1">
                {/* Ícone e Badge Container */}
                <div className="relative">
                  {/* Badge de notificação */}
                  {action.badge && action.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-black shadow-sm z-10 font-sans">
                      {action.badge}
                    </span>
                  )}

                  {/* Ícone */}
                  <div
                    className={cn(
                      "transition-all duration-300 p-2 rounded-xl relative",
                      isActive
                        ? "text-white bg-[#00b0b0] shadow-lg shadow-[#00b0b0]/25"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5",
                    )}
                  >
                    <Icon
                      className={cn("w-5 h-5", isActive && "stroke-[2.5]")}
                    />
                  </div>

                  {/* Indicador de ativo (ponto) */}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
                  )}
                </div>

                {/* Nome do Link */}
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-[#00b0b0] font-bold"
                      : "text-gray-500 dark:text-gray-400",
                  )}
                >
                  {action.label}
                </span>
              </div>
            );

            // Container classes for consistent sizing and interactions
            const containerClasses =
              "flex flex-col items-center justify-center relative transition-transform duration-200 active:scale-90 px-1";

            return isContact ? (
              <a
                key={action.id}
                id={`nav-item-${action.id}`}
                href={action.href}
                className={containerClasses}
                aria-label={action.label}
              >
                {content}
              </a>
            ) : (
              <Link
                key={action.id}
                id={`nav-item-${action.id}`}
                href={action.href}
                className={containerClasses}
                aria-label={action.label}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
