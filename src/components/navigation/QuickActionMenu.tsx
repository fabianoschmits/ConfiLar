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
import { useAuthContext } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface QuickActionItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function QuickActionMenu() {
  const pathname = usePathname();
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] pointer-events-none overflow-visible">
      <nav
        className="relative px-2 flex items-center justify-around pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="absolute inset-0 bg-[var(--cl-surface)]/95 backdrop-blur-md border-t border-[var(--cl-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.55)] -z-10" />

        <div className="flex items-center justify-around w-full h-14 relative">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isContact = action.id === "contact";
            const isActive = isContact
              ? false
              : pathname === action.href ||
                pathname.startsWith(action.href + "/");

            const itemContent = (
              <div className="flex flex-col items-center justify-center h-full relative">
                <div className="relative flex items-center justify-center w-12 h-10">
                  {action.badge && action.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center border-[1.5px] border-[var(--cl-surface)] z-30">
                      {action.badge}
                    </span>
                  )}

                  <motion.div
                    animate={{ y: isActive ? -18 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    className="relative flex items-center justify-center w-12 h-12"
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-[var(--cl-teal)] rounded-full shadow-lg shadow-[#00b0b0]/30 z-10"
                          initial={{
                            opacity: 0,
                            scaleX: 1.5,
                            scaleY: 0.6,
                          }}
                          animate={{
                            opacity: 1,
                            scaleX: 1,
                            scaleY: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scaleX: 0.5,
                            scaleY: 1.5,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                            mass: 1,
                            layout: {
                              type: "spring",
                              stiffness: 350,
                              damping: 25,
                            },
                          }}
                        />
                      )}
                    </AnimatePresence>

                    <div
                      className={cn(
                        "relative z-20 flex items-center justify-center pointer-events-none",
                        isActive ? "text-white" : "text-[var(--cl-ink-muted)]",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-[stroke-width,width,height] duration-300",
                          isActive ? "w-6 h-6 stroke-[2.5]" : "stroke-[1.8]",
                        )}
                      />
                    </div>
                  </motion.div>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-medium leading-none relative z-10 mt-0.5 whitespace-nowrap",
                    isActive
                      ? "font-bold text-[var(--cl-ink)]"
                      : "text-[var(--cl-ink-muted)]",
                  )}
                >
                  {action.label}
                </span>
              </div>
            );

            const itemClassName =
              "flex-1 flex justify-center h-14 active:scale-90 transition-transform duration-200 pointer-events-auto";

            return isContact ? (
              <a
                key={action.id}
                id={`nav-item-${action.id}`}
                href={action.href}
                className={itemClassName}
                aria-label={action.label}
              >
                {itemContent}
              </a>
            ) : (
              <Link
                key={action.id}
                id={`nav-item-${action.id}`}
                href={action.href}
                className={itemClassName}
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
