"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted/20 ring-1 ring-border/40", className)}
      {...props}
    />
  );
}

export { Skeleton };

