"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  storageKey?: string;
}

export function GuidedTour({
  steps,
  isOpen,
  onClose,
  onComplete,
  storageKey = "guided-tour-completed",
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (!isOpen || !step) return;

    const updatePosition = () => {
      const element = document.querySelector(step.target);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const placement = step.placement || "bottom";

      let top = 0;
      let left = 0;

      switch (placement) {
        case "top":
          top = rect.top - 150;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - 320;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
      }

      setPosition({ top, left });

      // Highlight element
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("tour-highlight");
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);

      const element = document.querySelector(step.target);
      element?.classList.remove("tour-highlight");
    };
  }, [currentStep, isOpen, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      step.action?.();
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, "true");
    }
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, "skipped");
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-in fade-in duration-300" />

      {/* Tour Card */}
      <div
        className="fixed z-[201] w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
              {currentStep + 1}/{steps.length}
            </span>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {step.title}
            </h3>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Pular tour"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {step.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Pular
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-1"
            >
              {isLastStep ? "Concluir" : "Próximo"}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* CSS for highlight */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 199;
          box-shadow:
            0 0 0 4px rgba(59, 130, 246, 0.5),
            0 0 0 9999px rgba(0, 0, 0, 0.6);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}

// Hook para gerenciar o tour
export function useGuidedTour(storageKey: string = "guided-tour-completed") {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      // Aguardar 1 segundo antes de mostrar o tour
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const startTour = () => setIsOpen(true);
  const closeTour = () => setIsOpen(false);

  return { isOpen, startTour, closeTour };
}

// Steps de exemplo para o feed
export const feedTourSteps: TourStep[] = [
  {
    target: '[aria-label="Criar novo post"]',
    title: "Criar Posts",
    content:
      "Clique aqui para criar um novo post e compartilhar com a comunidade!",
    placement: "bottom",
  },
  {
    target: 'input[placeholder*="Buscar"]',
    title: "Buscar",
    content:
      "Use a busca para encontrar posts, usuários e categorias. Pressione Ctrl+K para focar rapidamente!",
    placement: "bottom",
  },
  {
    target: '[aria-label="Curtir post"]',
    title: "Curtir Posts",
    content:
      "Curta posts que você gosta! Você também pode dar curtidas premium gastando ConfiPoints.",
    placement: "top",
  },
  {
    target: '[aria-label="Voltar ao topo"]',
    title: "Voltar ao Topo",
    content:
      "Depois de rolar a página, use este botão para voltar rapidamente ao topo!",
    placement: "left",
  },
];
