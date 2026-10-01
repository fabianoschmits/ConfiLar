"use client";

import type { ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

export function PublicLayout({ children }: { children: ReactNode }) {
  return <MainLayout requireAuth={false}>{children}</MainLayout>;
}
