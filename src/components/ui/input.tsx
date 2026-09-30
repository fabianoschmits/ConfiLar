import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-10 w-full min-w-0 rounded-xl border border-[var(--cl-border)] bg-[var(--cl-surface)] px-3 py-2 text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[var(--cl-teal)] focus-visible:ring-[var(--cl-teal)]/30 focus-visible:ring-[3px]",
        "aria-invalid:ring-error-500/20 aria-invalid:border-error-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
