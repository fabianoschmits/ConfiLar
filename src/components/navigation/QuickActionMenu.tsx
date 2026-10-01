"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFloatingChat } from "@/contexts/FloatingChatContextSimple";
import { getMobileShortcuts, isShortcutActive } from "@/lib/app-navigation";
import { cn } from "@/lib/utils";

export function QuickActionMenu() {
  const pathname = usePathname();
  const { user, profile } = useAuthContext();
  const { isOpen, openChat, closeChat } = useFloatingChat();

  if (user && profile && !profile.profile_completed) return null;

  const actions = getMobileShortcuts(user && profile ? profile : null);

  return (
    <nav className="app-bottom-nav lg:hidden" aria-label="Navegação principal">
      {actions.map((shortcut) => {
        const { id, label, icon: Icon } = shortcut;
        const active =
          shortcut.action === "chat"
            ? isOpen
            : !isOpen && isShortcutActive(pathname, shortcut);
        const className = cn(
          "app-bottom-nav-item",
          active && "app-bottom-nav-item--active",
        );
        const content = (
          <>
            <span className="app-bottom-nav-icon">
              <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
            </span>
            <span
              className={cn(
                "app-bottom-nav-label",
                id === "classifieds" && "app-bottom-nav-label--full",
              )}
            >
              {label}
            </span>
            {id === "classifieds" && (
              <span
                aria-hidden="true"
                className="app-bottom-nav-label app-bottom-nav-label--compact"
              >
                Anúncios
              </span>
            )}
          </>
        );
        if (shortcut.action === "chat")
          return (
            <button
              key={id}
              id={`nav-item-${id}`}
              type="button"
              className={className}
              aria-label={label}
              aria-expanded={isOpen}
              onClick={() => (isOpen ? closeChat() : openChat())}
            >
              {content}
            </button>
          );
        return (
          <Link
            key={id}
            id={`nav-item-${id}`}
            href={shortcut.href}
            className={className}
            aria-current={active ? "page" : undefined}
            aria-label={label}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
