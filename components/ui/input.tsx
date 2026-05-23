import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-[var(--radius)] border border-input bg-transparent px-3 py-1.5",
        "text-sm text-foreground placeholder:text-muted-foreground/60",
        "transition-colors duration-150",
        "hover:border-border-strong",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
        "disabled:pointer-events-none disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
