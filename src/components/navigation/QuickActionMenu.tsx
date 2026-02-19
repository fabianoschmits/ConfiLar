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
    <AnimatePresence>
      <motion.div
        initial={false}
        animate={{
          y: isVisible ? 0 : 100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[90]"
      >
        <nav
          className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-center justify-around px-2 h-14">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isContact = action.id === "contact";
              const isActive = isContact
                ? false
                : pathname === action.href ||
                  pathname.startsWith(action.href + "/");

              const itemContent = (
                <div className="flex flex-col items-center justify-center h-full pt-1 pb-0.5 relative">
                  {/* Container for Icon and Active Pill */}
                  <div className="relative flex items-center justify-center w-12 h-10">
                    {action.badge && action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center border-[1.5px] border-white dark:border-gray-950 z-30">
                        {action.badge}
                      </span>
                    )}

                    {/* Active Pill & Icon Wrapper - Moves as one unit */}
                    <motion.div
                      animate={{
                        y: isActive ? -18 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="relative flex items-center justify-center w-12 h-12"
                    >
                      {/* Active Indicator - Slides smoothly */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-[#00b0b0] rounded-full shadow-lg shadow-[#00b0b0]/30 z-10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Icon */}
                      <motion.div
                        animate={{
                          color: isActive ? "#ffffff" : "rgb(156, 163, 175)",
                        }}
                        transition={{ duration: 0.2 }}
                        className="relative z-20 flex items-center justify-center pointer-events-none"
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5 transition-[stroke-width,width,height] duration-300",
                            isActive ? "w-6 h-6 stroke-[2.5]" : "stroke-[1.8]",
                          )}
                        />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Label */}
                  <motion.span
                    animate={{
                      color: isActive ? "#00b0b0" : "#9ca3af",
                      scale: isActive ? 1.05 : 1,
                      y: isActive ? 2 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    className={cn(
                      "text-[10px] font-medium leading-none relative z-10",
                      isActive && "font-bold",
                    )}
                  >
                    {action.label}
                  </motion.span>
                </div>
              );

              return isContact ? (
                <a
                  key={action.id}
                  id={`nav-item-${action.id}`}
                  href={action.href}
                  className="flex-1 flex justify-center active:scale-90 transition-transform duration-150 h-14"
                  aria-label={action.label}
                >
                  {itemContent}
                </a>
              ) : (
                <Link
                  key={action.id}
                  id={`nav-item-${action.id}`}
                  href={action.href}
                  className="flex-1 flex justify-center active:scale-90 transition-transform duration-150 h-14"
                  aria-label={action.label}
                >
                  {itemContent}
                </Link>
              );
            })}
          </div>
        </nav>
      </motion.div>
    </AnimatePresence>
  );
}
