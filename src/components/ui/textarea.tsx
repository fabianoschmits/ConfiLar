import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "app-input placeholder:text-[var(--cl-ink-muted)] focus-visible:border-[var(--cl-teal)] focus-visible:ring-[var(--cl-teal)]/30 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex min-h-28 w-full rounded-[var(--cl-radius-control)] border border-[var(--cl-border)] bg-[var(--cl-surface)] px-4 py-3 text-base text-[var(--cl-ink)] transition-[border-color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
