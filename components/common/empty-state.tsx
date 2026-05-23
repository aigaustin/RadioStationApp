"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-[var(--shadow-soft)]", className)}>
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="size-10 rounded-[var(--radius-md)] bg-primary/10 ring-1 ring-primary/25 flex items-center justify-center text-primary">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
          {actionLabel && onAction ? (
            <div className="mt-4">
              <Button onClick={onAction}>{actionLabel}</Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
