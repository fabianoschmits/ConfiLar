"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "@/contexts/TutorialContext";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TutorialOverlay() {
  const {
    isActive,
    currentStepIndex,
    currentSteps,
    nextStep,
    prevStep,
    skipTutorial,
  } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update target rect when step changes or resize
  useEffect(() => {
    if (!isActive) return;

    const updateRect = () => {
      const step = currentSteps[currentStepIndex];
      const element = document.getElementById(step.targetId);

      if (element) {
        const rect = element.getBoundingClientRect();
        const padding = 8;

        // Auto-scroll to target with a small delay for page stability
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        setTargetRect(
          DOMRect.fromRect({
            x: rect.x - padding,
            y: rect.y - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }),
        );
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    const interval = setInterval(updateRect, 500);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearInterval(interval);
    };
  }, [isActive, currentStepIndex, currentSteps]);

  if (!isActive) return null;

  const step = currentSteps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === currentSteps.length - 1;

  // Calculate position style - Simplified for Flexbox centering
  const getPositionStyle = (): React.CSSProperties => {
    return {
      width: "100%",
      maxWidth: "400px",
      zIndex: 102,
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden pointer-events-none"
      >
        {/* Backdrop with hole */}
        <div className="absolute inset-0 bg-black/60 pointer-events-auto transition-all duration-300">
          {targetRect && (
            <>
              {/* Target Hole */}
              <div
                style={{
                  position: "absolute",
                  left: targetRect.left,
                  top: targetRect.top,
                  width: targetRect.width,
                  height: targetRect.height,
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                  borderRadius: "8px",
                  transition: "all 0.3s ease-out",
                }}
              />
              {/* Visual Pulse for Mobile and Highlights */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  left: targetRect.left - 4,
                  top: targetRect.top - 4,
                  width: targetRect.width + 8,
                  height: targetRect.height + 8,
                  border: "4px solid #3b82f6",
                  borderRadius: "12px",
                  pointerEvents: "none",
                  zIndex: 101,
                }}
              />
            </>
          )}
        </div>

        {/* Content Card */}
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative pointer-events-auto p-4 md:p-6 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl"
          style={getPositionStyle()}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--cl-ink)] to-indigo-600 bg-clip-text text-transparent">
              {step.title}
            </h3>
            <button
              onClick={skipTutorial}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Fechar tutorial"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
              {step.content}
            </p>
          </div>

          {/* Footer / Controls */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {currentSteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i === currentStepIndex
                      ? "bg-[var(--cl-ink)]"
                      : "bg-gray-300 dark:bg-gray-700",
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  <ChevronLeft size={16} />
                </Button>
              )}

              <Button
                size="sm"
                onClick={nextStep}
                className="bg-[var(--cl-ink)] hover:brightness-110 text-white shadow-lg shadow-blue-500/20"
              >
                {isLast ? (
                  <span className="flex items-center gap-1">
                    Concluir <Check size={16} />
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    Próximo <ChevronRight size={16} />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
