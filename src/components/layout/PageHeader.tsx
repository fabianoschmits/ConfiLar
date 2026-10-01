import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/** Shared page hierarchy: identity first, reachable actions immediately below on mobile. */
export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  backHref,
  backLabel = "Voltar",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("app-page-header", className)}>
      {backHref && (
        <Button variant="ghost" size="sm" asChild className="app-page-back">
          <Link href={backHref}>
            <ArrowLeft aria-hidden="true" />
            {backLabel}
          </Link>
        </Button>
      )}
      <div className="app-page-header-row">
        <div className="app-page-heading">
          {Icon && (
            <span className="app-page-icon">
              <Icon aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
        </div>
        {actions && <div className="app-page-actions">{actions}</div>}
      </div>
    </header>
  );
}
