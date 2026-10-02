"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
const Overlay = dynamic(() =>
  import("./TutorialOverlay").then((module) => module.TutorialOverlay),
);
export function LazyTutorialOverlay() {
  const { isActive } = useTutorial();
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (isActive) setStarted(true);
  }, [isActive]);
  // Keep it mounted after first use so its existing exit transitions stay intact.
  return started || isActive ? <Overlay /> : null;
}
