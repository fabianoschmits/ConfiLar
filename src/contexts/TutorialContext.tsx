"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { tutorialSteps } from "@/data/tutorialSteps";

interface TutorialContextType {
  isActive: boolean;
  currentStepIndex: number;
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if we should start the tutorial based on URL param
    if (!user?.id) return;

    const shouldWelcome = searchParams.get("welcome") === "true";
    const storageKey = `confilar_tutorial_seen_${user.id}`;
    const hasSeenTutorial = localStorage.getItem(storageKey);

    if (shouldWelcome && !hasSeenTutorial) {
      setIsActive(true);
    }
  }, [searchParams, user?.id]);

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStepIndex(0);
  };

  const endTutorial = () => {
    if (user?.id) {
      localStorage.setItem(`confilar_tutorial_seen_${user.id}`, "true");
    }
    setIsActive(false);
    // Optional: Remove query param without reload
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState({}, "", url);
  };

  const skipTutorial = () => {
    endTutorial();
  };

  const nextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
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
        startTutorial,
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
