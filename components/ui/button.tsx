"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(99,102,241,0.5)] hover:shadow-[0_2px_8px_rgba(99,102,241,0.45)]",
        gradient:
          "gradient-brand text-white hover:opacity-90 active:opacity-80 shadow-[0_2px_8px_rgba(99,102,241,0.40)]",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:border-border-strong transition-colors",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:border-border-strong transition-colors",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90 shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        success:
          "bg-[hsl(var(--success))] text-white hover:opacity-90 shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        xs:      "h-7 px-2.5 text-xs rounded-[var(--radius-sm)] [&_svg]:size-3",
        sm:      "h-8 px-3 text-xs rounded-[var(--radius-sm)] [&_svg]:size-3.5",
        default: "h-9 px-4 text-sm rounded-[var(--radius)] [&_svg]:size-4",
        lg:      "h-10 px-5 text-sm rounded-[var(--radius-lg)] [&_svg]:size-4",
        xl:      "h-12 px-6 text-base rounded-[var(--radius-lg)] [&_svg]:size-5",
        icon:    "h-9 w-9 rounded-[var(--radius)] [&_svg]:size-4",
        "icon-sm":"h-7 w-7 rounded-[var(--radius-sm)] [&_svg]:size-3.5",
        "icon-lg":"h-10 w-10 rounded-[var(--radius-lg)] [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className, variant, size, asChild = false, ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
