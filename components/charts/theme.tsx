import React from "react";
import { ResponsiveContainer, XAxis as RXAxis, YAxis as RYAxis, Tooltip as RTooltip, CartesianGrid as RCartesianGrid, type XAxisProps, type YAxisProps, type CartesianGridProps } from "recharts";

export function ChartXAxis(props: XAxisProps) {
  return (
    <RXAxis
      tickLine={false}
      axisLine={false}
      stroke="hsl(var(--muted-foreground))"
      interval="preserveStartEnd"
      minTickGap={12}
      tickMargin={6}
      {...props}
    />
  );
}

export function ChartYAxis(props: YAxisProps) {
  return (
    <RYAxis
      tickLine={false}
      axisLine={false}
      stroke="hsl(var(--muted-foreground))"
      tickMargin={6}
      width={40}
      {...props}
    />
  );
}

export function ChartTooltip(props: any) {
  const base = {
    background: "hsl(var(--popover))",
    color: "hsl(var(--popover-foreground))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
  } as const;
  const mergedStyle = { ...base, ...(props.contentStyle as any) } as any;
  return <RTooltip {...props} contentStyle={mergedStyle} />;
}

export function ChartGrid(props: CartesianGridProps) {
  return (
    <RCartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" {...props} />
  );
}

type SurfaceSize = "sm" | "md" | "lg" | "xl" | "2xl";

export function ChartSurface({ height, size, className, children }: { height?: number; size?: SurfaceSize; className?: string; children: React.ReactNode }) {
  const styleHeight = typeof height === "number" ? `${height}px` : `var(--chart-h-${size ?? "sm"})`;
  const style = className ? undefined : { height: styleHeight } as React.CSSProperties;
  return (
    <div className={className} style={style}>
      <ResponsiveContainer width="100%" height="100%">
        {children as any}
      </ResponsiveContainer>
    </div>
  );
}
