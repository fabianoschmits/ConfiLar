"use client";

import React from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { UserCheck, Sparkles } from "lucide-react";

interface WhoReferredMeProps {
  referrerId: string;
  referrerName: string;
  referrerCode: string;
  referrerAvatar: string | null;
}

export function WhoReferredMe({
  referrerId,
  referrerName,
  referrerCode,
  referrerAvatar,
}: WhoReferredMeProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Link
          href={`/perfil/${referrerId}`}
          className="flex items-center gap-2 flex-1 hover:opacity-80 transition-opacity"
        >
          <div className="flex-shrink-0 relative">
            <UserAvatar
              src={referrerAvatar}
              alt={referrerName}
              fallback={referrerName.charAt(0).toUpperCase()}
              size="sm"
              showReferralBadge={false}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
              <UserCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Você foi indicado por
              </p>
              <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:underline">
              {referrerName}
            </p>
          </div>
        </Link>

        <div className="flex-shrink-0 text-right">
          <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wider font-medium">
            Código
          </p>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide">
            {referrerCode}
          </p>
        </div>
      </div>
    </div>
  );
}
