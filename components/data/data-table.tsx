import * as React from "react";
import { cn } from "@/lib/utils";

export function DataTable({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-[var(--shadow-soft)]", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function DataTableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-muted/50 text-muted-foreground">{children}</thead>;
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border/70">{children}</tbody>;
}

export function DataTableRow({ className, children, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr className={cn("transition-colors hover:bg-accent/60", className)} {...props}>
      {children}
    </tr>
  );
}

export function DataTableHead({ className, children, ...props }: React.ComponentProps<"th">) {
  return (
    <th className={cn("px-4 py-3 text-left font-medium text-[var(--fs-sm)]", className)} {...props}>
      {children}
    </th>
  );
}

export function DataTableCell({ className, children, ...props }: React.ComponentProps<"td">) {
  return (
    <td className={cn("px-4 py-2.5 align-middle", className)} {...props}>
      {children}
    </td>
  );
}
