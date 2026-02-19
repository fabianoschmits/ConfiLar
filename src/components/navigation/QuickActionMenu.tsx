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
  HelpCircle,
  Info,
  Mail,
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

  if (user && profile && !profile.profile_completed) {
    return null;
  }

  const publicQuickActions: QuickActionItem[] = [
    { id: "home", label: "Home", href: "/", icon: Home },
    { id: "login", label: "Login", href: "/auth", icon: LogIn },
    { id: "about", label: "Sobre", href: "/sobre", icon: Info },
    { id: "help", label: "Ajuda", href: "/ajuda", icon: HelpCircle },
    {
      id: "contact",
      label: "Contato",
      href: "mailto:contato@appconfilar.com.br",
      icon: Mail,
    },
  ];

  const loggedInQuickActions: QuickActionItem[] = [
    { id: "home", label: "Home", href: "/home", icon: Home },
    { id: "feed", label: "Feed", href: "/feed", icon: Users },
    { id: "search", label: "Buscar", href: "/buscar", icon: Search },
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

  const quickActions =
    !user || !profile ? publicQuickActions : loggedInQuickActions;

  return (
    <div
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-[90] transition-all duration-300 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none",
      )}
    >
      <nav
        className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around px-2 h-16">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isContact = action.id === "contact";
            const isActive = isContact
              ? false
              : pathname === action.href ||
              pathname.startsWith(action.href + "/");

            const itemContent = (
              <div className="flex flex-col items-center justify-center gap-0.5 h-full py-1">
                {/* Icon — large circle when active, plain when not */}
                <div className="relative">
                  {action.badge && action.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center border-[1.5px] border-white dark:border-gray-950 z-10">
                      {action.badge}
                    </span>
                  )}
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full transition-all duration-300",
                      isActive
                        ? "w-12 h-12 bg-[#00b0b0] shadow-lg shadow-[#00b0b0]/30 -mt-3"
                        : "w-8 h-8",
                    )}
                  >
                    <Icon
                      className={cn(
                        "transition-all duration-300",
                        isActive
                          ? "w-6 h-6 text-white stroke-[2.5]"
                          : "w-5 h-5 text-gray-400 dark:text-gray-500 stroke-[1.8]",
                      )}
                    />
                  </div>
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors leading-none",
                    isActive
                      ? "text-[#00b0b0] font-bold"
                      : "text-gray-400 dark:text-gray-500",
                  )}
                >
                  {action.label}
                </span>
              </div>
            );

            return isContact ? (
              <a
                key={action.id}
                id={`nav-item-${action.id}`}
                href={action.href}
                className="flex-1 flex justify-center active:scale-90 transition-transform duration-150 h-16"
                aria-label={action.label}
              >
                {itemContent}
              </a>
            ) : (
              <Link
                key={action.id}
                id={`nav-item-${action.id}`}
                href={action.href}
                className="flex-1 flex justify-center active:scale-90 transition-transform duration-150 h-16"
                aria-label={action.label}
              >
                {itemContent}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
