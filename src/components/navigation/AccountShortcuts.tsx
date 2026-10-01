"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
  getShortcutGroups,
  type NavigationProfile,
} from "@/lib/app-navigation";
import { ShortcutLink } from "./ShortcutLink";

export function AccountShortcuts({
  profile,
  isAdmin,
  unreadMessages = 0,
  onNavigate,
  onOpenChat,
}: {
  profile: NavigationProfile;
  isAdmin: boolean;
  unreadMessages?: number;
  onNavigate: () => void;
  onOpenChat: () => void;
}) {
  const [expanded, setExpanded] = useState(new Set(["account"]));
  return (
    <div className="account-shortcuts">
      {getShortcutGroups(profile).map((group) => {
        const open = expanded.has(group.id);
        return (
          <section
            key={group.id}
            className="border-b border-[var(--cl-border)]"
          >
            <button
              type="button"
              className="account-shortcuts-heading"
              aria-expanded={open}
              aria-controls={`account-shortcuts-${group.id}`}
              onClick={() =>
                setExpanded((previous) => {
                  const next = new Set(previous);
                  if (next.has(group.id)) next.delete(group.id);
                  else next.add(group.id);
                  return next;
                })
              }
            >
              <span>{group.label}</span>
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 ${open ? "rotate-180" : ""}`}
              />
            </button>
            <div id={`account-shortcuts-${group.id}`} hidden={!open}>
              <div className="account-shortcuts-grid grid grid-cols-2 gap-1 pb-3">
                {group.shortcuts.map((shortcut) => (
                  <ShortcutLink
                    key={shortcut.id}
                    shortcut={shortcut}
                    onNavigate={onNavigate}
                    onOpenChat={onOpenChat}
                    className="account-shortcut"
                  >
                    <shortcut.icon
                      aria-hidden="true"
                      className="h-[18px] w-[18px] shrink-0 text-[var(--cl-teal)]"
                    />
                    <span>{shortcut.label}</span>
                    {shortcut.id === "messages" && unreadMessages > 0 && (
                      <span
                        className="ml-auto rounded-full bg-[var(--cl-cta)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--cl-on-cta)]"
                        aria-label={`${unreadMessages} mensagens não lidas`}
                      >
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    )}
                  </ShortcutLink>
                ))}
                {group.id === "points" && isAdmin && (
                  <Link
                    href="/gestao-confi/confipoints"
                    onClick={onNavigate}
                    className="account-shortcut"
                  >
                    <ShieldCheck
                      aria-hidden="true"
                      className="h-[18px] w-[18px] shrink-0"
                    />
                    <span>Administrar pontos</span>
                  </Link>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
