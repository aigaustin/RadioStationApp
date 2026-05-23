"use client";

import { useMemo } from "react";
import { useStations } from "@/hooks/use-stations";
import { cn } from "@/lib/utils";

export function StationSelect({
  value,
  onChange,
  className,
}: {
  value: string | null;
  onChange: (stationId: string | null) => void;
  className?: string;
}) {
  const stations = useStations();
  const items = useMemo(() => stations.data?.items ?? [], [stations.data]);

  return (
    <select
      className={cn(
        "h-10 rounded-[var(--radius-md)] border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={stations.isLoading}
    >
      <option value="">All stations</option>
      {items.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
