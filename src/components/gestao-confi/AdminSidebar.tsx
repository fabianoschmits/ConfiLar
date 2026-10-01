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
  MessageSquare,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    title: "Gestão Principal",
    items: [
      {
        href: "/gestao-confi/dashboard",
        label: "Visão Geral",
        icon: LayoutDashboard,
      },
      {
        href: "/gestao-confi/dashboard/atendimento",
        label: "Atendimento & Hub",
        icon: MessageSquare,
      },
      {
        href: "/gestao-confi/dashboard/users",
        label: "Gerenciar Usuários",
        icon: Users,
      },
      {
        href: "/gestao-confi/dashboard/purchases",
        label: "Financeiro & Créditos",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Moderação & Conteúdo",
    items: [
      {
        href: "/gestao-confi/dashboard/atendimento?tab=verifications",
        label: "Verificações de ID",
        icon: ShieldCheck,
      },
      {
        href: "/gestao-confi/dashboard/posts",
        label: "Posts & Conteúdo",
        icon: FileText,
      },
    ],
  },
  {
    title: "Análise & Sistema",
    items: [
      {
        href: "/gestao-confi/dashboard/analytics",
        label: "Analytics",
        icon: BarChart3,
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
    ],
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
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
    <div className="flex flex-col h-full py-6 space-y-6">
      <div className="px-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-[var(--cl-cta)] p-1.5 rounded-lg shadow-lg shadow-black/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Admin</h2>
        </div>

        <nav className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = getActiveTab(item.href);

                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start h-9 px-3 rounded-xl transition-all",
                        isActive
                          ? "bg-[var(--cl-mist)] text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      )}
                      asChild
                      onClick={onNavigate}
                    >
                      <Link href={item.href}>
                        <Icon
                          className={cn(
                            "mr-2.5 h-4 w-4",
                            isActive &&
                              "text-[var(--cl-teal)] dark:text-blue-400",
                          )}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                        )}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-4 pb-4">
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold truncate">ConfiLar</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-bold">
              PRO
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Versão 3.5.0</p>
        </div>
      </div>
    </div>
  );
}
