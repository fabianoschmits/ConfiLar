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
  MessageSquare,
  AlertTriangle,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const primaryNavItems = [
  {
    href: "/gestao-confi/dashboard",
    label: "Início",
    icon: LayoutDashboard,
  },
  {
    href: "/gestao-confi/dashboard/atendimento",
    label: "Atendimento",
    icon: MessageSquare,
  },
  {
    href: "/gestao-confi/dashboard/users",
    label: "Usuários",
    icon: Users,
  },
  {
    href: "/gestao-confi/dashboard/purchases",
    label: "Financeiro",
    icon: ShoppingCart,
  },
];

const secondaryNavItems = [
  {
    href: "/gestao-confi/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/gestao-confi/dashboard/verifications",
    label: "Verificações",
    icon: ShieldCheck,
  },
  {
    href: "/gestao-confi/dashboard/posts",
    label: "Posts & Conteúdo",
    icon: FileText,
  },
  {
    href: "/gestao-confi/dashboard/logs",
    label: "Logs de Sistema",
    icon: Activity,
  },
  {
    href: "/gestao-confi/dashboard/cron",
    label: "Tarefas Cron",
    icon: Clock,
  },
  {
    href: "/gestao-confi/dashboard/system",
    label: "Configurações",
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
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg">
      <nav className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-around py-3 px-2">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-12 rounded-2xl transition-all duration-200",
                active
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-current")} />
              <span className="text-[10px] mt-1 font-semibold uppercase tracking-tighter">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Mais Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-12 rounded-2xl transition-all duration-200 text-gray-500 dark:text-gray-400",
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-semibold uppercase tracking-tighter">
                Mais
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[32px] px-6 pb-12">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold text-left">
                Menu Administrativo
              </SheetTitle>
              <SheetDescription className="text-left">
                Outras ferramentas de gestão
              </SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-4">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95",
                      active
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                        : "bg-muted/30 border-transparent text-foreground hover:bg-muted/50",
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-xl",
                        active
                          ? "bg-blue-100 dark:bg-blue-800/50"
                          : "bg-background border shadow-sm",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
