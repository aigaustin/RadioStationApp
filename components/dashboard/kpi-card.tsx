import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  title,
  value,
  hint,
  icon,
  delta,
  deltaLabel,
  accent,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  accent?: string;
}) {
  const isUp = typeof delta === "number" && delta >= 0;
  const deltaText =
    typeof delta === "number"
      ? `${isUp ? "+" : ""}${delta.toFixed(1)}%`
      : null;

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      {/* Accent blob */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full opacity-15 blur-2xl"
        style={{ background: accent ?? "hsl(var(--primary))" }}
      />
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        {icon ? (
          <div
            className="size-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: accent ?? "hsl(var(--primary))" }}
          >
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {deltaText ? (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                isUp ? "text-emerald-500" : "text-rose-500"
              )}
            >
              <TrendingUp className={cn("size-3", !isUp && "rotate-180")} />
              {deltaText}
            </span>
          ) : null}
          {hint ? (
            <span className="text-xs text-muted-foreground">{hint}</span>
          ) : null}
          {deltaLabel ? (
            <span className="text-xs text-muted-foreground">{deltaLabel}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
