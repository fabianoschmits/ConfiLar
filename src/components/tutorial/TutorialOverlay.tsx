"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTutorial } from "@/contexts/TutorialContext";
import { tutorialSteps } from "@/data/tutorialSteps";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TutorialOverlay() {
  const { isActive, currentStepIndex, nextStep, prevStep, skipTutorial } =
    useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Update target rect when step changes or resize
  useEffect(() => {
    if (!isActive) return;

    const updateRect = () => {
      const step = tutorialSteps[currentStepIndex];
      const element = document.getElementById(step.targetId);

      if (element) {
        const rect = element.getBoundingClientRect();
        // Add some padding
        const padding = 8;
        setTargetRect(
          DOMRect.fromRect({
            x: rect.x - padding,
            y: rect.y - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
          }),
        );
      } else {
        // Fallback for "center" position or missing element
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    // Check periodically for the element in case it renders late
    const interval = setInterval(updateRect, 500);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearInterval(interval);
    };
  }, [isActive, currentStepIndex]);

  if (!isActive) return null;

  const step = tutorialSteps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === tutorialSteps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-hidden pointer-events-none"
      >
        {/* Backdrop with hole */}
        <div className="absolute inset-0 bg-black/60 pointer-events-auto transition-all duration-300">
          {targetRect && (
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
          )}
        </div>

        {/* Content Card */}
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed pointer-events-auto p-4 md:p-6 w-[90vw] md:w-[400px]",
            // Positioning logic
            !targetRect && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            targetRect &&
              step.position === "bottom" &&
              "top-[calc(var(--target-bottom)+20px)] left-[calc(var(--target-left)+var(--target-width)/2)] -translate-x-1/2",
            targetRect &&
              step.position === "top" &&
              "bottom-[calc(100vh-var(--target-top)+20px)] left-[calc(var(--target-left)+var(--target-width)/2)] -translate-x-1/2",
            targetRect &&
              step.position === "right" &&
              "top-[calc(var(--target-top)+var(--target-height)/2)] left-[calc(var(--target-right)+20px)] -translate-y-1/2",
            targetRect &&
              step.position === "left" &&
              "top-[calc(var(--target-top)+var(--target-height)/2)] right-[calc(100vw-var(--target-left)+20px)] -translate-y-1/2",
            // Fallbacks for other positions can be added as needed
            // Using CSS variables for dynamic positioning
            "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl",
          )}
          style={
            targetRect
              ? ({
                  "--target-top": `${targetRect.top}px`,
                  "--target-bottom": `${targetRect.bottom}px`,
                  "--target-left": `${targetRect.left}px`,
                  "--target-right": `${targetRect.right}px`,
                  "--target-width": `${targetRect.width}px`,
                  "--target-height": `${targetRect.height}px`,
                } as React.CSSProperties)
              : {}
          }
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
              {tutorialSteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i === currentStepIndex
                      ? "bg-blue-600"
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
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
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
