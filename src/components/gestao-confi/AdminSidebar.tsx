"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  Clock,
  BarChart3,
  Settings,
  Activity,
  LogOut,
  Menu,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const adminNavItems = [
  {
    href: "/gestao-confi/dashboard",
    label: "Visão Geral",
    icon: LayoutDashboard,
    description: "Resumo completo do sistema",
  },
  {
    href: "/gestao-confi/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Gráficos e estatísticas",
  },
  {
    href: "/gestao-confi/dashboard/users",
    label: "Usuários",
    icon: Users,
    description: "Gerenciar usuários",
  },
  {
    href: "/gestao-confi/dashboard/purchases",
    label: "Compras",
    icon: ShoppingCart,
    description: "Gerenciar compras de pontos",
  },
  {
    href: "/gestao-confi/dashboard/verifications",
    label: "Verificações",
    icon: ShieldCheck,
    description: "Analisar documentos de identidade",
  },
  {
    href: "/gestao-confi/dashboard/posts",
    label: "Posts & Conteúdo",
    icon: FileText,
    description: "Gerenciar posts e conteúdo",
  },
  {
    href: "/gestao-confi/dashboard/moderation",
    label: "Moderação",
    icon: Shield,
    description: "Denúncias e banimentos",
  },
  {
    href: "/gestao-confi/dashboard/cron",
    label: "Cron Jobs",
    icon: Clock,
    description: "Tarefas agendadas",
  },
  {
    href: "/gestao-confi/dashboard/system",
    label: "Sistema",
    icon: Settings,
    description: "Configurações do sistema",
  },
  {
    href: "/gestao-confi/dashboard/logs",
    label: "Logs",
    icon: Activity,
    description: "Logs e monitoramento",
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void; // Optional callback to close mobile sheet on navigation
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const getActiveTab = (path: string) => {
    if (pathname === path) return true;
    if (path !== "/gestao-confi/dashboard" && pathname.startsWith(path))
      return true;
    return false;
  };

  return (
    <div className="flex flex-col h-full py-4 space-y-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Administração
        </h2>
        <div className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = getActiveTab(item.href);

            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start",
                  isActive ? "bg-accent text-accent-foreground" : "font-normal",
                )}
                asChild
                onClick={onNavigate}
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
      <div className="mt-auto px-3">
        <div className="flex items-center gap-4 px-4 py-4 rounded-lg bg-muted/50">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">ConfiLar Admin</p>
            <p className="text-xs text-muted-foreground">v3.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
