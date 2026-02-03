import * as React from "react";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("overflow-auto", className)} {...props}>
    {children}
  </div>
));
ScrollArea.displayName = "ScrollArea";

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-2.5 touch-none select-none transition-colors",
      className,
    )}
    {...props}
  />
));
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };
