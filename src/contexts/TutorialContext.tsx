"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { tutorialSteps, TutorialStep } from "@/data/tutorialSteps";
import { tutorialStepsClassifieds } from "@/data/tutorialStepsClassifieds";
import { tutorialStepsBusca } from "@/data/tutorialStepsBusca";

export type TutorialPage = "feed" | "classificados" | "busca";

interface TutorialContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentSteps: TutorialStep[];
  currentPage: TutorialPage | null;
  startTutorial: () => void;
  startPageTutorial: (page: TutorialPage) => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

const TUTORIAL_STEPS_MAP: Record<TutorialPage, TutorialStep[]> = {
  feed: tutorialSteps,
  classificados: tutorialStepsClassifieds,
  busca: tutorialStepsBusca,
};

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState<TutorialPage | null>(null);
  const [currentSteps, setCurrentSteps] =
    useState<TutorialStep[]>(tutorialSteps);

  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Auto-trigger tutorial on first visit to each page
  useEffect(() => {
    if (!user?.id) return;
    if (isActive) return; // Don't interrupt active tutorial

    // Determine current page from pathname
    let page: TutorialPage | null = null;
    if (pathname === "/feed") page = "feed";
    else if (pathname === "/classificados") page = "classificados";
    else if (pathname === "/buscar") page = "busca";

    if (!page) return;

    const storageKey = `confilar_tutorial_seen_${page}_${user.id}`;
    const hasSeenTutorial = localStorage.getItem(storageKey);

    // Check for welcome param (for feed after signup)
    const shouldWelcome = searchParams.get("welcome") === "true";

    if (
      (shouldWelcome && page === "feed" && !hasSeenTutorial) ||
      (!hasSeenTutorial && page !== "feed")
    ) {
      // Small delay to ensure page is fully rendered
      const timer = setTimeout(() => {
        startPageTutorial(page as TutorialPage);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, user?.id, searchParams, isActive]);

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setCurrentPage("feed");
    setCurrentSteps(tutorialSteps);
  };

  const startPageTutorial = (page: TutorialPage) => {
    const steps = TUTORIAL_STEPS_MAP[page];
    setCurrentSteps(steps);
    setCurrentPage(page);
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const endTutorial = () => {
    if (user?.id && currentPage) {
      localStorage.setItem(
        `confilar_tutorial_seen_${currentPage}_${user.id}`,
        "true",
      );
    }
    setIsActive(false);
    setCurrentPage(null);

    // Remove welcome param if present
    const url = new URL(window.location.href);
    if (url.searchParams.has("welcome")) {
      url.searchParams.delete("welcome");
      window.history.replaceState({}, "", url);
    }
  };

  const skipTutorial = () => {
    endTutorial();
  };

  const nextStep = () => {
    if (currentStepIndex < currentSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTutorial();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentSteps,
        currentPage,
        startTutorial,
        startPageTutorial,
        endTutorial,
        nextStep,
        prevStep,
        skipTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
