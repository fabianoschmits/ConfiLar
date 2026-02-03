"use client";

import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldFeedbackProps {
  state: "idle" | "validating" | "valid" | "error";
  message?: string;
  className?: string;
}

export function FormFieldFeedback({
  state,
  message,
  className,
}: FormFieldFeedbackProps) {
  if (state === "idle" || !message) return null;

  const getIcon = () => {
    switch (state) {
      case "validating":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "valid":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (state) {
      case "validating":
        return "text-blue-600";
      case "valid":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 mt-1 text-sm font-medium transition-all duration-200",
        getTextColor(),
        className,
      )}
    >
      {getIcon()}
      <span>{message}</span>
    </div>
  );
}
