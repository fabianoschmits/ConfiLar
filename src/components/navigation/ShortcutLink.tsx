"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { AppShortcut } from "@/lib/app-navigation";

interface ShortcutLinkProps {
  shortcut: AppShortcut;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
  onOpenChat: () => void;
}

export function ShortcutLink({
  shortcut,
  children,
  className,
  onNavigate,
  onOpenChat,
}: ShortcutLinkProps) {
  if (shortcut.action === "chat")
    return (
      <button
        type="button"
        className={className}
        onClick={() => {
          onNavigate?.();
          onOpenChat();
        }}
      >
        {children}
      </button>
    );
  return (
    <Link href={shortcut.href} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}
