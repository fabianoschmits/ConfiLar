"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Rows3,
  Search,
  BriefcaseBusiness,
  UserRound,
  LogIn,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function QuickActionMenu() {
  const pathname = usePathname();
  const { user, profile } = useAuthContext();

  if (user && profile && !profile.profile_completed) return null;

  const signedIn = Boolean(user && profile);
  const actions = [
    { id: "home", label: "Início", href: signedIn ? "/home" : "/", icon: Home },
    { id: "feed", label: "Feed", href: "/feed", icon: Rows3 },
    { id: "search", label: "Buscar", href: "/buscar", icon: Search },
    {
      id: "classifieds",
      label: "Classificados",
      href: "/classificados",
      icon: BriefcaseBusiness,
    },
    signedIn
      ? {
          id: "profile",
          label: "Perfil",
          href: `/perfil/${profile!.id}`,
          icon: UserRound,
        }
      : { id: "login", label: "Entrar", href: "/auth", icon: LogIn },
  ];

  return (
    <nav className="app-bottom-nav lg:hidden" aria-label="Navegação principal">
      {actions.map(({ id, label, href, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={id}
            id={`nav-item-${id}`}
            href={href}
            className={cn(
              "app-bottom-nav-item",
              active && "app-bottom-nav-item--active",
            )}
            aria-current={active ? "page" : undefined}
            aria-label={label}
          >
            <span className="app-bottom-nav-icon">
              <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
            </span>
            <span className="app-bottom-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
