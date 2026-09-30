"use client";

import React from "react";
import { Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  shouldRefresh: boolean;
}

export function PullToRefresh({
  isPulling,
  isRefreshing,
  pullDistance,
  shouldRefresh,
}: PullToRefreshProps) {
  // Se não estiver puxando nem carregando, não mostra nada
  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="absolute left-0 right-0 z-50 flex justify-center overflow-hidden pointer-events-none"
      style={{
        height: isRefreshing ? "60px" : `${pullDistance}px`,
        top: 0,
      }}
    >
      <div className="flex flex-col items-center justify-center w-full bg-transparent">
        <AnimatePresence mode="wait">
          {isRefreshing ? (
            <motion.div
              key="refreshing"
              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                rotate: { repeat: Infinity, duration: 1, ease: "linear" },
                opacity: { duration: 0.2 },
              }}
              className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <RefreshCw className="w-5 h-5 text-[var(--cl-teal)]" />
            </motion.div>
          ) : (
            <motion.div
              key="pulling"
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: Math.min(pullDistance / 50, 1),
                y: 0,
                scale: shouldRefresh ? 1.1 : 1,
                rotate: (pullDistance / 100) * 180,
              }}
              className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <ChevronDown
                className={`w-5 h-5 transition-colors duration-200 ${
                  shouldRefresh ? "text-[var(--cl-teal)]" : "text-gray-400"
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!isRefreshing && pullDistance > 20 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-[10px] font-medium mt-1 transition-colors duration-200 ${
              shouldRefresh ? "text-[var(--cl-teal)]" : "text-gray-400"
            }`}
          >
            {shouldRefresh ? "Solte para atualizar" : "Puxe para atualizar"}
          </motion.span>
        )}
      </div>
    </div>
  );
}
