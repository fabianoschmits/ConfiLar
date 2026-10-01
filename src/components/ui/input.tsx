import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "app-input file:text-foreground placeholder:text-[var(--cl-ink-muted)] selection:bg-primary selection:text-primary-foreground flex h-12 w-full min-w-0 rounded-[var(--cl-radius-control)] border border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 py-3 text-base text-[var(--cl-ink)] transition-[border-color,box-shadow] duration-150 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[var(--cl-teal)] focus-visible:ring-[var(--cl-teal)]/30 focus-visible:ring-[3px]",
        "aria-invalid:ring-error-500/20 aria-invalid:border-error-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
