import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-gray-300 dark:border-gray-700",
        success:
          "border-transparent bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200 hover:bg-success-200 dark:hover:bg-success-900/50",
        warning:
          "border-transparent bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-200 hover:bg-warning-200 dark:hover:bg-warning-900/50",
        error:
          "border-transparent bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-200 hover:bg-error-200 dark:hover:bg-error-900/50",
        premium:
          "border-transparent bg-gradient-to-r from-[#008080] to-[var(--cl-teal)] text-white hover:from-[#006666] hover:to-[#009999] shadow-[0_2px_10px_-3px_rgba(0,176,176,0.5)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
