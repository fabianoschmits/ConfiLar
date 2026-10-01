import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "app-button inline-flex max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[background-color,color,box-shadow,opacity] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--cl-cta)] text-[var(--cl-on-cta)] shadow-sm hover:brightness-110 active:scale-[0.98]",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 focus-visible:ring-destructive/20 active:scale-[0.98]",
        outline:
          "border border-[var(--cl-border)] bg-[var(--cl-surface)] text-[var(--cl-ink)] hover:bg-[var(--cl-mist)] active:scale-[0.98]",
        secondary:
          "bg-[var(--cl-mist)] text-[var(--cl-ink)] shadow-sm hover:brightness-95 active:scale-[0.98]",
        ghost:
          "text-[var(--cl-ink-secondary)] hover:bg-[var(--cl-mist)] hover:text-[var(--cl-ink)] active:scale-[0.98]",
        link: "text-[var(--cl-teal)] underline-offset-4 hover:underline",
        success:
          "bg-success-500 text-white shadow-sm hover:bg-success-600 active:scale-[0.98] focus-visible:ring-success-500/20",
        warning:
          "bg-warning-500 text-white shadow-sm hover:bg-warning-600 active:scale-[0.98] focus-visible:ring-warning-500/20",
        premium:
          "bg-[var(--cl-teal)] text-[var(--cl-on-cta)] shadow-md hover:brightness-95 active:scale-[0.98] focus-visible:ring-[var(--cl-teal)]/20",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-10 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-6 has-[>svg]:px-5",
        icon: "size-11 rounded-2xl",
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
      data-variant={variant || "default"}
      data-size={size || "default"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
