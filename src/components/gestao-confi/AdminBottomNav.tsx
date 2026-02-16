"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  Activity,
  BarChart3,
  FileText,
  Clock,
  Settings,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

const allNavItems = [
  {
    href: "/gestao-confi/dashboard",
    label: "Início",
    icon: LayoutDashboard,
  },
  {
    href: "/gestao-confi/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/gestao-confi/dashboard/users",
    label: "Usuários",
    icon: Users,
  },
  {
    href: "/gestao-confi/dashboard/purchases",
    label: "Compras",
    icon: ShoppingCart,
  },
  {
    href: "/gestao-confi/dashboard/verifications",
    label: "Verificações",
    icon: ShieldCheck,
  },
  {
    href: "/gestao-confi/dashboard/posts",
    label: "Conteúdo",
    icon: FileText,
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
  {
    href: "/gestao-confi/dashboard/cron",
    label: "Cron",
    icon: Clock,
  },
  {
    href: "/gestao-confi/dashboard/system",
    label: "Sistema",
    icon: Settings,
  },
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
      <nav className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center overflow-x-auto no-scrollbar py-3 px-2 gap-1 scroll-smooth">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[72px] h-16 rounded-xl transition-all duration-200 shrink-0",
                  active
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-current")} />
                <span
                  className={cn(
                    "text-[10px] mt-1.5 font-medium whitespace-nowrap",
                    active ? "opacity-100" : "opacity-70",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
