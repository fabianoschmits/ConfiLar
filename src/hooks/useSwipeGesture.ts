"use client";

import { useEffect, useRef, TouchEvent } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  preventScroll?: boolean;
}

export function useSwipeGesture(
  handlers: SwipeHandlers,
  options: SwipeOptions = {},
) {
  const {
    minSwipeDistance = 50,
    maxSwipeTime = 300,
    preventScroll = false,
  } = options;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;

    // Verificar se o swipe foi rápido o suficiente
    if (deltaTime > maxSwipeTime) {
      touchStart.current = null;
      return;
    }

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determinar direção do swipe
    if (absDeltaX > absDeltaY) {
      // Swipe horizontal
      if (absDeltaX > minSwipeDistance) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }
    } else {
      // Swipe vertical
      if (absDeltaY > minSwipeDistance) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }

    touchStart.current = null;
  };

  return {
    onTouchStart,
    onTouchEnd,
  };
}

// Hook para vibração (feedback tátil)
export function useHapticFeedback() {
  const vibrate = (pattern: number | number[] = 10) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const lightTap = () => vibrate(10);
  const mediumTap = () => vibrate(20);
  const heavyTap = () => vibrate(30);
  const doubleTap = () => vibrate([10, 50, 10]);
  const success = () => vibrate([10, 50, 10, 50, 10]);
  const error = () => vibrate([50, 100, 50]);

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    doubleTap,
    success,
    error,
  };
}
