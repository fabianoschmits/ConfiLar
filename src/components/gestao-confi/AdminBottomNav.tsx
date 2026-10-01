"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  MessageSquare,
  Menu,
  BarChart3,
  ShieldCheck,
  FileText,
  Activity,
  Clock,
  Settings,
  Shield,
  Bell,
  Flag,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const base = "/gestao-confi/dashboard";
const primary = [
  { href: base, label: "Início", icon: LayoutDashboard },
  { href: base + "/atendimento", label: "Atendimento", icon: MessageSquare },
  { href: base + "/users", label: "Usuários", icon: Users },
  { href: base + "/purchases", label: "Financeiro", icon: ShoppingCart },
];
const secondary = [
  { href: base + "/analytics", label: "Análises", icon: BarChart3 },
  { href: base + "/verifications", label: "Verificações", icon: ShieldCheck },
  { href: base + "/posts", label: "Publicações", icon: FileText },
  { href: base + "/stats", label: "Estatísticas", icon: Activity },
  { href: base + "/logs", label: "Logs de sistema", icon: Activity },
  { href: base + "/reports", label: "Denúncias", icon: Flag },
  { href: base + "/tickets", label: "Suporte", icon: MessageSquare },
  { href: base + "/bans", label: "Banimentos", icon: Shield },
  { href: base + "/notifications", label: "Notificações", icon: Bell },
  { href: base + "/cron", label: "Tarefas", icon: Clock },
  { href: base + "/system", label: "Configurações", icon: Settings },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== base && pathname.startsWith(href + "/"));
  return (
    <nav
      className="app-bottom-nav app-admin-navigation"
      aria-label="Navegação administrativa"
    >
      {primary.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "app-bottom-nav-item",
            isActive(href) && "app-bottom-nav-item--active",
          )}
        >
          <span className="app-bottom-nav-icon">
            <Icon size={22} aria-hidden="true" />
          </span>
          <span>{label}</span>
        </Link>
      ))}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className={cn(
              "app-bottom-nav-item",
              secondary.some((item) => isActive(item.href)) &&
                "app-bottom-nav-item--active",
            )}
            aria-label="Mais ferramentas de gestão"
          >
            <span className="app-bottom-nav-icon">
              <Menu size={22} aria-hidden="true" />
            </span>
            <span>Mais</span>
          </button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-3xl border-[var(--cl-border)] bg-[var(--cl-surface)] p-4 pb-[calc(24px+env(safe-area-inset-bottom))] text-[var(--cl-ink)]"
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Ferramentas de gestão</SheetTitle>
            <SheetDescription>
              Escolha a área que deseja acessar.
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2">
            {secondary.map(({ href, label, icon: Icon }) => (
              <SheetClose asChild key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 items-center gap-2 rounded-2xl border border-[var(--cl-border)] p-3 text-sm",
                    isActive(href)
                      ? "bg-[var(--cl-mist)] font-bold"
                      : "bg-[var(--cl-surface)]",
                  )}
                >
                  <Icon
                    className="h-5 w-5 shrink-0 text-[var(--cl-teal)]"
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </Link>
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
