"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function PasswordInput({
  error,
  className,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        className={cn(
          "app-input w-full h-12 px-4 py-3 pr-14 text-base border border-[var(--cl-border)] rounded-[var(--cl-radius-control)] bg-[var(--cl-surface)] text-[var(--cl-ink)] placeholder:text-[var(--cl-ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--cl-teal)]/30 focus:border-[var(--cl-teal)] transition-colors",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        className="absolute right-1 top-1/2 flex h-11 w-11 items-center justify-center rounded-full -translate-y-1/2 text-[var(--cl-ink-muted)] hover:text-[var(--cl-ink)] transition-colors"
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={showPassword}
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
