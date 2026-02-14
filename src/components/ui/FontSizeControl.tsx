"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { useFontSize } from "@/hooks/useFontSize";
import { cn } from "@/lib/utils";

/**
 * Font Size Control Component
 * Allows users to adjust the application font size/zoom
 * with a slider and increment/decrement buttons
 */
export function FontSizeControl() {
  const { fontSize, updateFontSize } = useFontSize();
  const [localSize, setLocalSize] = useState(fontSize);

  // Sync local state with profile font size
  useEffect(() => {
    setLocalSize(fontSize);
  }, [fontSize]);

  // Debounced update to database
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSize !== fontSize) {
        updateFontSize(localSize);
      }
    }, 500); // Wait 500ms after user stops adjusting

    return () => clearTimeout(timer);
  }, [localSize, fontSize, updateFontSize]);

  const handleDecrease = () => {
    setLocalSize((prev) => Math.max(75, prev - 5));
  };

  const handleIncrease = () => {
    setLocalSize((prev) => Math.min(150, prev + 5));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSize(Number(e.target.value));
  };

  return (
    <div className="w-full px-2 py-1.5">
      <div className="flex items-center gap-2">
        {/* Decrease Button - Small A */}
        <button
          onClick={handleDecrease}
          disabled={localSize <= 75}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-full transition-all flex-shrink-0",
            "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-1 focus:ring-primary-500",
          )}
          aria-label="Diminuir tamanho da fonte"
        >
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            A
          </span>
        </button>

        {/* Slider */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="75"
            max="150"
            step="5"
            value={localSize}
            onChange={handleSliderChange}
            className={cn(
              "w-full h-1.5 rounded-lg appearance-none cursor-pointer",
              "bg-gray-200 dark:bg-gray-700",
              // Webkit (Chrome, Safari, Edge)
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:w-5",
              "[&::-webkit-slider-thumb]:h-5",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-[#00b0b0]", // Brand color for visibility
              "[&::-webkit-slider-thumb]:border-2",
              "[&::-webkit-slider-thumb]:border-white",
              "[&::-webkit-slider-thumb]:dark:border-gray-900",
              "[&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.2)]",
              "[&::-webkit-slider-thumb]:cursor-pointer",
              "[&::-webkit-slider-thumb]:transition-all",
              "[&::-webkit-slider-thumb]:hover:scale-110",
              "[&::-webkit-slider-thumb]:active:scale-95",
              // Firefox
              "[&::-moz-range-thumb]:w-5",
              "[&::-moz-range-thumb]:h-5",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-[#00b0b0]",
              "[&::-moz-range-thumb]:border-2",
              "[&::-moz-range-thumb]:border-white",
              "[&::-moz-range-thumb]:dark:border-gray-900",
              "[&::-moz-range-thumb]:shadow-[0_2px_10px_rgba(0,0,0,0.2)]",
              "[&::-moz-range-thumb]:cursor-pointer",
              "[&::-moz-range-thumb]:transition-all",
              "[&::-moz-range-thumb]:hover:scale-110",
              "[&::-moz-range-thumb]:active:scale-95",
            )}
            aria-label="Ajustar tamanho da fonte"
          />
        </div>

        {/* Increase Button - Large A */}
        <button
          onClick={handleIncrease}
          disabled={localSize >= 150}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-full transition-all flex-shrink-0",
            "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-1 focus:ring-primary-500",
          )}
          aria-label="Aumentar tamanho da fonte"
        >
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            A
          </span>
        </button>

        {/* Percentage Indicator - Compact */}
        <div className="min-w-[40px] text-right">
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            {localSize}%
          </span>
        </div>
      </div>
    </div>
  );
}
