"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useReactionUsers } from "@/hooks/useReactions";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function LikesModal({ isOpen, onClose, postId }: LikesModalProps) {
  const { reactionUsers, isLoading } = useReactionUsers(postId);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md max-h-[80vh] flex flex-col bg-[var(--cl-surface)] border border-gray-300 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none z-10 bg-[var(--cl-surface)] border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Curtidas
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : reactionUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                Ninguém curtiu este post ainda
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {reactionUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/perfil/${user.user_id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-inherit no-underline"
                >
                  <Avatar className="w-8 h-8 border border-gray-200 dark:border-gray-800">
                    <AvatarImage
                      src={user.avatar_url || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.full_name || user.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none bg-[var(--cl-surface)] border-t border-gray-200 dark:border-gray-800 p-3">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
