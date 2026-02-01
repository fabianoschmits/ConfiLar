"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Shield, Activity, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Itens principais para a barra inferior (limite de 4-5 para não lotar)
const mainNavItems = [
  {
    href: "/gestao-confi/dashboard",
    label: "Início",
    icon: LayoutDashboard,
  },
  {
    href: "/gestao-confi/dashboard/users",
    label: "Usuários",
    icon: Users,
  },
  {
    href: "/gestao-confi/dashboard/moderation",
    label: "Moderação",
    icon: Shield,
  },
  {
    href: "/gestao-confi/dashboard/logs",
    label: "Logs",
    icon: Activity,
  },
];

// Itens extras que ficam no menu "Mais"
const moreNavItems = [
  { href: "/gestao-confi/dashboard/analytics", label: "Analytics" },
  { href: "/gestao-confi/dashboard/posts", label: "Posts" },
  { href: "/gestao-confi/dashboard/cron", label: "Cron Jobs" },
  { href: "/gestao-confi/dashboard/system", label: "Sistema" },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (path !== "/gestao-confi/dashboard" && pathname.startsWith(path))
      return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg px-4 py-2 flex items-center justify-between">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
                active
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <Icon className={cn("h-6 w-6", active && "fill-current")} />
              {/* Optional label for larger mobile screens, hidden on very small */}
              {/* <span className="text-[10px] mt-1 font-medium">{item.label}</span> */}
            </Link>
          );
        })}

        {/* Menu "Mais" para itens secundários */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <Menu className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mb-2 w-48">
            {moreNavItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="w-full cursor-pointer">
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
}
