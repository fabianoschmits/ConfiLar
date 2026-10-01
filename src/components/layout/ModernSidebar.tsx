"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Home,
  BarChart3,
  Search,
  Briefcase,
  Users,
  Star,
  MessageCircle,
  Heart,
  FileText,
  Award,
  HelpCircle,
  Phone,
  Building,
  User,
  Settings,
  Shield,
  LogOut,
  UserPlus,
  Coins,
  Crown,
  Send,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  Flag,
} from "lucide-react";
import { useSupabaseNotifications } from "@/hooks/useSupabaseNotifications";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { BrandLogo } from "@/components/common/BrandLogo";
import { cn } from "@/lib/utils";
import { NavigationLink } from "@/components/ui/NavigationLink";

interface SidebarItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  onClick?: () => void;
}

interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export function ModernSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const { user, profile } = useAuthContext();
  const { unreadCount } = useSupabaseNotifications();
  const { openChat } = useFloatingChat();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const isLoggedIn = user && profile;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const isActive = (href: string) => {
    if (href === "#" || !href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sections: SidebarSection[] = [
    {
      id: "main",
      title: "Principal",
      items: [
        {
          id: "home",
          title: "Home",
          href: "/home",
          icon: <Home className="h-4 w-4" />,
        },
        {
          id: "feed",
          title: "Feed",
          href: "/feed",
          icon: <Users className="h-4 w-4" />,
        },
        {
          id: "classifieds",
          title: "Classificados",
          href: "/classificados",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          id: "search",
          title: "Buscar",
          href: "/buscar",
          icon: <Search className="h-4 w-4" />,
        },
      ],
    },
    ...(isLoggedIn
      ? [
          {
            id: "management",
            title: "Gestão",
            items: [
              {
                id: "favorites",
                title: "Favoritos",
                href: "/favoritos",
                icon: <Heart className="h-4 w-4" />,
              },
              {
                id: "reviews",
                title: "Avaliações",
                href: "/avaliacoes",
                icon: <Star className="h-4 w-4" />,
              },
              {
                id: "referrals",
                title: "Indicações",
                href: "/indicacoes",
                icon: <UserPlus className="h-4 w-4" />,
              },
              {
                id: "messages",
                title: "Mensagens",
                href: "#",
                icon: <MessageCircle className="h-4 w-4" />,
                badge: unreadCount > 0 ? unreadCount.toString() : undefined,
                onClick: () => openChat(),
              },
            ],
          },
        ]
      : []),
    ...(isLoggedIn
      ? [
          {
            id: "confipoints",
            title: "ConfiPoints",
            items: [
              {
                id: "cp-dashboard",
                title: "Dashboard",
                href: "/confipoints/dashboard",
                icon: <BarChart3 className="h-4 w-4" />,
              },
              {
                id: "cp-store",
                title: "Loja Premium",
                href: "/confipoints/comprar",
                icon: <Crown className="h-4 w-4" />,
              },
              {
                id: "cp-purchases",
                title: "Minhas Compras",
                href: "/confipoints/compras",
                icon: <ShoppingBag className="h-4 w-4" />,
              },
              {
                id: "cp-transfer",
                title: "Transferir",
                href: "/confipoints/transferir",
                icon: <Send className="h-4 w-4" />,
              },
            ],
          },
        ]
      : []),
    ...(isLoggedIn && profile?.user_type === "professional"
      ? [
          {
            id: "professional",
            title: "Profissional",
            items: [
              {
                id: "portfolio",
                title: "Meu Portfólio",
                href: "/portfolio",
                icon: <FileText className="h-4 w-4" />,
              },
              {
                id: "reputation",
                title: "Reputação",
                href: "/reputacao",
                icon: <Award className="h-4 w-4" />,
              },
            ],
          },
        ]
      : []),
    {
      id: "support",
      title: "Suporte",
      items: [
        {
          id: "help",
          title: "Central de Ajuda",
          href: "/ajuda",
          icon: <HelpCircle className="h-4 w-4" />,
        },
        {
          id: "contact",
          title: "Contato",
          href: "/contato",
          icon: <Phone className="h-4 w-4" />,
        },
        {
          id: "about",
          title: "Sobre Nós",
          href: "/sobre",
          icon: <Building className="h-4 w-4" />,
        },
        {
          id: "terms",
          title: "Termos de Uso",
          href: "/termos",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          id: "privacy",
          title: "Privacidade",
          href: "/privacidade",
          icon: <Shield className="h-4 w-4" />,
        },
        {
          id: "reports",
          title: "Minhas Denúncias",
          href: "/minhas-denuncias",
          icon: <Flag className="h-4 w-4" />,
        },
      ],
    },
    ...(isLoggedIn
      ? [
          {
            id: "account",
            title: "Conta",
            items: [
              {
                id: "manage-profile",
                title: "Gerenciar Perfil",
                href: "#",
                icon: <Settings className="h-4 w-4" />,
                onClick: () => {
                  window.dispatchEvent(
                    new CustomEvent("confilar:open-profile-modal", {
                      detail: { tab: "account" },
                    }),
                  );
                },
              },
              {
                id: "public-profile",
                title: "Ver Perfil",
                href: profile ? `/perfil/${profile.id}` : "/perfil",
                icon: <User className="h-4 w-4" />,
              },
              {
                id: "logout",
                title: "Sair",
                href: "/auth",
                icon: <LogOut className="h-4 w-4" />,
              },
            ],
          },
        ]
      : []),
  ];

  const renderItem = (item: SidebarItem) => {
    const active = isActive(item.href);
    const baseClass = cn(
      "group flex items-center px-4 py-2.5 text-sm transition-all duration-150 w-full text-left relative",
      active
        ? "bg-[var(--cl-teal)] text-white font-semibold"
        : "text-[var(--cl-ink-secondary)] hover:bg-[var(--cl-mist)]",
      isCollapsed ? "justify-center px-0" : "justify-between",
    );

    const content = (
      <>
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center w-full",
          )}
        >
          <span
            className={cn(
              "flex-shrink-0",
              active
                ? "text-white"
                : "text-[var(--cl-ink-muted)] group-hover:text-[var(--cl-ink)]",
            )}
          >
            {item.icon}
          </span>
          {!isCollapsed && <span>{item.title}</span>}
        </div>
        {!isCollapsed && item.badge && (
          <Badge variant="destructive" className="text-xs px-1.5 py-0 h-4">
            {item.badge}
          </Badge>
        )}
        {isCollapsed && item.badge && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </>
    );

    if (item.onClick) {
      return (
        <button
          key={item.id}
          id={`nav-item-${item.id}`}
          title={isCollapsed ? item.title : ""}
          onClick={() => {
            item.onClick?.();
            setIsMobileOpen(false);
          }}
          className={baseClass}
        >
          {content}
        </button>
      );
    }

    return (
      <NavigationLink
        key={item.id}
        id={`nav-item-${item.id}`}
        href={item.href}
        destination={item.title}
        title={isCollapsed ? item.title : ""}
        onClick={() => setIsMobileOpen(false)}
        className={baseClass}
      >
        {content}
      </NavigationLink>
    );
  };

  return (
    <>
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar — flat, full-height, fixed */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full z-[60] bg-[var(--cl-surface)]",
          "border-r border-[var(--cl-border)] shadow-sm",
          "transition-all duration-300 ease-in-out",
          "hidden lg:flex flex-col",
          isCollapsed ? "w-16" : "w-56",
          isMobileOpen
            ? "flex translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-[var(--cl-border)] flex-shrink-0 relative",
            isCollapsed ? "justify-center" : "justify-between px-4",
          )}
        >
          {!isCollapsed && (
            <Link href={isLoggedIn ? "/home" : "/"}>
              <BrandLogo width={110} height={28} />
            </Link>
          )}

          {/* Collapse toggle button */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              "p-1.5 rounded-lg hover:bg-[var(--cl-mist)] text-[var(--cl-ink-muted)] transition-colors",
              isCollapsed ? "" : "ml-2",
            )}
            title={isCollapsed ? "Expandir" : "Recolher"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-2">
          {sections.map((section, sectionIndex) => (
            <div key={section.id}>
              {/* Divider between sections (not before first) */}
              {sectionIndex > 0 && (
                <div className="my-1 border-t border-[var(--cl-border)]" />
              )}

              {/* Section header — hide when collapsed */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <span>{section.title}</span>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}

              {/* Items */}
              {(isCollapsed || expandedSections.includes(section.id)) && (
                <div>{section.items.map((item) => renderItem(item))}</div>
              )}
            </div>
          ))}
        </div>

        {/* Footer with user status */}
        {isLoggedIn && (
          <div
            className={cn(
              "py-3 border-t border-gray-200 dark:border-gray-800 flex-shrink-0",
              isCollapsed ? "flex justify-center" : "px-4",
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile?.user_type === "professional"
                    ? "Profissional"
                    : "Cliente"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
