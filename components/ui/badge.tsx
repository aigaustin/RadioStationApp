import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-primary/15 text-primary border border-primary/25 text-[10px] px-2 py-0.5",
        secondary:   "bg-secondary text-secondary-foreground border border-border text-[10px] px-2 py-0.5",
        outline:     "bg-transparent border border-border text-muted-foreground text-[10px] px-2 py-0.5",
        success:     "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] border border-[hsl(var(--success)/0.25)] text-[10px] px-2 py-0.5",
        warning:     "bg-[hsl(var(--warning)/0.12)] text-[hsl(var(--warning))] border border-[hsl(var(--warning)/0.25)] text-[10px] px-2 py-0.5",
        destructive: "bg-[hsl(var(--destructive)/0.12)] text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.25)] text-[10px] px-2 py-0.5",
        live:        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5",
        info:        "bg-sky-500/12 text-sky-400 border border-sky-500/25 text-[10px] px-2 py-0.5",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
