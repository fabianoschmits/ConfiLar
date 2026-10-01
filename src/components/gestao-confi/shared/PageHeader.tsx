"use client";

import { PageHeader as AppPageHeader } from "@/components/layout/PageHeader";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onRefresh?: () => void;
  loading?: boolean;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  onRefresh,
  loading,
  actions,
}: PageHeaderProps) {
  return (
    <AppPageHeader
      title={title}
      actions={
        <>
          {actions}
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} disabled={loading}>
              <RefreshCw
                aria-hidden="true"
                className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
              Atualizar
            </Button>
          )}
        </>
      }
    />
  );
}
