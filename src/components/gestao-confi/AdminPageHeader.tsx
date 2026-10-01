import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  backUrl?: string;
  icon?: LucideIcon;
}

export function AdminPageHeader({
  title,
  description,
  children,
  backUrl,
  icon,
}: AdminPageHeaderProps) {
  return (
    <PageHeader
      title={title}
      description={description}
      icon={icon}
      actions={children}
      backHref={backUrl}
    />
  );
}
