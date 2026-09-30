import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20 active:scale-[0.98]",
        outline:
          "border border-[var(--cl-border)] bg-[var(--cl-surface)] shadow-sm hover:bg-[var(--cl-mist)] hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-[var(--cl-mist)] text-[var(--cl-ink)] shadow-sm hover:brightness-95 active:scale-[0.98]",
        ghost:
          "hover:bg-[var(--cl-mist)] hover:text-accent-foreground active:scale-[0.98]",
        link: "text-[var(--cl-teal)] underline-offset-4 hover:underline",
        success:
          "bg-success-500 text-white shadow-sm hover:bg-success-600 active:scale-[0.98] focus-visible:ring-success-500/20",
        warning:
          "bg-warning-500 text-white shadow-sm hover:bg-warning-600 active:scale-[0.98] focus-visible:ring-warning-500/20",
        premium:
          "bg-[var(--cl-teal)] text-white shadow-md hover:brightness-95 active:scale-[0.98] focus-visible:ring-[var(--cl-teal)]/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-xl px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
