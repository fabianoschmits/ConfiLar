import { ReactNode } from "react";
import { ArrowLeft, LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  backUrl?: string; // Optional URL for a back button
  icon?: LucideIcon;
}

export function AdminPageHeader({
  title,
  description,
  children,
  backUrl,
  icon: Icon,
}: AdminPageHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="hidden sm:flex bg-[var(--cl-ink)]/10 p-3 rounded-2xl border border-[var(--cl-teal)]/20 text-[var(--cl-teal)] shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="space-y-1">
            {backUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="pl-0 -ml-2 mb-1 text-muted-foreground hover:text-foreground"
              >
                <Link href={backUrl}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            )}
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              {Icon && (
                <Icon className="sm:hidden h-5 w-5 text-[var(--cl-teal)]" />
              )}
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {children}
          </div>
        )}
      </div>
      <Separator className="my-4" />
    </div>
  );
}
