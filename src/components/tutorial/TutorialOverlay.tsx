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

  // Calculate position style
  const getPositionStyle = (): React.CSSProperties => {
    if (isMobile) {
      // Mobile: always bottom-center
      return {
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
      };
    }

    // Desktop: position based on target
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const style: React.CSSProperties = {};

    switch (step.position) {
      case "bottom":
        style.top = `${targetRect.bottom + 20}px`;
        style.left = `${targetRect.left + targetRect.width / 2}px`;
        style.transform = "translateX(-50%)";
        break;
      case "top":
        style.bottom = `${window.innerHeight - targetRect.top + 20}px`;
        style.left = `${targetRect.left + targetRect.width / 2}px`;
        style.transform = "translateX(-50%)";
        break;
      case "right":
        style.top = `${targetRect.top + targetRect.height / 2}px`;
        style.left = `${targetRect.right + 20}px`;
        style.transform = "translateY(-50%)";
        break;
      case "left":
        style.top = `${targetRect.top + targetRect.height / 2}px`;
        style.right = `${window.innerWidth - targetRect.left + 20}px`;
        style.transform = "translateY(-50%)";
        break;
      default:
        style.top = "50%";
        style.left = "50%";
        style.transform = "translate(-50%, -50%)";
    }

    return style;
  };

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
            "fixed pointer-events-auto p-4 md:p-6 w-[90vw] md:w-[400px] max-w-[400px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl",
            isMobile && "!left-1/2 !-translate-x-1/2 !bottom-4",
          )}
          style={getPositionStyle()}
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
              {currentSteps.map((_, i) => (
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
