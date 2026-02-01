import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  backUrl?: string; // Optional URL for a back button
}

export function AdminPageHeader({
  title,
  description,
  children,
  backUrl,
}: AdminPageHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
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
